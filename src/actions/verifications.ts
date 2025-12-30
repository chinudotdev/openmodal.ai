"use server";

import { generateRandomString } from "better-auth/crypto";
import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { cacheLife } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import {
  report,
  reportDispute,
  reportVerification,
  reputationHistory,
  user,
  userBadge,
  userProfile,
  userReputation,
} from "@/db/schema";
import { checkOnboardingFromSession } from "@/lib/session-utils";
import { disputeSchema, verificationSchema } from "@/lib/validations";

/**
 * Verify report
 */
export async function verifyReport(
  userId: string,
  verificationData: z.infer<typeof verificationSchema>,
) {
  try {
    // Check onboarding completion from session
    const onboardingCompleted = await checkOnboardingFromSession();
    if (onboardingCompleted === null) {
      return { success: false, error: "Please sign in to verify reports" };
    }
    if (!onboardingCompleted) {
      return {
        success: false,
        error: "Please complete onboarding before verifying reports",
      };
    }

    // Validate input
    const validated = verificationSchema.parse(verificationData);

    // Optimized: Check report and existing verification in single query
    const reportAndExisting = await db
      .select({
        report,
        existingVerification: reportVerification,
      })
      .from(report)
      .leftJoin(
        reportVerification,
        and(
          eq(reportVerification.reportId, report.id),
          eq(reportVerification.userId, userId),
          isNull(reportVerification.deletedAt),
        ),
      )
      .where(and(eq(report.id, validated.reportId), isNull(report.deletedAt)))
      .limit(1);

    if (reportAndExisting.length === 0) {
      return { success: false, error: "Report not found" };
    }

    const reportData = [reportAndExisting[0].report];
    const existing = reportAndExisting[0].existingVerification
      ? [reportAndExisting[0].existingVerification]
      : [];

    if (existing.length > 0) {
      return {
        success: false,
        error: "You have already verified/disputed this report",
      };
    }

    // Create verification
    const verificationId = generateRandomString(32);
    await db.insert(reportVerification).values({
      id: verificationId,
      reportId: validated.reportId,
      userId,
      canVerify: validated.canVerify,
      source: validated.source,
      comment: validated.comment || null,
      evidenceLinks: validated.evidenceLinks || [],
    });

    // Update report verification count
    if (validated.canVerify) {
      await db
        .update(report)
        .set({
          verificationCount: reportData[0].verificationCount + 1,
          updatedAt: new Date(),
        })
        .where(eq(report.id, validated.reportId));

      // Optimized: Get both reputations in single query, then update
      const reputations = await db
        .select({
          userId: userReputation.userId,
          reputationPoints: userReputation.reputationPoints,
        })
        .from(userReputation)
        .where(
          sql`${userReputation.userId} IN (${userId}, ${reportData[0].userId})`,
        );

      const verifierRep = reputations.find((r) => r.userId === userId);
      const authorRep = reputations.find(
        (r) => r.userId === reportData[0].userId,
      );

      const verifierPoints = verifierRep?.reputationPoints || 0;
      const verifierNewPoints = verifierPoints + 10;
      const verifierTier =
        verifierNewPoints < 200
          ? "observer"
          : verifierNewPoints < 1000
            ? "contributor"
            : verifierNewPoints < 5000
              ? "trusted"
              : "expert";

      const authorPoints = authorRep?.reputationPoints || 0;
      const authorNewPoints = authorPoints + 20;
      const authorTier =
        authorNewPoints < 200
          ? "observer"
          : authorNewPoints < 1000
            ? "contributor"
            : authorNewPoints < 5000
              ? "trusted"
              : "expert";

      // Update both reputations in parallel
      await Promise.all([
        verifierRep
          ? db
              .update(userReputation)
              .set({
                reputationPoints: verifierNewPoints,
                tier: verifierTier,
                updatedAt: new Date(),
              })
              .where(eq(userReputation.userId, userId))
          : db.insert(userReputation).values({
              id: generateRandomString(32),
              userId,
              reputationPoints: verifierNewPoints,
              tier: verifierTier,
            }),
        authorRep
          ? db
              .update(userReputation)
              .set({
                reputationPoints: authorNewPoints,
                tier: authorTier,
                updatedAt: new Date(),
              })
              .where(eq(userReputation.userId, reportData[0].userId))
          : db.insert(userReputation).values({
              id: generateRandomString(32),
              userId: reportData[0].userId,
              reputationPoints: authorNewPoints,
              tier: authorTier,
            }),
        db.insert(reputationHistory).values({
          id: generateRandomString(32),
          userId,
          pointsChange: 10,
          reason: "verification",
          relatedEntityType: "verification",
          relatedEntityId: verificationId,
        }),
        db.insert(reputationHistory).values({
          id: generateRandomString(32),
          userId: reportData[0].userId,
          pointsChange: 20,
          reason: "report_verified",
          relatedEntityType: "verification",
          relatedEntityId: verificationId,
        }),
      ]);
    }

    return { success: true, verificationId };
  } catch (error) {
    console.error("Error verifying report:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Validation failed",
      };
    }
    return { success: false, error: "Failed to verify report" };
  }
}

