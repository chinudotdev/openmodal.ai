"use server";

import { headers } from "next/headers";
import { db } from "@/db";
import { sql } from "drizzle-orm";

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
    // Access headers first to mark this as dynamic (required before using new Date())
    await headers();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const result = await db.execute(sql`
      SELECT
        (SELECT COUNT(*) FROM "user")::int AS total_users,
        (SELECT COUNT(*) FROM "report" WHERE deleted_at IS NULL)::int AS total_reports,
        (SELECT COUNT(*) FROM "report" WHERE status = 'approved' AND deleted_at IS NULL)::int AS verified_reports,
        (SELECT COUNT(*) FROM "moderator_nomination" WHERE status = 'pending')::int AS pending_nominations,
        (SELECT COUNT(*) FROM "moderator_strike" WHERE status = 'active')::int AS pending_strikes,
        (SELECT COUNT(*) FROM "moderator_strike" WHERE status = 'appealed')::int AS pending_appeals,
        (SELECT COUNT(*) FROM "report_dispute" WHERE deleted_at IS NULL)::int AS flagged_reports,
        (SELECT COUNT(*) FROM "user" WHERE updated_at >= ${today})::int AS active_users_today,
        (SELECT COUNT(*) FROM "user" WHERE updated_at >= ${weekAgo})::int AS active_users_week
    `);

    const row = result.rows[0] as {
      total_users: number;
      total_reports: number;
      verified_reports: number;
      pending_nominations: number;
      pending_strikes: number;
      pending_appeals: number;
      flagged_reports: number;
      active_users_today: number;
      active_users_week: number;
    };

    return {
      totalUsers: row?.total_users ?? 0,
      totalReports: row?.total_reports ?? 0,
      verifiedReports: row?.verified_reports ?? 0,
      pendingNominations: row?.pending_nominations ?? 0,
      pendingStrikes: row?.pending_strikes ?? 0,
      pendingAppeals: row?.pending_appeals ?? 0,
      flaggedReports: row?.flagged_reports ?? 0,
      activeUsersToday: row?.active_users_today ?? 0,
      activeUsersThisWeek: row?.active_users_week ?? 0,
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
    const result = await db.execute(sql`
      SELECT
        (SELECT COUNT(*) FROM "moderator_nomination" WHERE status = 'pending')::int AS nominations,
        (SELECT COUNT(*) FROM "moderator_strike" WHERE status = 'active')::int AS strikes,
        (SELECT COUNT(*) FROM "moderator_strike" WHERE status = 'appealed')::int AS appeals,
        (SELECT COUNT(*) FROM "report_dispute" WHERE deleted_at IS NULL)::int AS flagged_reports
    `);

    const row = result.rows[0] as {
      nominations: number;
      strikes: number;
      appeals: number;
      flagged_reports: number;
    };

    return {
      nominations: row?.nominations ?? 0,
      strikes: row?.strikes ?? 0,
      appeals: row?.appeals ?? 0,
      flaggedReports: row?.flagged_reports ?? 0,
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
