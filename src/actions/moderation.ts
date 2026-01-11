"use server";

import { generateRandomString } from "better-auth/crypto";
import { and, desc, eq, exists, inArray, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
  report,
  reportDispute,
  reputationHistory,
  userReputation,
} from "@/db/schema";
import {
  approveReportSchema,
  rejectReportSchema,
  requestChangesSchema,
} from "@/lib/validations";

/**
 * Get pending reports
 */
export async function getPendingReports(limit = 20, offset = 0) {
  try {
    const reports = await db
      .select()
      .from(report)
      .where(and(eq(report.status, "pending"), isNull(report.deletedAt)))
      .orderBy(desc(report.createdAt))
      .limit(limit)
      .offset(offset);

    return reports;
  } catch (error) {
    console.error("Error getting pending reports:", error);
    return [];
  }
}

/**
 * Approve report
 */
export async function approveReportAction(
  moderatorId: string,
  approvalData: z.infer<typeof approveReportSchema>,
) {
  try {
    // Validate input
    const validated = approveReportSchema.parse(approvalData);

    // Check if report exists
    const reportData = await db
      .select()
      .from(report)
      .where(and(eq(report.id, validated.reportId), isNull(report.deletedAt)))
      .limit(1);

    if (reportData.length === 0) {
      return { success: false, error: "Report not found" };
    }

    // Update report status
    await db
      .update(report)
      .set({
        status: "approved",
        moderationNotes: validated.moderationNotes || null,
        moderatedBy: moderatorId,
        moderatedAt: new Date(),
        publishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(report.id, validated.reportId));

    // Award reputation points to author
    const pointsToAward =
      reportData[0].type === "deployment"
        ? 100
        : reportData[0].type === "barrier"
          ? 75
          : 50;

    const authorReputation = await db
      .select()
      .from(userReputation)
      .where(eq(userReputation.userId, reportData[0].userId))
      .limit(1);

    const authorPoints = authorReputation[0]?.reputationPoints || 0;
    const authorNewPoints = authorPoints + pointsToAward;
    const authorTier =
      authorNewPoints < 200
        ? "observer"
        : authorNewPoints < 1000
          ? "contributor"
          : authorNewPoints < 5000
            ? "trusted"
            : "expert";

    if (authorReputation.length === 0) {
      await db.insert(userReputation).values({
        id: generateRandomString(32),
        userId: reportData[0].userId,
        reputationPoints: authorNewPoints,
        tier: authorTier,
      });
    } else {
      await db
        .update(userReputation)
        .set({
          reputationPoints: authorNewPoints,
          tier: authorTier,
          updatedAt: new Date(),
        })
        .where(eq(userReputation.userId, reportData[0].userId));
    }

    await db.insert(reputationHistory).values({
      id: generateRandomString(32),
      userId: reportData[0].userId,
      pointsChange: pointsToAward,
      reason: "report_approved",
      relatedEntityType: "report",
      relatedEntityId: validated.reportId,
    });

    return { success: true, pointsAwarded: pointsToAward };
  } catch (error) {
    console.error("Error approving report:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Validation failed",
      };
    }
    return { success: false, error: "Failed to approve report" };
  }
}

/**
 * Reject report
 */
export async function rejectReport(
  moderatorId: string,
  rejectionData: z.infer<typeof rejectReportSchema>,
) {
  try {
    // Validate input
    const validated = rejectReportSchema.parse(rejectionData);

    // Check if report exists
    const reportData = await db
      .select()
      .from(report)
      .where(and(eq(report.id, validated.reportId), isNull(report.deletedAt)))
      .limit(1);

    if (reportData.length === 0) {
      return { success: false, error: "Report not found" };
    }

    // Update report status
    await db
      .update(report)
      .set({
        status: "rejected",
        moderationReason: validated.moderationReason,
        moderationNotes: validated.moderationNotes || null,
        moderatedBy: moderatorId,
        moderatedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(report.id, validated.reportId));

    return { success: true };
  } catch (error) {
    console.error("Error rejecting report:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Validation failed",
      };
    }
    return { success: false, error: "Failed to reject report" };
  }
}

/**
 * Request changes to report
 */