/**
 * Dispute report
 */
export async function disputeReport(
  userId: string,
  disputeData: z.infer<typeof disputeSchema>,
) {
  try {
    // Check onboarding completion from session
    const onboardingCompleted = await checkOnboardingFromSession();
    if (onboardingCompleted === null) {
      return { success: false, error: "Please sign in to dispute reports" };
    }
    if (!onboardingCompleted) {
      return {
        success: false,
        error: "Please complete onboarding before disputing reports",
      };
    }

    // Validate input
    const validated = disputeSchema.parse(disputeData);

    // Check if report exists
    const reportData = await db
      .select()
      .from(report)
      .where(and(eq(report.id, validated.reportId), isNull(report.deletedAt)))
      .limit(1);

    if (reportData.length === 0) {
      return { success: false, error: "Report not found" };
    }

    // Check if user already disputed this report
    const existing = await db
      .select()
      .from(reportDispute)
      .where(
        and(
          eq(reportDispute.reportId, validated.reportId),
          eq(reportDispute.userId, userId),
          isNull(reportDispute.deletedAt),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      return { success: false, error: "You have already disputed this report" };
    }

    // Create dispute
    const disputeId = generateRandomString(32);
    await db.insert(reportDispute).values({
      id: disputeId,
      reportId: validated.reportId,
      userId,
      reason: validated.reason,
      explanation: validated.explanation,
      evidenceLinks: validated.evidenceLinks,
    });

    return { success: true, disputeId };
  } catch (error) {
    console.error("Error disputing report:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Validation failed",
      };
    }
    return { success: false, error: "Failed to dispute report" };
  }
}

/**
 * Soft delete verification (only if report not verified by others)
 */
