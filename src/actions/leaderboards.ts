"use server";

import { and, desc, eq, gte, inArray, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { report, reportVerification, user, userReputation } from "@/db/schema";
import { cacheLife, cacheTag } from "next/cache";

type LeaderboardType =
  | "monthly_contributors"
  | "monthly_verifiers"
  | "rising_stars"
  | "all_time";

interface LeaderboardEntry {
  userId: string;
  name: string;
  image: string | null;
  role: string | null;
  points: number;
  count: number;
  rank: number;
}

interface QueryResult {
  userId: string;
  count: number;
}

/**
 * Get leaderboard data
 */
export async function getLeaderboard(
  type: LeaderboardType,
  _userId?: string
): Promise<LeaderboardEntry[]> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 3600 });
  cacheTag(`leaderboard:${type}`);

  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // biome-ignore lint/suspicious/noExplicitAny: Query builder type varies by case
    let query: any;

    switch (type) {
      case "monthly_contributors": {
        // Top contributors this month (by verified reports)
        query = db
          .select({
            userId: report.userId,
            count: sql<number>`COUNT(*)::int`.as("count"),
          })
          .from(report)
          .where(
            and(
              eq(report.status, "approved"),
              isNull(report.deletedAt),
              gte(report.publishedAt, startOfMonth)
            )
          )
          .groupBy(report.userId)
          .orderBy(desc(sql`COUNT(*)`))
          .limit(100);
        break;
      }
      case "monthly_verifiers": {
        // Top verifiers this month (by verifications completed)
        query = db
          .select({
            userId: reportVerification.userId,
            count: sql<number>`COUNT(*)::int`.as("count"),
          })
          .from(reportVerification)
          .where(
            and(
              eq(reportVerification.canVerify, true),
              isNull(reportVerification.deletedAt),
              gte(reportVerification.createdAt, startOfMonth)
            )
          )
          .groupBy(reportVerification.userId)
          .orderBy(desc(sql`COUNT(*)`))
          .limit(100);
        break;
      }
      case "rising_stars": {
        // Users who gained the most points in the last 30 days
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        query = db
          .select({
            userId: userReputation.userId,
            count: sql<number>`${userReputation.reputationPoints}::int`.as(
              "count"
            ),
          })
          .from(userReputation)
          .where(gte(userReputation.updatedAt, thirtyDaysAgo))
          .orderBy(desc(userReputation.reputationPoints))
          .limit(100);
        break;
      }
      case "all_time": {
        // All-time top contributors by reputation points
        query = db
          .select({
            userId: userReputation.userId,
            count: sql<number>`${userReputation.reputationPoints}::int`.as(
              "count"
            ),
          })
          .from(userReputation)
          .orderBy(desc(userReputation.reputationPoints))
          .limit(100);
        break;
      }
    }

    const results = (await query) as QueryResult[];

    // Get user details and reputation points
    const userIds = results.map((r: QueryResult) => r.userId);
    if (userIds.length === 0) {
      return [];
    }

    const usersData = await db
      .select({
        id: user.id,
        name: user.name,
        image: user.image,
        role: user.role,
      })
      .from(user)
      .where(inArray(user.id, userIds));

    const reputationData = await db
      .select()
      .from(userReputation)
      .where(inArray(userReputation.userId, userIds));

    const usersMap = new Map(usersData.map((u) => [u.id, u]));
    const reputationMap = new Map(
      reputationData.map((r) => [r.userId, r.reputationPoints])
    );

    const leaderboard: LeaderboardEntry[] = results.map(
      (result: QueryResult, index: number) => {
        const userData = usersMap.get(result.userId);
        const points = reputationMap.get(result.userId) || 0;

        return {
          userId: result.userId,
          name: userData?.name || "Unknown",
          image: userData?.image || null,
          role: userData?.role || null,
          points,
          count: Number(result.count),
          rank: index + 1,
        };
      }
    );

    return leaderboard;
  } catch (error) {
    console.error("Error getting leaderboard:", error);
    return [];
  }
}

/**
 * Get user's position in leaderboard
 */
export async function getUserLeaderboardPosition(
  type: LeaderboardType,
  userId: string | undefined
): Promise<{ rank: number; total: number; context?: string } | null> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 3600 });
  cacheTag(`leaderboard-position:${type}:${userId}`);
  
  if (!userId) {
    return null;
  }


  try {
    const leaderboard = await getLeaderboard(type, userId);
    const userIndex = leaderboard.findIndex((entry) => entry.userId === userId);

    if (userIndex === -1) {
      // User not in top 100, calculate approximate position
      return {
        rank: 0,
        total: leaderboard.length,
        context: "Not in top 100",
      };
    }

    const userEntry = leaderboard[userIndex];
    const nextEntry = leaderboard[userIndex - 1]; // Higher rank

    let context: string | undefined;
    if (nextEntry && type === "monthly_contributors") {
      const diff = nextEntry.count - userEntry.count;
      context = `${diff} more reports to reach rank ${userEntry.rank - 1}`;
    }

    return {
      rank: userEntry.rank,
      total: leaderboard.length,
      context,
    };
  } catch (error) {
    console.error("Error getting user leaderboard position:", error);
    return null;
  }
}
