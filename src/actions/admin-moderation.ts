"use server";

import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import {
  moderatorNomination,
  moderatorStrike,
  report,
  reportDispute,
  reportVerification,
  type StrikeStatus,
  user,
  userReputation,
} from "@/db/schema";
import { auth } from "@/lib/auth";

export interface NominationWithDetails {
  id: string;
  candidateId: string;
  nominatedBy: string;
  statement: string;
  status: string;
  adminNotes: string | null;
  submittedAt: Date;
  reviewedAt: Date | null;
  reviewedBy: string | null;
  candidate: {
    name: string;
    email: string;
    role: string | null;
  };
  nominator: {
    name: string;
    email: string;
  };
  candidateStats: {
    verificationsCount: number;
    reportsCount: number;
    reputationPoints: number;
    tier: string;
    strikesCount: number;
  };
}

export async function getModeratorNominations(
  status?: "pending" | "approved" | "rejected",
) {
  try {
    const statusFilter = status ?? "pending";
    const nominations = await db
      .select()
      .from(moderatorNomination)
      .where(eq(moderatorNomination.status, statusFilter))
      .orderBy(desc(moderatorNomination.submittedAt));

    if (nominations.length === 0) {
      return [];
    }

    // Optimized: Get all related data in parallel queries instead of per-nomination
    const candidateIds = [...new Set(nominations.map((n) => n.candidateId))];
    const nominatorIds = [...new Set(nominations.map((n) => n.nominatedBy))];
    const allUserIds = [...new Set([...candidateIds, ...nominatorIds])];

    const [
      allUsers,
      allReputations,
      allVerificationCounts,
      allReportCounts,
      allStrikeCounts,
    ] = await Promise.all([
      db.select().from(user).where(inArray(user.id, allUserIds)),
      db
        .select()
        .from(userReputation)
        .where(inArray(userReputation.userId, candidateIds)),
      db
        .select({
          userId: reportVerification.userId,
          count: sql<number>`COUNT(*)::int`.as("count"),
        })
        .from(reportVerification)
        .where(
          and(
            inArray(reportVerification.userId, candidateIds),
            isNull(reportVerification.deletedAt),
          ),
        )
        .groupBy(reportVerification.userId),
      db
        .select({
          userId: report.userId,
          count: sql<number>`COUNT(*)::int`.as("count"),
        })
        .from(report)
        .where(
          and(inArray(report.userId, candidateIds), isNull(report.deletedAt)),
        )
        .groupBy(report.userId),
      db
        .select({
          moderatorId: moderatorStrike.moderatorId,
          count: sql<number>`COUNT(*)::int`.as("count"),
        })
        .from(moderatorStrike)
        .where(inArray(moderatorStrike.moderatorId, candidateIds))
        .groupBy(moderatorStrike.moderatorId),
    ]);

    const usersMap = new Map(allUsers.map((u) => [u.id, u]));
    const reputationMap = new Map(allReputations.map((r) => [r.userId, r]));
    const verificationCountMap = new Map(
      allVerificationCounts.map((v) => [v.userId, v.count]),
    );
    const reportCountMap = new Map(
      allReportCounts.map((r) => [r.userId, r.count]),
    );
    const strikeCountMap = new Map(
      allStrikeCounts.map((s) => [s.moderatorId, s.count]),
    );

    return nominations.map((nom) => {
      const candidate = usersMap.get(nom.candidateId);
      const nominator = usersMap.get(nom.nominatedBy);
      const reputation = reputationMap.get(nom.candidateId);

      return {
        ...nom,
        candidate: candidate!,
        nominator: nominator!,
        candidateStats: {
          verificationsCount: Number(
            verificationCountMap.get(nom.candidateId) || 0,
          ),
          reportsCount: Number(reportCountMap.get(nom.candidateId) || 0),
          reputationPoints: reputation?.reputationPoints ?? 0,
          tier: reputation?.tier ?? "observer",
          strikesCount: Number(strikeCountMap.get(nom.candidateId) || 0),
        },
      };
    });
  } catch (error) {
    console.error("Error getting moderator nominations:", error);
    return [];
  }
}

