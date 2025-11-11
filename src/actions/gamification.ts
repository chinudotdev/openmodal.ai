"use server";

import { and, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  activityLog,
  report,
  reportVerification,
  user,
  userBadge,
  userReputation,
  userStreak,
} from "@/db/schema";
import { cacheLife, cacheTag } from "next/cache";
import { generateRandomString } from "better-auth/crypto";

/**
 * Record user activity for streak tracking
 */
export async function recordActivity(
  userId: string,
  activityType:
    | "login"
    | "report_submitted"
    | "verification_completed"
    | "comment_created"
    | "upvote_given",
  relatedEntityType?: string,
  relatedEntityId?: string
) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if activity already logged for today
    const todayStr = today.toISOString().split("T")[0];
    const existingActivity = await db
      .select()
      .from(activityLog)
      .where(
        and(
          eq(activityLog.userId, userId),
          eq(activityLog.activityType, activityType),
          sql`${activityLog.activityDate} = ${todayStr}::date`
        )
      )
      .limit(1);

    if (existingActivity.length > 0) {
      return { success: true, alreadyLogged: true };
    }

    // Log activity
    await db.insert(activityLog).values({
      id: generateRandomString(32),
      userId,
      activityType,
      activityDate: todayStr,
      relatedEntityType: relatedEntityType || null,
      relatedEntityId: relatedEntityId || null,
    });

    // Update activity streak
    await updateActivityStreak(userId);

    return { success: true };
  } catch (error) {
    console.error("Error recording activity:", error);
    return { success: false, error: "Failed to record activity" };
  }
}

/**
 * Update user's activity streak
 */
async function updateActivityStreak(userId: string) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Get user's current streak
    const streakData = await db
      .select()
      .from(userStreak)
      .where(
        and(
          eq(userStreak.userId, userId),
          eq(userStreak.streakType, "activity")
        )
      )
      .limit(1);

    const currentStreak = streakData[0];

    // Check if user was active yesterday
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    const yesterdayActivity = await db
      .select()
      .from(activityLog)
      .where(
        and(
          eq(activityLog.userId, userId),
          sql`${activityLog.activityDate} = ${yesterdayStr}::date`
        )
      )
      .limit(1);

    let newStreak = 1;
    if (yesterdayActivity.length > 0 && currentStreak) {
      // Continue streak
      newStreak = currentStreak.currentStreak + 1;
    }

    const longestStreak = currentStreak
      ? Math.max(currentStreak.longestStreak, newStreak)
      : newStreak;

    const todayStr = today.toISOString().split("T")[0];
    if (currentStreak) {
      await db
        .update(userStreak)
        .set({
          currentStreak: newStreak,
          longestStreak,
          lastActivityDate: todayStr,
          updatedAt: new Date(),
        })
        .where(eq(userStreak.id, currentStreak.id));
    } else {
      await db.insert(userStreak).values({
        id: generateRandomString(32),
        userId,
        streakType: "activity",
        currentStreak: newStreak,
        longestStreak,
        lastActivityDate: todayStr,
      });
    }

    // Check for streak milestones
    await checkStreakMilestones(userId, newStreak);

    return { success: true };
  } catch (error) {
    console.error("Error updating activity streak:", error);
    return { success: false, error: "Failed to update streak" };
  }
}

/**
 * Check and award streak milestones
 */
async function checkStreakMilestones(userId: string, streak: number) {
  try {
    // 7-day streak milestone
    if (streak === 7) {
      await awardBadge(
        userId,
        "streak_7",
        "7-Day Streak",
        "Maintained a 7-day activity streak!",
        "🔥",
        "engagement"
      );
    }
    // 30-day streak milestone
    if (streak === 30) {
      await awardBadge(
        userId,
        "streak_30",
        "Dedicated",
        "Maintained a 30-day activity streak!",
        "⭐",
        "engagement"
      );
    }
  } catch (error) {
    console.error("Error checking streak milestones:", error);
  }
}

/**
 * Get user streaks
 */
