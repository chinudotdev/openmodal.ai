"use server";

import { and, desc, eq, ilike, isNull, or, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  moderatorStrike,
  report,
  reportVerification,
  user,
  userProfile,
  userReputation,
} from "@/db/schema";

export interface UserFilters {
  role?: string;
  status?: "active" | "banned";
  search?: string;
}

export interface UserListResult {
  users: Array<{
    id: string;
    name: string;
    email: string;
    username: string | null;
    role: string | null;
    banned: boolean;
    banReason: string | null;
    banExpires: Date | null;
    createdAt: Date;
    updatedAt: Date;
    reputation: {
      reputationPoints: number;
      tier: string;
    } | null;
    stats: {
      reportsCount: number;
      verificationsCount: number;
      strikesCount: number;
    };
  }>;
  total: number;
}

export async function getAllUsers(
  filters: UserFilters = {},
  limit = 50,
  offset = 0,
): Promise<UserListResult> {
  try {
    const conditions = [];

    if (filters.search) {
      conditions.push(
        or(
          ilike(user.name, `%${filters.search}%`),
          ilike(user.email, `%${filters.search}%`),
          ilike(user.username, `%${filters.search}%`),
        ),
      );
    }

    if (filters.role) {
      conditions.push(eq(user.role, filters.role));
    }

    if (filters.status === "banned") {
      conditions.push(eq(user.banned, true));
    } else if (filters.status === "active") {
      conditions.push(or(eq(user.banned, false), isNull(user.banned)));
    }

    // Optimized: Single query with LEFT JOINs and aggregations for all user data
    const baseQuery = db
      .select({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role,
          banned: user.banned,
          banReason: user.banReason,
          banExpires: user.banExpires,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        reputation: {
          reputationPoints: userReputation.reputationPoints,
          tier: userReputation.tier,
        },
        stats: {
          reportsCount: sql<number>`
            COALESCE(
              (SELECT COUNT(*) FROM ${report}
               WHERE user_id = ${user.id} AND deleted_at IS NULL),
              0
            )
          `.as("reports_count"),
          verificationsCount: sql<number>`
            COALESCE(
              (SELECT COUNT(*) FROM ${reportVerification}
               WHERE user_id = ${user.id}
                 AND deleted_at IS NULL
                 AND can_verify = true),
              0
            )
          `.as("verifications_count"),
          strikesCount: sql<number>`
            COALESCE(
              (SELECT COUNT(*) FROM ${moderatorStrike}
               WHERE moderator_id = ${user.id}),
              0
            )
          `.as("strikes_count"),
        },
        total: sql<number>`COUNT(*) OVER()`.as("total"),
      })
      .from(user)
      .leftJoin(userReputation, eq(userReputation.userId, user.id));

    const queryWithWhere =
      conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;

    const usersWithData = await queryWithWhere
      .orderBy(desc(user.createdAt))
      .limit(limit)
      .offset(offset);

    const total =
      usersWithData.length > 0 ? Number(usersWithData[0]?.total || 0) : 0;

    return {
      users: usersWithData.map((u) => ({
        ...u.user,
        banned: u.user.banned ?? false,
        reputation: u.reputation
          ? {
              reputationPoints: u.reputation.reputationPoints,
              tier: u.reputation.tier,
            }
          : null,
        stats: {
          reportsCount: Number(u.stats.reportsCount || 0),
          verificationsCount: Number(u.stats.verificationsCount || 0),
          strikesCount: Number(u.stats.strikesCount || 0),
        },
      })),
      total,
    };
  } catch (error) {
    console.error("Error getting all users:", error);
    return { users: [], total: 0 };
  }
}

export async function getUserDetails(userId: string) {
  try {
    // Optimized: Single query with LEFT JOINs and subqueries for all data
    const result = await db
      .select({
        user,
        reputation: userReputation,
        profile: userProfile,
        stats: {
          reportsCount: sql<number>`
            COALESCE(
              (SELECT COUNT(*) FROM ${report}
               WHERE user_id = ${user.id} AND deleted_at IS NULL),
              0
            )
          `.as("reports_count"),
          verificationsCount: sql<number>`
            COALESCE(
              (SELECT COUNT(*) FROM ${reportVerification}
               WHERE user_id = ${user.id}
                 AND deleted_at IS NULL
                 AND can_verify = true),
              0
            )
          `.as("verifications_count"),
          strikesCount: sql<number>`
            COALESCE(
              (SELECT COUNT(*) FROM ${moderatorStrike}
               WHERE moderator_id = ${user.id}),
              0
            )
          `.as("strikes_count"),
        },
      })
      .from(user)
      .leftJoin(userReputation, eq(userReputation.userId, user.id))
      .leftJoin(userProfile, eq(userProfile.userId, user.id))
      .where(eq(user.id, userId))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const data = result[0];

    return {
      user: data.user,
      reputation: data.reputation ?? null,
      profile: data.profile ?? null,
      stats: {
        reportsCount: Number(data.stats.reportsCount || 0),
        verificationsCount: Number(data.stats.verificationsCount || 0),
        strikesCount: Number(data.stats.strikesCount || 0),
      },
    };
  } catch (error) {
    console.error("Error getting user details:", error);
    return null;
  }
}

export async function changeUserRole(userId: string, newRole: string) {
  try {
    await db.update(user).set({ role: newRole }).where(eq(user.id, userId));
    return { success: true };
  } catch (error) {
    console.error("Error changing user role:", error);
    return { success: false, error: "Failed to change user role" };
  }
}

export async function banUser(
  userId: string,
  banData: {
    duration: number | null; // null for permanent
    reason: string;
    notifyUser?: boolean;
  },
) {
  try {
    const banExpires = banData.duration
      ? new Date(Date.now() + banData.duration * 24 * 60 * 60 * 1000)
      : null;

    await db
      .update(user)
      .set({
        banned: true,
        banReason: banData.reason,
        banExpires,
      })
      .where(eq(user.id, userId));

    // TODO: Send email notification if notifyUser is true

    return { success: true };
  } catch (error) {
    console.error("Error banning user:", error);
    return { success: false, error: "Failed to ban user" };
  }
}

export async function unbanUser(userId: string) {
  try {
    await db
      .update(user)
      .set({
        banned: false,
        banReason: null,
        banExpires: null,
      })
      .where(eq(user.id, userId));

    return { success: true };
  } catch (error) {
    console.error("Error unbanning user:", error);
    return { success: false, error: "Failed to unban user" };
  }
}
