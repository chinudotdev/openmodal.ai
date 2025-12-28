"use server";

import { and, count, desc, eq, ilike, isNull, or } from "drizzle-orm";
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
    const baseQuery = db
      .select({
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
      })
      .from(user);

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

    const queryWithWhere =
      conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;

    const users = await queryWithWhere
      .orderBy(desc(user.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(user)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = totalResult[0]?.count ?? 0;

    // Fetch additional data for each user
    const usersWithData = await Promise.all(
      users.map(async (u) => {
        const [reputation, reportsCount, verificationsCount, strikesCount] =
          await Promise.all([
            db
              .select()
              .from(userReputation)
              .where(eq(userReputation.userId, u.id))
              .limit(1),
            db
              .select({ count: count() })
              .from(report)
              .where(and(eq(report.userId, u.id), isNull(report.deletedAt))),
            db
              .select({ count: count() })
              .from(reportVerification)
              .where(
                and(
                  eq(reportVerification.userId, u.id),
                  isNull(reportVerification.deletedAt),
                ),
              ),
            db
              .select({ count: count() })
              .from(moderatorStrike)
              .where(eq(moderatorStrike.moderatorId, u.id)),
          ]);

        return {
          ...u,
          banned: u.banned ?? false,
          reputation: reputation[0]
            ? {
                reputationPoints: reputation[0].reputationPoints,
                tier: reputation[0].tier,
              }
            : null,
          stats: {
            reportsCount: reportsCount[0]?.count ?? 0,
            verificationsCount: verificationsCount[0]?.count ?? 0,
            strikesCount: strikesCount[0]?.count ?? 0,
          },
        };
      }),
    );

    return {
      users: usersWithData,
      total,
    };
  } catch (error) {
    console.error("Error getting all users:", error);
    return { users: [], total: 0 };
  }
}

export async function getUserDetails(userId: string) {
  try {
    const [
      userData,
      reputation,
      profile,
      reportsCount,
      verificationsCount,
      strikesCount,
    ] = await Promise.all([
      db.select().from(user).where(eq(user.id, userId)).limit(1),
      db
        .select()
        .from(userReputation)
        .where(eq(userReputation.userId, userId))
        .limit(1),
      db
        .select()
        .from(userProfile)
        .where(eq(userProfile.userId, userId))
        .limit(1),
      db
        .select({ count: count() })
        .from(report)
        .where(and(eq(report.userId, userId), isNull(report.deletedAt))),
      db
        .select({ count: count() })
        .from(reportVerification)
        .where(
          and(
            eq(reportVerification.userId, userId),
            isNull(reportVerification.deletedAt),
          ),
        ),
      db
        .select({ count: count() })
        .from(moderatorStrike)
        .where(eq(moderatorStrike.moderatorId, userId)),
    ]);

    if (userData.length === 0) {
      return null;
    }

    return {
      user: userData[0],
      reputation: reputation[0] ?? null,
      profile: profile[0] ?? null,
      stats: {
        reportsCount: reportsCount[0]?.count ?? 0,
        verificationsCount: verificationsCount[0]?.count ?? 0,
        strikesCount: strikesCount[0]?.count ?? 0,
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