export async function getUserStreaks(userId: string) {
  "use cache";
  cacheLife({ stale: 300, revalidate: 3600 });
  cacheTag(`streaks:${userId}`);

  try {
    const streaks = await db
      .select()
      .from(userStreak)
      .where(eq(userStreak.userId, userId));

    return {
      activityStreak: streaks.find((s) => s.streakType === "activity") || {
        currentStreak: 0,
        longestStreak: 0,
      },
      verificationStreak: streaks.find(
        (s) => s.streakType === "verification"
      ) || {
        currentStreak: 0,
        longestStreak: 0,
      },
    };
  } catch (error) {
    console.error("Error getting user streaks:", error);
    return {
      activityStreak: { currentStreak: 0, longestStreak: 0 },
      verificationStreak: { currentStreak: 0, longestStreak: 0 },
    };
  }
}

/**
 * Get streak calendar data
 */
export async function getStreakCalendar(
  userId: string,
  year: number,
  month: number
) {
  "use cache";
  cacheLife({ stale: 300, revalidate: 3600 });
  cacheTag(`streak-calendar:${userId}:${year}:${month}`);

  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];

    const activities = await db
      .select()
      .from(activityLog)
      .where(
        and(
          eq(activityLog.userId, userId),
          gte(activityLog.activityDate, startDateStr),
          lte(activityLog.activityDate, endDateStr)
        )
      );

    return activities.map((a) => a.activityDate);
  } catch (error) {
    console.error("Error getting streak calendar:", error);
    return [];
  }
}

/**
 * Check if user is eligible for Expert role
 */
export async function checkExpertEligibility(userId: string) {
  try {
    // Get user account age
    const userData = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (userData.length === 0) {
      return { eligible: false, reason: "User not found" };
    }

    const accountAge = Math.floor(
      (Date.now() - new Date(userData[0].createdAt).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    // Get verified reports count
    const verifiedReports = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(report)
      .where(
        and(
          eq(report.userId, userId),
          eq(report.status, "approved"),
          sql`${report.deletedAt} IS NULL`
        )
      );

    const verifiedCount = Number(verifiedReports[0]?.count || 0);

    // Get reputation points
    const reputation = await db
      .select()
      .from(userReputation)
      .where(eq(userReputation.userId, userId))
      .limit(1);

    const points = reputation[0]?.reputationPoints || 0;

    // Check requirements: 15 verified reports + 100 points + 30 days
    const requirements = {
      verifiedReports: {
        required: 15,
        current: verifiedCount,
        met: verifiedCount >= 15,
      },
      reputationPoints: { required: 100, current: points, met: points >= 100 },
      accountAge: { required: 30, current: accountAge, met: accountAge >= 30 },
    };

    const eligible =
      requirements.verifiedReports.met &&
      requirements.reputationPoints.met &&
      requirements.accountAge.met;

    return {
      eligible,
      requirements,
    };
  } catch (error) {
    console.error("Error checking expert eligibility:", error);
    return { eligible: false, reason: "Error checking eligibility" };
  }
}

/**
 * Award badge to user
 */
export async function awardBadge(
  userId: string,
  badgeType: string,
  badgeName: string,
  badgeDescription: string,
  badgeIcon?: string,
  badgeCategory?: string
) {
  try {
    // Check if user already has this badge
    const existing = await db
      .select()
      .from(userBadge)
      .where(
        and(eq(userBadge.userId, userId), eq(userBadge.badgeType, badgeType))
      )
      .limit(1);

    if (existing.length > 0) {
      return { success: true, alreadyEarned: true };
    }

    // Calculate rarity (percentage of users who have this badge)
    const totalUsers = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${user.id})` })
      .from(user);

    const badgeHolders = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${userBadge.userId})` })
      .from(userBadge)
      .where(eq(userBadge.badgeType, badgeType));

    const totalUsersCount = Number(totalUsers[0]?.count || 1);
    const badgeHoldersCount = Number(badgeHolders[0]?.count || 0);
    const rarity =
      totalUsersCount > 0
        ? Math.round((badgeHoldersCount / totalUsersCount) * 100)
        : 0;

    // Award badge
    await db.insert(userBadge).values({
      id: generateRandomString(32),
      userId,
      badgeType,
      badgeName,
      badgeDescription,
      badgeIcon: badgeIcon || null,
      badgeCategory: badgeCategory || null,
      rarity: `${rarity}%`,
      pinned: false,
      pinnedOrder: null,
    });

    return { success: true };
  } catch (error) {
    console.error("Error awarding badge:", error);
    return { success: false, error: "Failed to award badge" };
  }
}

