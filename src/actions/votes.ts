"use server";

import { generateRandomString } from "better-auth/crypto";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
  report,
  reportComment,
  reportCommentVote,
  reportVote,
} from "@/db/schema";
import { checkOnboardingFromSession } from "@/lib/session-utils";
import { commentVoteSchema, reportVoteSchema } from "@/lib/validations";

/**
 * Vote on report
 */
export async function voteReport(
  userId: string,
  voteData: z.infer<typeof reportVoteSchema>,
) {
  try {
    // Check onboarding completion from session
    const onboardingCompleted = await checkOnboardingFromSession();
    if (onboardingCompleted === null) {
      return { success: false, error: "Please sign in to vote" };
    }
    if (!onboardingCompleted) {
      return {
        success: false,
        error: "Please complete onboarding before voting",
      };
    }

    // Validate input
    const validated = reportVoteSchema.parse(voteData);

    // Check if user already voted
    const existing = await db
      .select()
      .from(reportVote)
      .where(
        and(
          eq(reportVote.reportId, validated.reportId),
          eq(reportVote.userId, userId),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing vote
      await db
        .update(reportVote)
        .set({
          voteType: validated.voteType,
        })
        .where(eq(reportVote.id, existing[0].id));
    } else {
      // Create new vote
      await db.insert(reportVote).values({
        id: generateRandomString(32),
        reportId: validated.reportId,
        userId,
        voteType: validated.voteType,
      });
    }

    // Update report vote counts
    const upvotes = await db
      .select({ count: sql<number>`count(*)` })
      .from(reportVote)
      .where(
        and(
          eq(reportVote.reportId, validated.reportId),
          eq(reportVote.voteType, "up"),
        ),
      );

    const downvotes = await db
      .select({ count: sql<number>`count(*)` })
      .from(reportVote)
      .where(
        and(
          eq(reportVote.reportId, validated.reportId),
          eq(reportVote.voteType, "down"),
        ),
      );

    await db
      .update(report)
      .set({
        upvotes: Number(upvotes[0]?.count || 0),
        downvotes: Number(downvotes[0]?.count || 0),
        updatedAt: new Date(),
      })
      .where(eq(report.id, validated.reportId));

    return { success: true };
  } catch (error) {
    console.error("Error voting on report:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Validation failed",
      };
    }
    return { success: false, error: "Failed to vote on report" };
  }
}

/**
 * Vote on comment
 */
export async function voteComment(
  userId: string,
  voteData: z.infer<typeof commentVoteSchema>,
) {
  try {
    // Check onboarding completion from session
    const onboardingCompleted = await checkOnboardingFromSession();
    if (onboardingCompleted === null) {
      return { success: false, error: "Please sign in to vote" };
    }
    if (!onboardingCompleted) {
      return {
        success: false,
        error: "Please complete onboarding before voting",
      };
    }

    // Validate input
    const validated = commentVoteSchema.parse(voteData);

    // Check if user already voted
    const existing = await db
      .select()
      .from(reportCommentVote)
      .where(
        and(
          eq(reportCommentVote.commentId, validated.commentId),
          eq(reportCommentVote.userId, userId),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing vote
      await db
        .update(reportCommentVote)
        .set({
          voteType: validated.voteType,
        })
        .where(eq(reportCommentVote.id, existing[0].id));
    } else {
      // Create new vote
      await db.insert(reportCommentVote).values({
        id: generateRandomString(32),
        commentId: validated.commentId,
        userId,
        voteType: validated.voteType,
      });
    }

    // Update comment vote counts
    const upvotes = await db
      .select({ count: sql<number>`count(*)` })
      .from(reportCommentVote)
      .where(
        and(
          eq(reportCommentVote.commentId, validated.commentId),
          eq(reportCommentVote.voteType, "up"),
        ),
      );

    const downvotes = await db
      .select({ count: sql<number>`count(*)` })
      .from(reportCommentVote)
      .where(
        and(
          eq(reportCommentVote.commentId, validated.commentId),
          eq(reportCommentVote.voteType, "down"),
        ),
      );

    await db
      .update(reportComment)
      .set({
        upvotes: Number(upvotes[0]?.count || 0),
        downvotes: Number(downvotes[0]?.count || 0),
        updatedAt: new Date(),
      })
      .where(eq(reportComment.id, validated.commentId));

    return { success: true };
  } catch (error) {
    console.error("Error voting on comment:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Validation failed",
      };
    }
    return { success: false, error: "Failed to vote on comment" };
  }
}

/**
 * Get report votes
 */
export async function getReportVotes(reportId: string) {
  try {
    const votes = await db
      .select()
      .from(reportVote)
      .where(eq(reportVote.reportId, reportId));

    const upvotes = votes.filter((v) => v.voteType === "up").length;
    const downvotes = votes.filter((v) => v.voteType === "down").length;

    return { upvotes, downvotes, total: votes.length };
  } catch (error) {
    console.error("Error getting report votes:", error);
    return { upvotes: 0, downvotes: 0, total: 0 };
  }
}

/**
 * Get user vote on report
 */
export async function getUserVote(reportId: string, userId: string) {
  try {
    const vote = await db
      .select()
      .from(reportVote)
      .where(
        and(eq(reportVote.reportId, reportId), eq(reportVote.userId, userId)),
      )
      .limit(1);

    return vote[0] || null;
  } catch (error) {
    console.error("Error getting user vote:", error);
    return null;
  }
}