export async function softDeleteVerification(
  verificationId: string,
  userId: string,
) {
  try {
    // Check onboarding completion from session
    const onboardingCompleted = await checkOnboardingFromSession();
    if (onboardingCompleted === null) {
      return {
        success: false,
        error: "Please sign in to delete verifications",
      };
    }
    if (!onboardingCompleted) {
      return {
        success: false,
        error: "Please complete onboarding before deleting verifications",
      };
    }

    // Check if verification exists and belongs to user
    const existing = await db
      .select()
      .from(reportVerification)
      .where(
        and(
          eq(reportVerification.id, verificationId),
          eq(reportVerification.userId, userId),
          isNull(reportVerification.deletedAt),
        ),
      )
      .limit(1);

    if (existing.length === 0) {
      return { success: false, error: "Verification not found" };
    }

    // Check if report has other verifications
    const reportVerifications = await db
      .select()
      .from(reportVerification)
      .where(
        and(
          eq(reportVerification.reportId, existing[0].reportId),
          isNull(reportVerification.deletedAt),
        ),
      );

    if (reportVerifications.length > 1) {
      return {
        success: false,
        error: "Cannot delete verification when report has other verifications",
      };
    }

    // Soft delete
    await db
      .update(reportVerification)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(reportVerification.id, verificationId));

    // Update report verification count
    if (existing[0].canVerify) {
      const reportData = await db
        .select()
        .from(report)
        .where(eq(report.id, existing[0].reportId))
        .limit(1);

      if (reportData.length > 0) {
        await db
          .update(report)
          .set({
            verificationCount: Math.max(0, reportData[0].verificationCount - 1),
            updatedAt: new Date(),
          })
          .where(eq(report.id, existing[0].reportId));
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error soft deleting verification:", error);
    return { success: false, error: "Failed to delete verification" };
  }
}

/**
 * Soft delete dispute (only if not verified/resolved)
 */
export async function softDeleteDispute(disputeId: string, userId: string) {
  try {
    // Check onboarding completion from session
    const onboardingCompleted = await checkOnboardingFromSession();
    if (onboardingCompleted === null) {
      return { success: false, error: "Please sign in to delete disputes" };
    }
    if (!onboardingCompleted) {
      return {
        success: false,
        error: "Please complete onboarding before deleting disputes",
      };
    }

    // Check if dispute exists and belongs to user
    const existing = await db
      .select()
      .from(reportDispute)
      .where(
        and(
          eq(reportDispute.id, disputeId),
          eq(reportDispute.userId, userId),
          isNull(reportDispute.deletedAt),
        ),
      )
      .limit(1);

    if (existing.length === 0) {
      return { success: false, error: "Dispute not found" };
    }

    // Soft delete
    await db
      .update(reportDispute)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(reportDispute.id, disputeId));

    return { success: true };
  } catch (error) {
    console.error("Error soft deleting dispute:", error);
    return { success: false, error: "Failed to delete dispute" };
  }
}

/**
 * Get report verifications
 */
export async function getReportVerifications(reportId: string) {
  "use cache";
  cacheLife({ stale: 900, revalidate: 3600 * 1 });
  try {
    // Optimized: Single query with JSON aggregation for badges
    const verifications = await db
      .select({
        verification: reportVerification,
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          displayUsername: user.displayUsername,
          image: user.image,
        },
        profile: {
          displayName: userProfile.displayName,
          industry: userProfile.industry,
          location: userProfile.location,
          country: userProfile.country,
          stateProvince: userProfile.stateProvince,
          city: userProfile.city,
        },
        reputation: {
          reputationPoints: userReputation.reputationPoints,
          tier: userReputation.tier,
        },
        badges: sql<Array<typeof userBadge.$inferSelect>>`
          COALESCE(
            (SELECT json_agg(b.* ORDER BY b.earned_at DESC)
             FROM ${userBadge} b
             WHERE b.user_id = ${reportVerification.userId}),
            '[]'::json
          )
        `.as("badges"),
      })
      .from(reportVerification)
      .leftJoin(user, eq(reportVerification.userId, user.id))
      .leftJoin(userProfile, eq(userProfile.userId, user.id))
      .leftJoin(userReputation, eq(userReputation.userId, user.id))
      .where(
        and(
          eq(reportVerification.reportId, reportId),
          isNull(reportVerification.deletedAt),
        ),
      )
      .orderBy(desc(reportVerification.createdAt));

    return verifications.map((entry) => ({
      ...entry.verification,
      user: entry.user || null,
      profile: entry.profile || null,
      reputation: entry.reputation || null,
      badges: entry.badges || [],
    }));
  } catch (error) {
    console.error("Error getting report verifications:", error);
    return [];
  }
}

/**
 * Get user's verifications
 */
export async function getUserVerifications(userId: string) {
  try {
    const verifications = await db
      .select()
      .from(reportVerification)
      .where(
        and(
          eq(reportVerification.userId, userId),
          isNull(reportVerification.deletedAt),
        ),
      )
      .orderBy(desc(reportVerification.createdAt));

    return verifications;
  } catch (error) {
    console.error("Error getting user verifications:", error);
    return [];
  }
}