/**
 * Pin badge
 */
export async function pinBadge(userId: string, badgeId: string) {
  try {
    // Check if user owns this badge
    const badge = await db
      .select()
      .from(userBadge)
      .where(and(eq(userBadge.id, badgeId), eq(userBadge.userId, userId)))
      .limit(1);

    if (badge.length === 0) {
      return { success: false, error: "Badge not found" };
    }

    // Check how many badges are already pinned
    const pinnedCount = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(userBadge)
      .where(and(eq(userBadge.userId, userId), eq(userBadge.pinned, true)));

    const pinnedCountNum = Number(pinnedCount[0]?.count || 0);
    if (pinnedCountNum >= 5) {
      return { success: false, error: "Maximum 5 badges can be pinned" };
    }

    // Pin badge
    await db
      .update(userBadge)
      .set({
        pinned: true,
        pinnedOrder: pinnedCountNum + 1,
      })
      .where(eq(userBadge.id, badgeId));

    return { success: true };
  } catch (error) {
    console.error("Error pinning badge:", error);
    return { success: false, error: "Failed to pin badge" };
  }
}

/**
 * Unpin badge
 */
export async function unpinBadge(userId: string, badgeId: string) {
  try {
    await db
      .update(userBadge)
      .set({
        pinned: false,
        pinnedOrder: null,
      })
      .where(and(eq(userBadge.id, badgeId), eq(userBadge.userId, userId)));

    return { success: true };
  } catch (error) {
    console.error("Error unpinning badge:", error);
    return { success: false, error: "Failed to unpin badge" };
  }
}

/**
 * Get user's pinned badges
 */
export async function getPinnedBadges(userId: string) {
  "use cache";
  cacheLife({ stale: 300, revalidate: 3600 });
  cacheTag(`pinned-badges:${userId}`);

  try {
    const badges = await db
      .select()
      .from(userBadge)
      .where(and(eq(userBadge.userId, userId), eq(userBadge.pinned, true)))
      .orderBy(userBadge.pinnedOrder);

    return badges;
  } catch (error) {
    console.error("Error getting pinned badges:", error);
    return [];
  }
}

/**
 * Get user's recent activity
 */
export async function getRecentActivity(userId: string, limit = 10) {
  "use cache";
  cacheLife({ stale: 60, revalidate: 300 });
  cacheTag(`recent-activity:${userId}`);

  try {
    // Get recent reports
    const recentReports = await db
      .select({
        id: report.id,
        type: report.type,
        jobTitle: report.jobTitle,
        status: report.status,
        createdAt: report.createdAt,
        activityType: sql<string>`'report_submitted'`,
      })
      .from(report)
      .where(and(eq(report.userId, userId), sql`${report.deletedAt} IS NULL`))
      .orderBy(sql`${report.createdAt} DESC`)
      .limit(limit);

    // Get recent verifications
    const recentVerifications = await db
      .select({
        id: reportVerification.id,
        reportId: reportVerification.reportId,
        canVerify: reportVerification.canVerify,
        createdAt: reportVerification.createdAt,
        activityType: sql<string>`'verification_completed'`,
      })
      .from(reportVerification)
      .where(
        and(
          eq(reportVerification.userId, userId),
          sql`${reportVerification.deletedAt} IS NULL`
        )
      )
      .orderBy(sql`${reportVerification.createdAt} DESC`)
      .limit(limit);

    // Combine and sort by date
    const activities = [
      ...recentReports.map((r) => ({
        ...r,
        entityId: r.id,
        entityType: "report",
      })),
      ...recentVerifications.map((v) => ({
        ...v,
        entityId: v.reportId,
        entityType: "verification",
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, limit);

    return activities;
  } catch (error) {
    console.error("Error getting recent activity:", error);
    return [];
  }
}
