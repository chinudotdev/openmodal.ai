"use server";

import { and, count, desc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/db";
import { type ReportStatus, report, reportDispute, user } from "@/db/schema";

export async function getAllReports(
  filters?: {
    status?: ReportStatus;
    flagged?: boolean;
    disputed?: boolean;
  },
  limit = 50,
  offset = 0,
) {
  try {
    const conditions = [isNull(report.deletedAt)];

    if (filters?.status) {
      conditions.push(eq(report.status, filters.status));
    }

    if (filters?.disputed) {
      // Get reports with disputes
      const disputedReportIds = await db
        .select({ reportId: reportDispute.reportId })
        .from(reportDispute)
        .where(isNull(reportDispute.deletedAt));

      if (disputedReportIds.length === 0) {
        // No disputed reports, return empty
        return { reports: [], total: 0 };
      }

      const disputedIds = disputedReportIds.map((d) => d.reportId);
      conditions.push(inArray(report.id, disputedIds));
    }

    const baseQuery = db.select().from(report);
    const queryWithWhere = baseQuery.where(and(...conditions));

    const reports = await queryWithWhere
      .orderBy(desc(report.createdAt))
      .limit(limit)
      .offset(offset);

    const totalResult = await db
      .select({ count: count() })
      .from(report)
      .where(and(...conditions));

    const total = totalResult[0]?.count ?? 0;

    // Get user data for each report
    const reportsWithUsers = await Promise.all(
      reports.map(async (r) => {
        const userData = await db
          .select()
          .from(user)
          .where(eq(user.id, r.userId))
          .limit(1);

        return {
          ...r,
          user: userData[0]!,
        };
      }),
    );

    return {
      reports: reportsWithUsers,
      total,
    };
  } catch (error) {
    console.error("Error getting all reports:", error);
    return { reports: [], total: 0 };
  }
}

export async function getFlaggedReports() {
  try {
    // Reports with disputes are considered flagged
    const disputes = await db
      .select()
      .from(reportDispute)
      .where(isNull(reportDispute.deletedAt));

    const reportIds = disputes.map((d) => d.reportId);

    if (reportIds.length === 0) {
      return [];
    }

    const reports = await db
      .select()
      .from(report)
      .where(and(inArray(report.id, reportIds), isNull(report.deletedAt)));

    return reports;
  } catch (error) {
    console.error("Error getting flagged reports:", error);
    return [];
  }
}

export async function adminApproveReport(reportId: string, notes?: string) {
  try {
    await db
      .update(report)
      .set({
        status: "approved",
        moderationNotes: notes || null,
        publishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(report.id, reportId));

    return { success: true };
  } catch (error) {
    console.error("Error approving report:", error);
    return { success: false, error: "Failed to approve report" };
  }
}

export async function adminRejectReport(reportId: string, reason: string) {
  try {
    await db
      .update(report)
      .set({
        status: "rejected",
        moderationReason: reason,
        updatedAt: new Date(),
      })
      .where(eq(report.id, reportId));

    return { success: true };
  } catch (error) {
    console.error("Error rejecting report:", error);
    return { success: false, error: "Failed to reject report" };
  }
}
