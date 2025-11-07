"use server";

import { and, desc, eq, isNull, sql } from "drizzle-orm";
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

/**
 * Get user dashboard data
 */
export async function getUserDashboard(userId: string) {
  try {
    // Get user reputation
    const reputation = await db
      .select()
      .from(userReputation)
      .where(eq(userReputation.userId, userId))
      .limit(1);

    // Get user badges
    const badges = await db
      .select()
      .from(userBadge)
      .where(eq(userBadge.userId, userId))
      .orderBy(desc(userBadge.earnedAt));

    // Get user profile
    const profile = await db
      .select()
      .from(userProfile)
      .where(eq(userProfile.userId, userId))
      .limit(1);

    // Get user stats
    const stats = await getUserStats(userId);

    // Get user reports
    const reports = await db
      .select()
      .from(report)
      .where(and(eq(report.userId, userId), isNull(report.deletedAt)))
      .orderBy(desc(report.createdAt))
      .limit(10);

    // Get tracked jobs
    const trackedJobs = await db
      .select()
      .from(jobTracking)
      .where(eq(jobTracking.userId, userId))
      .limit(10);

    // Get tracked capabilities
    const trackedCapabilities = await db
      .select()
      .from(capabilityTracking)
      .where(eq(capabilityTracking.userId, userId))
      .limit(10);

    return {
      reputation: reputation[0] || null,
      badges: badges || [],
      profile: profile[0] || null,
      stats,
      reports: reports || [],
      trackedJobs: trackedJobs || [],
      trackedCapabilities: trackedCapabilities || [],
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
