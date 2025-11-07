"use server";

import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  capabilityTracking,
  jobTracking,
  report,
  reportComment,
  reportVerification,
  userBadge,
  userProfile,
  userReputation,
} from "@/db/schema";
import { cacheLife, cacheTag } from "next/cache";

/**
 * Get user dashboard data
 */
export async function getUserDashboard(userId: string) {
  "use cache";
  cacheLife({ stale: 300, revalidate: 3600 * 2 });
  cacheTag(`dashboard:${userId}`);

  try {
    // Single query with LEFT JOINs and JSON aggregation subqueries
    const result = await db
      .select({
        reputation: userReputation,
        profile: userProfile,
        badges: sql<Array<typeof userBadge.$inferSelect>>`
          COALESCE(
            (SELECT json_agg(b.* ORDER BY b.earned_at DESC)
             FROM ${userBadge} b
             WHERE b.user_id = ${sql`${userId}`}),
            '[]'::json
          )
        `.as("badges"),
        reports: sql<Array<typeof report.$inferSelect>>`
          COALESCE(
            (SELECT json_agg(r.* ORDER BY r.created_at DESC)
             FROM (
               SELECT * FROM ${report}
               WHERE user_id = ${sql`${userId}`}
                 AND deleted_at IS NULL
               ORDER BY created_at DESC
               LIMIT 10
             ) r),
            '[]'::json
          )
        `.as("reports"),
        trackedJobs: sql<Array<typeof jobTracking.$inferSelect>>`
          COALESCE(
            (SELECT json_agg(jt.*)
             FROM (
               SELECT * FROM ${jobTracking}
               WHERE user_id = ${sql`${userId}`}
               LIMIT 10
             ) jt),
            '[]'::json
          )
        `.as("tracked_jobs"),
        trackedCapabilities: sql<Array<typeof capabilityTracking.$inferSelect>>`
          COALESCE(
            (SELECT json_agg(ct.*)
             FROM (
               SELECT * FROM ${capabilityTracking}
               WHERE user_id = ${sql`${userId}`}
               LIMIT 10
             ) ct),
            '[]'::json
          )
        `.as("tracked_capabilities"),
        statsReports: sql<number>`
          (SELECT COUNT(*) FROM ${report}
           WHERE user_id = ${sql.raw(`'${userId}'`)}
             AND deleted_at IS NULL)
        `.as("stats_reports"),
        statsVerifications: sql<number>`
          (SELECT COUNT(*) FROM ${reportVerification}
           WHERE user_id = ${sql.raw(`'${userId}'`)}
             AND deleted_at IS NULL
             AND can_verify = true)
        `.as("stats_verifications"),
        statsComments: sql<number>`
          (SELECT COUNT(*) FROM ${reportComment}
           WHERE user_id = ${sql.raw(`'${userId}'`)}
             AND deleted_at IS NULL)
        `.as("stats_comments"),
      })
      .from(userReputation)
      .leftJoin(userProfile, eq(userProfile.userId, userReputation.userId))
      .where(eq(userReputation.userId, userId))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const data = result[0];

    return {
      reputation: data.reputation || null,
      badges: (data.badges || []) as (typeof userBadge.$inferSelect)[],
      profile: data.profile || null,
      stats: {
        reports: Number(data.statsReports || 0),
        verifications: Number(data.statsVerifications || 0),
        comments: Number(data.statsComments || 0),
      },
      reports: (data.reports || []) as (typeof report.$inferSelect)[],
      trackedJobs: (data.trackedJobs ||
        []) as (typeof jobTracking.$inferSelect)[],
      trackedCapabilities: (data.trackedCapabilities ||
        []) as (typeof capabilityTracking.$inferSelect)[],
    };
  } catch (error) {
    console.error("Error getting user dashboard:", error);
    return null;
  }
}

/**
 * Get user reputation
 */
export async function getUserReputation(userId: string) {
  try {
    const result = await db
      .select()
      .from(userReputation)
      .where(eq(userReputation.userId, userId))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("Error getting user reputation:", error);
    return null;
  }
}

/**
 * Get user stats (reports, verifications, comments)
 */
export async function getUserStats(userId: string) {
  try {
    // Count user reports (excluding soft-deleted)
    const reportsCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(report)
      .where(and(eq(report.userId, userId), isNull(report.deletedAt)));

    // Count user verifications (excluding soft-deleted)
    const verificationsCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(reportVerification)
      .where(
        and(
          eq(reportVerification.userId, userId),
          isNull(reportVerification.deletedAt),
          eq(reportVerification.canVerify, true),
        ),
      );

    // Count user comments (excluding soft-deleted)
    const commentsCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(reportComment)
      .where(
        and(eq(reportComment.userId, userId), isNull(reportComment.deletedAt)),
      );

    return {
      reports: Number(reportsCount[0]?.count || 0),
      verifications: Number(verificationsCount[0]?.count || 0),
      comments: Number(commentsCount[0]?.count || 0),
    };
  } catch (error) {
    console.error("Error getting user stats:", error);
    return {
      reports: 0,
      verifications: 0,
      comments: 0,
    };
  }
}
