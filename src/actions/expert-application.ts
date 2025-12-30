"use server";

import { generateRandomString } from "better-auth/crypto";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { expertApplication, user } from "@/db/schema";
import { checkExpertEligibility } from "./gamification";
import { createNotification } from "./notifications";

const applicationStatementSchema = z
  .string()
  .min(150, "Statement must be at least 150 characters")
  .max(500, "Statement must be at most 500 characters");

/**
 * Submit Expert application
 */
export async function submitExpertApplication(
  userId: string,
  statement: string,
) {
  try {
    // Check eligibility
    const eligibility = await checkExpertEligibility(userId);
    if (!eligibility.eligible) {
      return {
        success: false,
        error: "You are not eligible for Expert role yet",
        requirements: eligibility.requirements,
      };
    }

    // Check if user already has a pending application
    const existing = await db
      .select()
      .from(expertApplication)
      .where(
        and(
          eq(expertApplication.userId, userId),
          eq(expertApplication.status, "pending"),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      return {
        success: false,
        error: "You already have a pending application",
      };
    }

    // Validate statement
    const validated = applicationStatementSchema.parse(statement);

    // Create application
    const applicationId = generateRandomString(32);
    const votingDeadline = new Date();
    votingDeadline.setDate(votingDeadline.getDate() + 7); // 7 days from now

    await db.insert(expertApplication).values({
      id: applicationId,
      userId,
      statement: validated,
      status: "pending",
      votingDeadline,
      votes: [],
    });

    // Notify all moderators
    const moderators = await db
      .select()
      .from(user)
      .where(eq(user.role, "moderator"));

    for (const moderator of moderators) {
      await createNotification(
        moderator.id,
        "moderation_assigned",
        "New Expert Application",
        `A new Expert application requires your review.`,
        `/moderation/expert-applications/${applicationId}`,
      );
    }

    // Notify applicant
    await createNotification(
      userId,
      "application_status",
      "Application Submitted",
      "Your Expert application has been submitted and is under review.",
      `/dashboard/expert-application`,
    );

    return { success: true, applicationId };
  } catch (error) {
    console.error("Error submitting expert application:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Validation failed",
      };
    }
    return { success: false, error: "Failed to submit application" };
  }
}

/**
 * Get Expert application status
 */
export async function getExpertApplicationStatus(userId: string) {
  try {
    // Optimized: Get application and moderator count in single query
    const applicationWithModCount = await db
      .select({
        application: expertApplication,
        totalModerators: sql<number>`
          (SELECT COUNT(*)::int FROM ${user} WHERE role = 'moderator')
        `.as("total_moderators"),
      })
      .from(expertApplication)
      .where(eq(expertApplication.userId, userId))
      .orderBy(sql`${expertApplication.createdAt} DESC`)
      .limit(1);

    if (applicationWithModCount.length === 0) {
      return null;
    }

    const app = applicationWithModCount[0].application;
    const totalModerators = Number(
      applicationWithModCount[0].totalModerators || 0,
    );
    const votes =
      (app.votes as Array<{
        moderatorId: string;
        vote: "approve" | "reject" | "abstain";
        votedAt: string;
      }>) || [];

    const approveCount = votes.filter((v) => v.vote === "approve").length;
    const rejectCount = votes.filter((v) => v.vote === "reject").length;
    const abstainCount = votes.filter((v) => v.vote === "abstain").length;

    return {
      ...app,
      votes,
      voteCounts: {
        approve: approveCount,
        reject: rejectCount,
        abstain: abstainCount,
        total: votes.length,
        needed: 3, // Need 3 approvals
        totalModerators,
      },
    };
  } catch (error) {
    console.error("Error getting expert application status:", error);
    return null;
  }
}

/**
 * Vote on Expert application (for moderators)
 */
export async function voteOnExpertApplication(
  moderatorId: string,
  applicationId: string,
  vote: "approve" | "reject" | "abstain",
) {
  try {
    // Optimized: Check moderator and get application in single query
    const moderatorAndApplication = await db
      .select({
        moderator: user,
        application: expertApplication,
      })
      .from(user)
      .innerJoin(
        expertApplication,
        and(
          eq(expertApplication.id, applicationId),
          eq(expertApplication.status, "pending"),
        ),
      )
      .where(and(eq(user.id, moderatorId), eq(user.role, "moderator")))
      .limit(1);

    if (moderatorAndApplication.length === 0) {
      return {
        success: false,
        error: "Only moderators can vote or application not found",
      };
    }

    const app = moderatorAndApplication[0].application;
    const votes =
      (app.votes as Array<{
        moderatorId: string;
        vote: "approve" | "reject" | "abstain";
        votedAt: string;
      }>) || [];

    // Check if already voted
    const existingVote = votes.find((v) => v.moderatorId === moderatorId);
    if (existingVote) {
      return { success: false, error: "You have already voted" };
    }

    // Add vote
    const newVote = {
      moderatorId,
      vote,
      votedAt: new Date().toISOString(),
    };
    votes.push(newVote);

    // Check if we have enough approvals
    const approveCount = votes.filter((v) => v.vote === "approve").length;
    let newStatus = app.status;
    if (approveCount >= 3) {
      newStatus = "approved";
      // Update user role to expert
      await db
        .update(user)
        .set({ role: "expert" })
        .where(eq(user.id, app.userId));

      // Notify applicant
      await createNotification(
        app.userId,
        "application_status",
        "Application Approved! 🎉",
        "Congratulations! Your Expert application has been approved.",
        `/dashboard`,
      );
    } else if (votes.length >= 8) {
      // If 8 moderators voted and we don't have 3 approvals, likely rejected
      const rejectCount = votes.filter((v) => v.vote === "reject").length;
      if (rejectCount > approveCount) {
        newStatus = "rejected";
        await createNotification(
          app.userId,
          "application_status",
          "Application Status Update",
          "Your Expert application was not approved.",
          `/dashboard/expert-application`,
        );
      }
    }

    // Update application
    await db
      .update(expertApplication)
      .set({
        votes,
        status: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(expertApplication.id, applicationId));

    return { success: true };
  } catch (error) {
    console.error("Error voting on expert application:", error);
    return { success: false, error: "Failed to submit vote" };
  }
}

/**
 * Withdraw Expert application
 */
export async function withdrawExpertApplication(
  userId: string,
  applicationId: string,
) {
  try {
    const application = await db
      .select()
      .from(expertApplication)
      .where(
        and(
          eq(expertApplication.id, applicationId),
          eq(expertApplication.userId, userId),
          eq(expertApplication.status, "pending"),
        ),
      )
      .limit(1);

    if (application.length === 0) {
      return { success: false, error: "Application not found" };
    }

    await db
      .update(expertApplication)
      .set({
        status: "withdrawn",
        updatedAt: new Date(),
      })
      .where(eq(expertApplication.id, applicationId));

    return { success: true };
  } catch (error) {
    console.error("Error withdrawing expert application:", error);
    return { success: false, error: "Failed to withdraw application" };
  }
}