export async function requestReportChanges(
  moderatorId: string,
  changesData: z.infer<typeof requestChangesSchema>,
) {
  try {
    // Validate input
    const validated = requestChangesSchema.parse(changesData);

    // Check if report exists
    const reportData = await db
      .select()
      .from(report)
      .where(and(eq(report.id, validated.reportId), isNull(report.deletedAt)))
      .limit(1);

    if (reportData.length === 0) {
      return { success: false, error: "Report not found" };
    }

    // Update report status
    await db
      .update(report)
      .set({
        status: "changes_requested",
        moderationNotes: validated.moderationNotes,
        moderatedBy: moderatorId,
        moderatedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(report.id, validated.reportId));

    return { success: true };
  } catch (error) {
    console.error("Error requesting changes:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Validation failed",
      };
    }
    return { success: false, error: "Failed to request changes" };
  }
}

/**
 * Get reports with disputes
 */
export async function getDisputedReports(limit = 20, offset = 0) {
  try {
    // Get reports that have at least one dispute
    const reports = await db
      .select()
      .from(report)
      .where(
        and(
          exists(
            db
              .select()
              .from(reportDispute)
              .where(
                and(
                  eq(reportDispute.reportId, report.id),
                  isNull(reportDispute.deletedAt),
                ),
              ),
          ),
          isNull(report.deletedAt),
        ),
      )
      .orderBy(desc(report.createdAt))
      .limit(limit)
      .offset(offset);

    return reports;
  } catch (error) {
    console.error("Error getting disputed reports:", error);
    return [];
  }
}

/**
 * Get flagged reports (reports with high downvote ratio or many disputes)
 */
export async function getFlaggedReports(limit = 20, offset = 0) {
  try {
    // Get reports with high downvote ratio (downvotes > upvotes) or many disputes
    const reports = await db
      .select()
      .from(report)
      .where(
        and(
          sql`${report.downvotes} > ${report.upvotes}`,
          sql`${report.downvotes} > 3`,
          isNull(report.deletedAt),
        ),
      )
      .orderBy(desc(report.downvotes), desc(report.createdAt))
      .limit(limit)
      .offset(offset);

    return reports;
  } catch (error) {
    console.error("Error getting flagged reports:", error);
    return [];
  }
}

/**
 * Get moderation statistics
 */
export async function getModerationStats() {
  try {
    // Optimized: Single query with conditional aggregations for all stats
    const stats = await db
      .select({
        pending: sql<number>`
          COUNT(*) FILTER (WHERE status = 'pending' AND deleted_at IS NULL)::int
        `.as("pending"),
        approved: sql<number>`
          COUNT(*) FILTER (WHERE status = 'approved' AND deleted_at IS NULL)::int
        `.as("approved"),
        rejected: sql<number>`
          COUNT(*) FILTER (WHERE status = 'rejected' AND deleted_at IS NULL)::int
        `.as("rejected"),
        changesRequested: sql<number>`
          COUNT(*) FILTER (WHERE status = 'changes_requested' AND deleted_at IS NULL)::int
        `.as("changes_requested"),
        disputed: sql<number>`
          COUNT(*) FILTER (
            WHERE deleted_at IS NULL
              AND EXISTS (
                SELECT 1 FROM ${reportDispute}
                WHERE report_id = ${report.id}
                  AND deleted_at IS NULL
              )
          )::int
        `.as("disputed"),
        flagged: sql<number>`
          COUNT(*) FILTER (
            WHERE deleted_at IS NULL
              AND downvotes > upvotes
              AND downvotes > 3
          )::int
        `.as("flagged"),
      })
      .from(report);

    const result = stats[0];

    return {
      pending: result?.pending || 0,
      approved: result?.approved || 0,
      rejected: result?.rejected || 0,
      changesRequested: result?.changesRequested || 0,
      disputed: result?.disputed || 0,
      flagged: result?.flagged || 0,
    };
  } catch (error) {
    console.error("Error getting moderation stats:", error);
    return {
      pending: 0,
      approved: 0,
      rejected: 0,
      changesRequested: 0,
      disputed: 0,
      flagged: 0,
    };
  }
}
