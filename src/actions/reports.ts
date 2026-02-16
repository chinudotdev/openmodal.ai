"use server";

import { generateRandomString } from "better-auth/crypto";
import { and, desc, eq, or, type SQL, sql } from "drizzle-orm";
import { cacheLife } from "next/cache";
import { db } from "@/db";
import {
  impactReport,
  impactReportCapability,
  type ReportStatus,
  user,
  userBadge,
  userProfile,
  userReputation,
} from "@/db/schema";
import { job } from "@/db/schema/jobs";
import { technology } from "@/db/schema/technologies";
// ============================================
// TYPES
// ============================================

export interface ImpactReportInput {
  title: string;
  description: string;
  location?: string;
  eventDate?: Date;
  sourceUrl?: string;
  technologyId: string;
  jobId?: string;
  capabilityIds?: string[];
}

// ============================================
// SUBMIT REPORT
// ============================================

/**
 * Submit a new impact report
 */
export async function submitReport(
  userId: string,
  reportData: ImpactReportInput,
) {
  try {

    // Validate required fields
    if (
      !reportData.title ||
      !reportData.description ||
      !reportData.technologyId
    ) {
      return {
        success: false,
        error: "Title, description, and technology are required",
      };
    }

    // Verify technology exists
    const tech = await db
      .select({ id: technology.id })
      .from(technology)
      .where(eq(technology.id, reportData.technologyId))
      .limit(1);

    if (tech.length === 0) {
      return { success: false, error: "Technology not found" };
    }

    // Verify job exists if provided
    if (reportData.jobId) {
      const jobExists = await db
        .select({ id: job.id })
        .from(job)
        .where(eq(job.id, reportData.jobId))
        .limit(1);

      if (jobExists.length === 0) {
        return { success: false, error: "Job not found" };
      }
    }

    const reportId = generateRandomString(32);

    await db.transaction(async (tx) => {
      // Insert impact report
      await tx.insert(impactReport).values({
        id: reportId,
        title: reportData.title,
        description: reportData.description,
        location: reportData.location || null,
        eventDate: reportData.eventDate || null,
        sourceUrl: reportData.sourceUrl || null,
        technologyId: reportData.technologyId,
        jobId: reportData.jobId || null,
        status: "pending",
        submittedBy: userId,
        verificationStatus: "unverified",
        upvotes: 0,
        isFeatured: false,
      });

      // Insert capability connections if provided
      if (reportData.capabilityIds && reportData.capabilityIds.length > 0) {
        const capabilityConnections = reportData.capabilityIds.map(
          (capabilityId) => ({
            id: generateRandomString(32),
            impactReportId: reportId,
            capabilityId,
          }),
        );
        await tx.insert(impactReportCapability).values(capabilityConnections);
      }
    });

    return { success: true, reportId };
  } catch (error) {
    console.error("Error submitting report:", error);
    return { success: false, error: "Failed to submit report" };
  }
}

// ============================================
// GET REPORTS
// ============================================

/**
 * Get user's reports
 */
export async function getUserReports(userId: string) {
  try {
    const reports = await db
      .select()
      .from(impactReport)
      .where(eq(impactReport.submittedBy, userId))
      .orderBy(desc(impactReport.createdAt));

    return reports;
  } catch (error) {
    console.error("Error getting user reports:", error);
    return [];
  }
}

/**
 * Get report by ID
 */
