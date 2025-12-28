"use server";

import { and, count, desc, eq, isNull } from "drizzle-orm";
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

    const nominationsWithDetails = await Promise.all(
      nominations.map(async (nom) => {
        const [
          candidate,
          nominator,
          reputation,
          verificationsCount,
          reportsCount,
          strikesCount,
        ] = await Promise.all([
          db.select().from(user).where(eq(user.id, nom.candidateId)).limit(1),
          db.select().from(user).where(eq(user.id, nom.nominatedBy)).limit(1),
          db
            .select()
            .from(userReputation)
            .where(eq(userReputation.userId, nom.candidateId))
            .limit(1),
          db
            .select({ count: count() })
            .from(reportVerification)
            .where(
              and(
                eq(reportVerification.userId, nom.candidateId),
                isNull(reportVerification.deletedAt),
              ),
            ),
          db
            .select({ count: count() })
            .from(report)
            .where(
              and(eq(report.userId, nom.candidateId), isNull(report.deletedAt)),
            ),
          db
            .select({ count: count() })
            .from(moderatorStrike)
            .where(eq(moderatorStrike.moderatorId, nom.candidateId)),
        ]);

        return {
          ...nom,
          candidate: candidate[0]!,
          nominator: nominator[0]!,
          candidateStats: {
            verificationsCount: verificationsCount[0]?.count ?? 0,
            reportsCount: reportsCount[0]?.count ?? 0,
            reputationPoints: reputation[0]?.reputationPoints ?? 0,
            tier: reputation[0]?.tier ?? "observer",
            strikesCount: strikesCount[0]?.count ?? 0,
          },
        };
      }),
    );

    return nominationsWithDetails;
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

    const strikesWithDetails = await Promise.all(
      strikes.map(async (strike) => {
        const [moderator, issuedBy] = await Promise.all([
          db
            .select()
            .from(user)
            .where(eq(user.id, strike.moderatorId))
            .limit(1),
          db.select().from(user).where(eq(user.id, strike.issuedBy)).limit(1),
        ]);

        return {
          ...strike,
          moderator: moderator[0]!,
          issuedByUser: issuedBy[0]!,
        };
      }),
    );

    return strikesWithDetails;
  } catch (error) {
    console.error("Error getting moderator strikes:", error);
    return [];
  }
}

export async function reviewStrikeAppeal(
  strikeId: string,
  decision: "uphold" | "overturn" | "reduce",
  notes: string | null,
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

export async function getDisputes(status?: string) {
  try {
    const query = db
      .select()
      .from(reportDispute)
      .where(isNull(reportDispute.deletedAt));

    const disputes = await query.orderBy(desc(reportDispute.createdAt));

    const disputesWithDetails = await Promise.all(
      disputes.map(async (dispute) => {
        const [userData, reportData] = await Promise.all([
          db.select().from(user).where(eq(user.id, dispute.userId)).limit(1),
          db
            .select()
            .from(report)
            .where(eq(report.id, dispute.reportId))
            .limit(1),
        ]);

        return {
          ...dispute,
          user: userData[0]!,
          report: reportData[0]!,
        };
      }),
    );

    return disputesWithDetails;
  } catch (error) {
    console.error("Error getting disputes:", error);
    return [];
  }
}
