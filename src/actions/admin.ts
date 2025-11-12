"use server";

import { db } from "@/db";
import {
  moderatorNomination,
  moderatorStrike,
  report,
  reportDispute,
  user,
} from "@/db/schema";
import { and, count, eq, gte, isNull } from "drizzle-orm";

export interface AdminOverviewStats {
  totalUsers: number;
  totalReports: number;
  verifiedReports: number;
  pendingNominations: number;
  pendingStrikes: number;
  pendingAppeals: number;
  flaggedReports: number;
  activeUsersToday: number;
  activeUsersThisWeek: number;
}

export interface ActionRequired {
  nominations: number;
  strikes: number;
  appeals: number;
  flaggedReports: number;
}

export async function getAdminOverview(): Promise<AdminOverviewStats> {
  try {
    const [
      totalUsersResult,
      totalReportsResult,
      verifiedReportsResult,
      nominationsResult,
      strikesResult,
      appealsResult,
      flaggedResult,
    ] = await Promise.all([
      db.select({ count: count() }).from(user),
      db
        .select({ count: count() })
        .from(report)
        .where(isNull(report.deletedAt)),
      db
        .select({ count: count() })
        .from(report)
        .where(and(eq(report.status, "approved"), isNull(report.deletedAt))),
      db
        .select({ count: count() })
        .from(moderatorNomination)
        .where(eq(moderatorNomination.status, "pending")),
      db
        .select({ count: count() })
        .from(moderatorStrike)
        .where(eq(moderatorStrike.status, "active")),
      db
        .select({ count: count() })
        .from(moderatorStrike)
        .where(eq(moderatorStrike.status, "appealed")),
      db
        .select({ count: count() })
        .from(reportDispute)
        .where(isNull(reportDispute.deletedAt)),
    ]);

    // Get active users (simplified - users who logged in today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activeUsersTodayResult = await db
      .select({ count: count() })
      .from(user)
      .where(gte(user.updatedAt, today));

    // Get active users this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const activeUsersWeekResult = await db
      .select({ count: count() })
      .from(user)
      .where(gte(user.updatedAt, weekAgo));

    return {
      totalUsers: totalUsersResult[0]?.count ?? 0,
      totalReports: totalReportsResult[0]?.count ?? 0,
      verifiedReports: verifiedReportsResult[0]?.count ?? 0,
      pendingNominations: nominationsResult[0]?.count ?? 0,
      pendingStrikes: strikesResult[0]?.count ?? 0,
      pendingAppeals: appealsResult[0]?.count ?? 0,
      flaggedReports: flaggedResult[0]?.count ?? 0,
      activeUsersToday: activeUsersTodayResult[0]?.count ?? 0,
      activeUsersThisWeek: activeUsersWeekResult[0]?.count ?? 0,
    };
  } catch (error) {
    console.error("Error getting admin overview:", error);
    return {
      totalUsers: 0,
      totalReports: 0,
      verifiedReports: 0,
      pendingNominations: 0,
      pendingStrikes: 0,
      pendingAppeals: 0,
      flaggedReports: 0,
      activeUsersToday: 0,
      activeUsersThisWeek: 0,
    };
  }
}

export async function getActionRequired(): Promise<ActionRequired> {
  try {
    const [nominations, strikes, appeals, flagged] = await Promise.all([
      db
        .select({ count: count() })
        .from(moderatorNomination)
        .where(eq(moderatorNomination.status, "pending")),
      db
        .select({ count: count() })
        .from(moderatorStrike)
        .where(eq(moderatorStrike.status, "active")),
      db
        .select({ count: count() })
        .from(moderatorStrike)
        .where(eq(moderatorStrike.status, "appealed")),
      db
        .select({ count: count() })
        .from(reportDispute)
        .where(isNull(reportDispute.deletedAt)),
    ]);

    return {
      nominations: nominations[0]?.count ?? 0,
      strikes: strikes[0]?.count ?? 0,
      appeals: appeals[0]?.count ?? 0,
      flaggedReports: flagged[0]?.count ?? 0,
    };
  } catch (error) {
    console.error("Error getting action required:", error);
    return {
      nominations: 0,
      strikes: 0,
      appeals: 0,
      flaggedReports: 0,
    };
  }
}