export async function getReportById(reportId: string) {
  "use cache";
  cacheLife({ stale: 1800, revalidate: 3600 * 2 });
  try {
    const result = await db
      .select({
        report: impactReport,
        author: {
          id: user.id,
          name: user.name,
          username: user.username,
          displayUsername: user.displayUsername,
          image: user.image,
        },
        authorProfile: userProfile,
        authorReputation: userReputation,
        authorBadges: sql<Array<typeof userBadge.$inferSelect>>`
          COALESCE(
            (SELECT json_agg(b.* ORDER BY b.earned_at DESC)
             FROM ${userBadge} b
             WHERE b.user_id = ${impactReport.submittedBy}),
            '[]'::json
          )
        `.as("author_badges"),
        capabilities: sql<Array<{ id: string; name: string }>>`
          COALESCE(
            (SELECT json_agg(json_build_object('id', c.id, 'name', c.name))
             FROM ${impactReportCapability} irc
             JOIN capability c ON c.id = irc.capability_id
             WHERE irc.impact_report_id = ${impactReport.id}),
            '[]'::json
          )
        `.as("capabilities"),
      })
      .from(impactReport)
      .leftJoin(user, eq(impactReport.submittedBy, user.id))
      .leftJoin(userProfile, eq(userProfile.userId, user.id))
      .leftJoin(userReputation, eq(userReputation.userId, user.id))
      .where(eq(impactReport.id, reportId))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const reportData = result[0];

    return {
      ...reportData.report,
      author: reportData.author || null,
      authorProfile: reportData.authorProfile || null,
      authorReputation: reportData.authorReputation || null,
      authorBadges: reportData.authorBadges || [],
      capabilities: reportData.capabilities || [],
    };
  } catch (error) {
    console.error("Error getting report:", error);
    return null;
  }
}

/**
 * Get all approved reports (for public feed)
 */
export async function getApprovedReports(limit = 20, offset = 0) {
  "use cache";
  cacheLife({ stale: 900, revalidate: 3600 * 2 });
  try {
    const reports = await db
      .select({
        report: impactReport,
        author: {
          id: user.id,
          name: user.name,
          username: user.username,
          displayUsername: user.displayUsername,
          image: user.image,
        },
        authorProfile: userProfile,
        authorReputation: userReputation,
        technologyName: technology.name,
        jobName: job.name,
      })
      .from(impactReport)
      .leftJoin(user, eq(impactReport.submittedBy, user.id))
      .leftJoin(userProfile, eq(userProfile.userId, user.id))
      .leftJoin(userReputation, eq(userReputation.userId, user.id))
      .leftJoin(technology, eq(impactReport.technologyId, technology.id))
      .leftJoin(job, eq(impactReport.jobId, job.id))
      .where(eq(impactReport.status, "approved"))
      .orderBy(desc(impactReport.createdAt))
      .limit(limit)
      .offset(offset);

    return reports.map((r) => ({
      ...r.report,
      author: r.author || null,
      authorProfile: r.authorProfile || null,
      authorReputation: r.authorReputation || null,
      technologyName: r.technologyName || null,
      jobName: r.jobName || null,
    }));
  } catch (error) {
    console.error("Error getting approved reports:", error);
    return [];
  }
}

/**
 * Get personalized reports based on user's job name and category
 */
export async function getPersonalizedReports(
  jobTitle?: string | null,
  category?: string | null,
  limit = 10,
) {
  "use cache";
  cacheLife({ stale: 120, revalidate: 3600 * 2 });
  try {
    const conditions = [eq(impactReport.status, "approved")];

    // If user has job name or category, filter by them
    if (jobTitle || category) {
      const jobConditions: SQL<unknown>[] = [];
      if (jobTitle) {
        const jobTitlePattern = `%${jobTitle}%`;
        // Match reports with jobs that have similar names
        const jobTitleCondition = sql`EXISTS (
          SELECT 1 FROM ${job} j
          WHERE j.id = ${impactReport.jobId}
          AND j.name ILIKE ${jobTitlePattern}
        )`;
        jobConditions.push(jobTitleCondition);
      }
      if (category) {
        const categoryPattern = `%${category}%`;
        // Match reports with jobs in the same category
        const categoryCondition = sql`EXISTS (
          SELECT 1 FROM ${job} j
          WHERE j.id = ${impactReport.jobId}
          AND j.category ILIKE ${categoryPattern}
        )`;
        jobConditions.push(categoryCondition);
      }
      if (jobConditions.length > 0) {
        const combinedCondition = or(...jobConditions);
        if (combinedCondition) {
          conditions.push(combinedCondition);
        }
      }
    }

    const reports = await db
      .select({
        report: impactReport,
        author: {
          id: user.id,
          name: user.name,
          username: user.username,
          displayUsername: user.displayUsername,
          image: user.image,
        },
        authorProfile: userProfile,
        authorReputation: userReputation,
        technologyName: technology.name,
        jobName: job.name,
      })
      .from(impactReport)
      .leftJoin(user, eq(impactReport.submittedBy, user.id))
      .leftJoin(userProfile, eq(userProfile.userId, user.id))
      .leftJoin(userReputation, eq(userReputation.userId, user.id))
      .leftJoin(technology, eq(impactReport.technologyId, technology.id))
      .leftJoin(job, eq(impactReport.jobId, job.id))
      .where(and(...conditions))
      .orderBy(desc(impactReport.upvotes), desc(impactReport.createdAt))
      .limit(limit);

    return reports.map((r) => ({
      ...r.report,
      author: r.author || null,
      authorProfile: r.authorProfile || null,
      authorReputation: r.authorReputation || null,
      technologyName: r.technologyName || null,
      jobName: r.jobName || null,
    }));
  } catch (error) {
    console.error("Error getting personalized reports:", error);
    return [];
  }
}