export async function reviewNomination(
  nominationId: string,
  decision: "approve" | "reject",
  notes: string | null,
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return { success: false, error: "Not authenticated" };
    }

    const adminId = session.user.id;

    await db
      .update(moderatorNomination)
      .set({
        status: decision === "approve" ? "approved" : "rejected",
        adminNotes: notes,
        reviewedAt: new Date(),
        reviewedBy: adminId,
      })
      .where(eq(moderatorNomination.id, nominationId));

    // If approved, update user role to moderator
    if (decision === "approve") {
      const nomination = await db
        .select()
        .from(moderatorNomination)
        .where(eq(moderatorNomination.id, nominationId))
        .limit(1);

      if (nomination[0]) {
        await db
          .update(user)
          .set({ role: "moderator" })
          .where(eq(user.id, nomination[0].candidateId));
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error reviewing nomination:", error);
    return { success: false, error: "Failed to review nomination" };
  }
}

export async function getModeratorStrikes(filters?: {
  status?: StrikeStatus;
  moderatorId?: string;
}) {
  try {
    const conditions = [];
    if (filters?.status) {
      conditions.push(eq(moderatorStrike.status, filters.status));
    }
    if (filters?.moderatorId) {
      conditions.push(eq(moderatorStrike.moderatorId, filters.moderatorId));
    }

    const baseQuery = db.select().from(moderatorStrike);
    const queryWithWhere =
      conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;

    const strikes = await queryWithWhere.orderBy(
      desc(moderatorStrike.issuedAt),
    );

    // Optimized: Get all user data in single query
    const userIds = [
      ...new Set([
        ...strikes.map((s) => s.moderatorId),
        ...strikes.map((s) => s.issuedBy),
      ]),
    ];

    const allUsers =
      userIds.length > 0
        ? await db.select().from(user).where(inArray(user.id, userIds))
        : [];

    const usersMap = new Map(allUsers.map((u) => [u.id, u]));

    return strikes.map((strike) => ({
      ...strike,
      moderator: usersMap.get(strike.moderatorId)!,
      issuedByUser: usersMap.get(strike.issuedBy)!,
    }));
  } catch (error) {
    console.error("Error getting moderator strikes:", error);
    return [];
  }
}

export async function reviewStrikeAppeal(
  strikeId: string,
  decision: "uphold" | "overturn" | "reduce",
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return { success: false, error: "Not authenticated" };
    }

    const adminId = session.user.id;

    if (decision === "overturn") {
      await db
        .update(moderatorStrike)
        .set({
          status: "overturned",
          appealReviewedAt: new Date(),
          appealReviewedBy: adminId,
        })
        .where(eq(moderatorStrike.id, strikeId));
    } else if (decision === "reduce") {
      // Could implement reducing strike severity here
      await db
        .update(moderatorStrike)
        .set({
          appealReviewedAt: new Date(),
          appealReviewedBy: adminId,
        })
        .where(eq(moderatorStrike.id, strikeId));
    } else {
      await db
        .update(moderatorStrike)
        .set({
          appealReviewedAt: new Date(),
          appealReviewedBy: adminId,
        })
        .where(eq(moderatorStrike.id, strikeId));
    }

    return { success: true };
  } catch (error) {
    console.error("Error reviewing strike appeal:", error);
    return { success: false, error: "Failed to review strike appeal" };
  }
}

export async function getDisputes() {
  try {
    // Optimized: Single query with JOINs for user and report data
    const disputesWithDetails = await db
      .select({
        dispute: reportDispute,
        user,
        report,
      })
      .from(reportDispute)
      .leftJoin(user, eq(reportDispute.userId, user.id))
      .leftJoin(report, eq(reportDispute.reportId, report.id))
      .where(isNull(reportDispute.deletedAt))
      .orderBy(desc(reportDispute.createdAt));

    return disputesWithDetails.map((item) => ({
      ...item.dispute,
      user: item.user!,
      report: item.report!,
    }));
  } catch (error) {
    console.error("Error getting disputes:", error);
    return [];
  }
}