// ============================================
// UPDATE REPORT
// ============================================

/**
 * Update report (only by owner, before approval)
 */
export async function updateReport(
  reportId: string,
  userId: string,
  reportData: Partial<ImpactReportInput>,
) {
  try {
    // Check if report exists and belongs to user
    const existing = await db
      .select()
      .from(impactReport)
      .where(
        and(
          eq(impactReport.id, reportId),
          eq(impactReport.submittedBy, userId),
        ),
      )
      .limit(1);

    if (existing.length === 0) {
      return { success: false, error: "Report not found" };
    }

    // Can't edit approved/rejected reports
    if (existing[0].status !== "pending") {
      return {
        success: false,
        error: "Cannot edit reports that have been reviewed",
      };
    }

    // Update report
    await db
      .update(impactReport)
      .set({
        title: reportData.title,
        description: reportData.description,
        location: reportData.location,
        eventDate: reportData.eventDate,
        sourceUrl: reportData.sourceUrl,
        technologyId: reportData.technologyId,
        jobId: reportData.jobId,
        updatedAt: new Date(),
      })
      .where(eq(impactReport.id, reportId));

    // Update capability connections if provided
    if (reportData.capabilityIds !== undefined) {
      await db.transaction(async (tx) => {
        // Remove existing capability connections
        await tx
          .delete(impactReportCapability)
          .where(eq(impactReportCapability.impactReportId, reportId));

        // Add new capability connections
        if (reportData.capabilityIds && reportData.capabilityIds.length > 0) {
          const capabilityConnections = reportData.capabilityIds.map(
            (capabilityId) => ({
              id: generateRandomString(32),
              impactReportId: reportId,
              capabilityId,
            }),
          );
          await tx.insert(impactReportCapability).values(capabilityConnections);
        }
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating report:", error);
    return { success: false, error: "Failed to update report" };
  }
}

// ============================================
// DELETE REPORT
// ============================================

/**
 * Delete report (only by owner, only if pending)
 */
export async function deleteReport(reportId: string, userId: string) {
  try {
    // Check if report exists and belongs to user
    const existing = await db
      .select()
      .from(impactReport)
      .where(
        and(
          eq(impactReport.id, reportId),
          eq(impactReport.submittedBy, userId),
        ),
      )
      .limit(1);

    if (existing.length === 0) {
      return { success: false, error: "Report not found" };
    }

    // Can only delete pending reports
    if (existing[0].status !== "pending") {
      return {
        success: false,
        error: "Cannot delete reports that have been reviewed",
      };
    }

    // Delete report (cascade will handle capability connections)
    await db.delete(impactReport).where(eq(impactReport.id, reportId));

    return { success: true };
  } catch (error) {
    console.error("Error deleting report:", error);
    return { success: false, error: "Failed to delete report" };
  }
}

// ============================================
// UPVOTE REPORT
// ============================================

/**
 * Upvote a report
 */
export async function upvoteReport(reportId: string, _userId: string) {
  try {
    // Increment upvotes (simple implementation - no vote tracking table)
    await db
      .update(impactReport)
      .set({
        upvotes: sql`${impactReport.upvotes} + 1`,
      })
      .where(eq(impactReport.id, reportId));

    return { success: true };
  } catch (error) {
    console.error("Error upvoting report:", error);
    return { success: false, error: "Failed to upvote report" };
  }
}

// ============================================
// REPORTS FOR JOB/TECHNOLOGY/CAPABILITY
// ============================================

/**
 * Get reports for a specific job
 */
export async function getReportsForJob(jobId: string, limit = 10) {
  "use cache";
  cacheLife({ stale: 900, revalidate: 3600 * 2 });
  try {
    const reports = await db
      .select({
        report: impactReport,
        author: {
          id: user.id,
          name: user.name,
          username: user.username,
          displayUsername: user.displayUsername,
          image: user.image,
        },
        technologyName: technology.name,
      })
      .from(impactReport)
      .leftJoin(user, eq(impactReport.submittedBy, user.id))
      .leftJoin(technology, eq(impactReport.technologyId, technology.id))
      .where(
        and(eq(impactReport.jobId, jobId), eq(impactReport.status, "approved")),
      )
      .orderBy(desc(impactReport.upvotes), desc(impactReport.createdAt))
      .limit(limit);

    return reports.map((r) => ({
      ...r.report,
      author: r.author || null,
      technologyName: r.technologyName || null,
    }));
  } catch (error) {
    console.error("Error getting reports for job:", error);
    return [];
  }
}

/**
 * Get reports for a specific technology
 */
export async function getReportsForTechnology(
  technologyId: string,
  limit = 10,
) {
  "use cache";
  cacheLife({ stale: 900, revalidate: 3600 * 2 });
  try {
    const reports = await db
      .select({
        report: impactReport,
        author: {
          id: user.id,
          name: user.name,
          username: user.username,
          displayUsername: user.displayUsername,
          image: user.image,
        },
        jobName: job.name,
      })
      .from(impactReport)
      .leftJoin(user, eq(impactReport.submittedBy, user.id))
      .leftJoin(job, eq(impactReport.jobId, job.id))
      .where(
        and(
          eq(impactReport.technologyId, technologyId),
          eq(impactReport.status, "approved"),
        ),
      )
      .orderBy(desc(impactReport.upvotes), desc(impactReport.createdAt))
      .limit(limit);

    return reports.map((r) => ({
      ...r.report,
      author: r.author || null,
      jobName: r.jobName || null,
    }));
  } catch (error) {
    console.error("Error getting reports for technology:", error);
    return [];
  }
}

/**
 * Get reports demonstrating a specific capability
 */
export async function getReportsForCapability(
  capabilityId: string,
  limit = 10,
) {
  "use cache";
  cacheLife({ stale: 900, revalidate: 3600 * 2 });
  try {
    const reports = await db
      .select({
        report: impactReport,
        author: {
          id: user.id,
          name: user.name,
          username: user.username,
          displayUsername: user.displayUsername,
          image: user.image,
        },
        technologyName: technology.name,
        jobName: job.name,
      })
      .from(impactReport)
      .innerJoin(
        impactReportCapability,
        eq(impactReport.id, impactReportCapability.impactReportId),
      )
      .leftJoin(user, eq(impactReport.submittedBy, user.id))
      .leftJoin(technology, eq(impactReport.technologyId, technology.id))
      .leftJoin(job, eq(impactReport.jobId, job.id))
      .where(
        and(
          eq(impactReportCapability.capabilityId, capabilityId),
          eq(impactReport.status, "approved"),
        ),
      )
      .orderBy(desc(impactReport.upvotes), desc(impactReport.createdAt))
      .limit(limit);

    return reports.map((r) => ({
      ...r.report,
      author: r.author || null,
      technologyName: r.technologyName || null,
      jobName: r.jobName || null,
    }));
  } catch (error) {
    console.error("Error getting reports for capability:", error);
    return [];
  }
}
