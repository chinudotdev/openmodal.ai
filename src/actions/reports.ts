"use server";

import { generateRandomString } from "better-auth/crypto";
import { and, desc, eq, ilike, isNull, or, type SQL, sql } from "drizzle-orm";
import { cacheLife } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import {
  type ReportStatus,
  report,
  reportEvidence,
  user,
  userBadge,
  userProfile,
  userReputation,
} from "@/db/schema";
import { capability, capabilityCategory } from "@/db/schema/capabilities";
import { industry } from "@/db/schema/industries";
import { job } from "@/db/schema/jobs";
import { checkOnboardingFromSession } from "@/lib/session-utils";
import {
  type BarrierReportInput,
  barrierReportSchema,
  type DeploymentReportInput,
  deploymentReportSchema,
  type ResearchReportInput,
  researchReportSchema,
} from "@/lib/validations";

/**
 * Helper: Create or get job by title
 */
async function createOrGetJob(
  jobTitle: string,
  industryName?: string,
): Promise<string> {
  // Find or create industry
  let industryRecord = await db
    .select()
    .from(industry)
    .where(eq(industry.name, industryName || "Unknown"))
    .limit(1);

  if (industryRecord.length === 0) {
    // Create new industry
    const industryId = `industry_${generateRandomString(16)}`;
    const industrySlug = (industryName || "unknown")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/(^_|_$)/g, "");

    await db.insert(industry).values({
      id: industryId,
      slug: industrySlug,
      name: industryName || "Unknown",
      displayOrder: 0,
      status: "active",
    });

    industryRecord = await db
      .select()
      .from(industry)
      .where(eq(industry.id, industryId))
      .limit(1);
  }

  if (industryRecord.length === 0) {
    throw new Error("Failed to create industry");
  }

  const industryId = industryRecord[0].id;

  // Try to find existing job by title
  const existing = await db
    .select()
    .from(job)
    .where(eq(job.title, jobTitle))
    .limit(1);

  if (existing.length > 0) {
    return existing[0].id;
  }

  // Create new job with basic info
  const jobId = generateRandomString(32);
  const slug = jobTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  await db.insert(job).values({
    id: jobId,
    slug,
    title: jobTitle,
    industryId,
    category: industryName || "Unknown",
    description: `Job: ${jobTitle}`,
    shortDescription: jobTitle,
    keyResponsibilities: [],
    automationPercentage: 0,
    automationStatus: "safe",
    totalTasks: 0,
    tasksReplaceable: 0,
    tasksPartial: 0,
    tasksSafe: 0,
    confidenceLevel: "low",
    verified: false,
    dataQuality: 0,
  });

  return jobId;
}

/**
 * Helper: Create or get capability by name
 */
async function createOrGetCapability(
  capabilityName: string,
  categoryId?: string,
): Promise<string> {
  // Try to find existing capability by name
  const existing = await db
    .select()
    .from(capability)
    .where(eq(capability.name, capabilityName))
    .limit(1);

  if (existing.length > 0) {
    return existing[0].id;
  }

  // Create new capability with basic info
  const capabilityId = generateRandomString(32);
  const slug = capabilityName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  // Get default category if not provided
  let finalCategoryId = categoryId;
  if (!finalCategoryId) {
    const categories = await db.select().from(capabilityCategory).limit(1);
    finalCategoryId = categories[0]?.id || generateRandomString(32);
  }

  await db.insert(capability).values({
    id: capabilityId,
    slug,
    name: capabilityName,
    categoryId: finalCategoryId,
    description: capabilityName,
    technicalDescription: `Capability: ${capabilityName}`,
    whyItMatters: `This capability is important for automation.`,
    progressPercentage: 0,
    status: "unsolved",
    confidenceLevel: "low",
    whatWorks: [],
    whatStruggles: [],
    whatDoesntWork: [],
    jobsProtectedCount: 0,
    jobsProtectedExamples: [],
    researchActivityCount: 0,
  });

  return capabilityId;
}

/**
 * Submit report (create or update)
 */
export async function submitReport(
  userId: string,
  reportData: DeploymentReportInput | BarrierReportInput | ResearchReportInput,
  reportId?: string, // Optional: if provided, update existing draft instead of creating new
) {
  try {
    // Check onboarding completion from session
    const onboardingCompleted = await checkOnboardingFromSession();
    if (onboardingCompleted === null) {
      return { success: false, error: "Please sign in to submit reports" };
    }
    if (!onboardingCompleted) {
      return {
        success: false,
        error: "Please complete onboarding before submitting reports",
      };
    }

    // Validate report data
    let validatedData:
      | DeploymentReportInput
      | BarrierReportInput
      | ResearchReportInput;
    if (reportData.type === "deployment") {
      validatedData = deploymentReportSchema.parse(reportData);
    } else if (reportData.type === "barrier") {
      validatedData = barrierReportSchema.parse(reportData);
    } else {
      validatedData = researchReportSchema.parse(reportData);
    }

    // Create or get job/capability if needed
    let jobId: string | null = null;
    let capabilityId: string | null = null;

    if (
      validatedData.type === "deployment" ||
      validatedData.type === "barrier"
    ) {
      if (validatedData.step1.jobId) {
        jobId = validatedData.step1.jobId;
      } else if (validatedData.step1.jobTitle) {
        jobId = await createOrGetJob(
          validatedData.step1.jobTitle,
          undefined, // industry not in schema
        );
      }
    }

    if (validatedData.type === "barrier" || validatedData.type === "research") {
      if (validatedData.step1.capabilityId) {
        capabilityId = validatedData.step1.capabilityId;
      } else if (
        validatedData.type === "research" &&
        validatedData.step1.capabilityName
      ) {
        capabilityId = await createOrGetCapability(
          validatedData.step1.capabilityName,
        );
      }
    }

    // Check if updating existing draft
    const isUpdate = !!reportId;
    const finalReportId = reportId || generateRandomString(32);

    if (isUpdate && reportId) {
      // Verify the report exists, belongs to user, and is a draft
      const existing = await db
        .select()
        .from(report)
        .where(
          and(
            eq(report.id, reportId),
            eq(report.userId, userId),
            eq(report.isDraft, true),
            isNull(report.deletedAt),
          ),
        )
        .limit(1);

      if (existing.length === 0) {
        return {
          success: false,
          error: "Draft not found or you don't have permission to edit it",
        };
      }
    }

    const status: ReportStatus = validatedData.isDraft ? "draft" : "pending";

    // Delete existing evidence if updating
    if (isUpdate) {
      await db
        .delete(reportEvidence)
        .where(eq(reportEvidence.reportId, finalReportId));
    }

    const reportValues = {
      id: finalReportId,
      userId,
      type: validatedData.type,
      status,
      isDraft: validatedData.isDraft || false,
      jobId,
      jobTitle:
        validatedData.type === "deployment" || validatedData.type === "barrier"
          ? validatedData.step1.jobTitle
          : null,
      capabilityId,
      technology: validatedData.step1.technology,
      company:
        validatedData.type === "research"
          ? validatedData.step1.organization || null
          : validatedData.type === "deployment" ||
              validatedData.type === "barrier"
            ? validatedData.step1.company || null
            : null,
      country: validatedData.step1.country || null,
      stateProvince: validatedData.step1.stateProvince || null,
      city: validatedData.step1.city || null,
      location: validatedData.step1.location || null,
      deploymentStatus:
        validatedData.type === "deployment"
          ? validatedData.step2.deploymentStatus
          : null,
      deploymentDate:
        validatedData.type === "deployment" &&
        validatedData.step2.deploymentDate
          ? validatedData.step2.deploymentDate
          : null,
      workersAffected:
        validatedData.type === "deployment"
          ? validatedData.step2.workersAffected
          : null,
      impactType:
        validatedData.type === "deployment"
          ? validatedData.step2.impactType
          : null,
      automationPercentage:
        validatedData.type === "deployment"
          ? validatedData.step2.automationPercentage
          : null,
      performanceComparison:
        validatedData.type === "deployment"
          ? validatedData.step2.performanceComparison
          : null,
      description: validatedData.step3.description,
      publishedAt: null, // Only published when approved by moderator
      updatedAt: new Date(),
    };

    if (isUpdate) {
      await db
        .update(report)
        .set(reportValues)
        .where(eq(report.id, finalReportId));
    } else {
      await db.insert(report).values(reportValues);
    }

    // Save evidence
    if (
      validatedData.step3.evidenceLinks &&
      validatedData.step3.evidenceLinks.length > 0
    ) {
      const evidence = validatedData.step3.evidenceLinks.map((url) => ({
        id: generateRandomString(32),
        reportId: finalReportId,
        type: "link",
        url,
        description: null,
      }));

      await db.insert(reportEvidence).values(evidence);
    }

    if (
      validatedData.step3.fileUrls &&
      validatedData.step3.fileUrls.length > 0
    ) {
      const fileEvidence = validatedData.step3.fileUrls.map((fileUrl) => ({
        id: generateRandomString(32),
        reportId: finalReportId,
        type: "photo",
        fileUrl,
        description: null,
      }));

      await db.insert(reportEvidence).values(fileEvidence);
    }

    return { success: true, reportId: finalReportId };
  } catch (error) {
    console.error("Error submitting report:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Validation failed",
      };
    }
    return { success: false, error: "Failed to submit report" };
  }
}

/**
 * Save report as draft
 */
export async function saveReportDraft(
  userId: string,
  reportData: Partial<
    DeploymentReportInput | BarrierReportInput | ResearchReportInput
  >,
) {
  try {
    // Check onboarding completion from session
    const onboardingCompleted = await checkOnboardingFromSession();
    if (onboardingCompleted === null) {
      return { success: false, error: "Please sign in to save drafts" };
    }
    if (!onboardingCompleted) {
      return {
        success: false,
        error: "Please complete onboarding before saving drafts",
      };
    }

    // Create draft report with partial data
    const reportId = generateRandomString(32);

    await db.insert(report).values({
      id: reportId,
      userId,
      type: reportData.type || "deployment",
      status: "draft",
      isDraft: true,
      technology: "", // Required field, will be filled when draft is completed
      description: "", // Required field, will be filled when draft is completed
      publishedAt: null,
    });

    return { success: true, reportId };
  } catch (error) {
    console.error("Error saving draft:", error);
    return { success: false, error: "Failed to save draft" };
  }
}

/**
 * Publish draft report
 */
export async function publishDraft(reportId: string, userId: string) {
  try {
    // Check onboarding completion from session
    const onboardingCompleted = await checkOnboardingFromSession();
    if (onboardingCompleted === null) {
      return { success: false, error: "Please sign in to publish reports" };
    }
    if (!onboardingCompleted) {
      return {
        success: false,
        error: "Please complete onboarding before publishing reports",
      };
    }

    // Check if report exists and belongs to user
    const existing = await db
      .select()
      .from(report)
      .where(
        and(
          eq(report.id, reportId),
          eq(report.userId, userId),
          eq(report.isDraft, true),
          isNull(report.deletedAt),
        ),
      )
      .limit(1);

    if (existing.length === 0) {
      return { success: false, error: "Draft not found" };
    }

    // Update report status
    await db
      .update(report)
      .set({
        isDraft: false,
        status: "pending",
        updatedAt: new Date(),
      })
      .where(eq(report.id, reportId));

    return { success: true };
  } catch (error) {
    console.error("Error publishing draft:", error);
    return { success: false, error: "Failed to publish draft" };
  }
}

/**
 * Get user's reports
 */
export async function getUserReports(userId: string, includeDrafts = true) {
  try {
    const conditions = [eq(report.userId, userId), isNull(report.deletedAt)];

    if (!includeDrafts) {
      conditions.push(eq(report.isDraft, false));
    }

    const reports = await db
      .select()
      .from(report)
      .where(and(...conditions))
      .orderBy(desc(report.createdAt));

    return reports;
  } catch (error) {
    console.error("Error getting user reports:", error);
    return [];
  }
}

/**
 * Get draft report for editing
 * Converts flat database structure to nested form structure
 */
export async function getDraftForEditing(
  reportId: string,
  userId: string,
): Promise<
  | {
      success: true;
      data: DeploymentReportInput | BarrierReportInput | ResearchReportInput;
    }
  | { success: false; error: string }
> {
  try {
    // Get the report and verify ownership
    const draftReport = await db
      .select()
      .from(report)
      .where(
        and(
          eq(report.id, reportId),
          eq(report.userId, userId),
          eq(report.isDraft, true),
          isNull(report.deletedAt),
        ),
      )
      .limit(1);

    if (draftReport.length === 0) {
      return {
        success: false,
        error: "Draft not found or you don't have permission",
      };
    }

    const r = draftReport[0];

    // Get evidence links
    const evidence = await db
      .select()
      .from(reportEvidence)
      .where(eq(reportEvidence.reportId, reportId));

    const evidenceLinks = evidence
      .filter(
        (e): e is typeof e & { url: string } => e.type === "link" && !!e.url,
      )
      .map((e) => e.url);
    const fileUrls = evidence
      .filter(
        (e): e is typeof e & { fileUrl: string } =>
          e.type === "photo" && !!e.fileUrl,
      )
      .map((e) => e.fileUrl);

    // Convert to form structure based on report type
    if (r.type === "deployment") {
      const formData: DeploymentReportInput = {
        type: "deployment",
        isDraft: true,
        step1: {
          jobId: r.jobId || undefined,
          jobTitle: r.jobTitle || "",
          technology: r.technology,
          company: r.company || undefined,
          country: r.country || "",
          stateProvince: r.stateProvince || undefined,
          city: r.city || undefined,
          location: r.location || undefined,
        },
        step2: {
          deploymentStatus:
            (r.deploymentStatus as
              | "fully_deployed"
              | "pilot"
              | "announced"
              | "failed") || "pilot",
          deploymentDate: r.deploymentDate || undefined,
          workersAffected: r.workersAffected || undefined,
          impactType:
            (r.impactType as
              | "completely_replaced"
              | "partially_replaced"
              | "augmented"
              | "no_job_loss") || "no_job_loss",
          automationPercentage: r.automationPercentage || 0,
          performanceComparison:
            (r.performanceComparison as
              | "better_than_humans"
              | "about_same"
              | "worse_improving"
              | "worse_not_improving") || "about_same",
        },
        step3: {
          description: r.description || "",
          evidenceLinks: evidenceLinks.length > 0 ? evidenceLinks : [""],
          fileUrls: fileUrls.length > 0 ? fileUrls : undefined,
          source: "other", // Default since source field doesn't exist in DB schema
          sourceOther: undefined,
        },
      };
      return { success: true, data: formData };
    }

    if (r.type === "barrier") {
      // Note: barrier step2 fields may not be in DB schema yet, using defaults
      const formData: BarrierReportInput = {
        type: "barrier",
        isDraft: true,
        step1: {
          jobId: r.jobId || undefined,
          jobTitle: r.jobTitle || "",
          capabilityId: r.capabilityId || undefined,
          technology: r.technology,
          company: r.company || undefined,
          country: r.country || "",
          stateProvince: r.stateProvince || undefined,
          city: r.city || undefined,
          location: r.location || undefined,
        },
        step2: {
          barrierType: "other", // Default since field may not exist in schema
          barrierDescription: "", // Default since field may not exist in schema
          estimatedSolveDate: undefined,
          organizationsWorkingOnIt: undefined,
        },
        step3: {
          description: r.description || "",
          evidenceLinks: evidenceLinks.length > 0 ? evidenceLinks : [""],
          fileUrls: fileUrls.length > 0 ? fileUrls : undefined,
          source: "other", // Default since field may not exist in schema
          sourceOther: undefined,
        },
      };
      return { success: true, data: formData };
    }

    // Research report
    // Note: research step2 fields may not be in DB schema yet, using defaults
    const formData: ResearchReportInput = {
      type: "research",
      isDraft: true,
      step1: {
        capabilityId: r.capabilityId || undefined,
        capabilityName: "", // Default since field may not exist in schema
        technology: r.technology,
        organization: r.company || undefined,
        country: r.country || undefined,
        stateProvince: r.stateProvince || undefined,
        city: r.city || undefined,
      },
      step2: {
        researchType: "other", // Default since field may not exist in schema
        impactDescription: "", // Default since field may not exist in schema
        publicationDate: undefined,
        potentialJobsAffected: undefined,
      },
      step3: {
        description: r.description || "",
        evidenceLinks: evidenceLinks.length > 0 ? evidenceLinks : [""],
        fileUrls: fileUrls.length > 0 ? fileUrls : undefined,
        source: "other", // Default since field may not exist in schema
        sourceOther: undefined,
      },
    };
    return { success: true, data: formData };
  } catch (error) {
    console.error("Error getting draft for editing:", error);
    return { success: false, error: "Failed to load draft" };
  }
}

/**
 * Get user's drafts
 */
export async function getUserDrafts(userId: string) {
  try {
    const drafts = await db
      .select()
      .from(report)
      .where(
        and(
          eq(report.userId, userId),
          eq(report.isDraft, true),
          isNull(report.deletedAt),
        ),
      )
      .orderBy(desc(report.createdAt));

    return drafts;
  } catch (error) {
    console.error("Error getting user drafts:", error);
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
    // Single query with LEFT JOINs and JSON aggregation for evidence and badges
    const result = await db
      .select({
        report,
        author: {
          id: user.id,
          name: user.name,
          username: user.username,
          displayUsername: user.displayUsername,
          image: user.image,
        },
        authorProfile: userProfile,
        authorReputation: userReputation,
        evidence: sql<Array<typeof reportEvidence.$inferSelect>>`
          COALESCE(
            (SELECT json_agg(e.* ORDER BY e.created_at)
             FROM ${reportEvidence} e
             WHERE e.report_id = ${report.id}),
            '[]'::json
          )
        `.as("evidence"),
        authorBadges: sql<Array<typeof userBadge.$inferSelect>>`
          COALESCE(
            (SELECT json_agg(b.* ORDER BY b.earned_at DESC)
             FROM ${userBadge} b
             WHERE b.user_id = ${report.userId}),
            '[]'::json
          )
        `.as("author_badges"),
      })
      .from(report)
      .leftJoin(user, eq(report.userId, user.id))
      .leftJoin(userProfile, eq(userProfile.userId, user.id))
      .leftJoin(userReputation, eq(userReputation.userId, user.id))
      .where(and(eq(report.id, reportId), isNull(report.deletedAt)))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const reportData = result[0];

    return {
      ...reportData.report,
      evidence: reportData.evidence || [],
      author: reportData.author || null,
      authorProfile: reportData.authorProfile || null,
      authorReputation: reportData.authorReputation || null,
      authorBadges: reportData.authorBadges || [],
    };
  } catch (error) {
    console.error("Error getting report:", error);
    return null;
  }
}

/**
 * Update report
 */
export async function updateReport(
  reportId: string,
  userId: string,
  reportData: Partial<
    DeploymentReportInput | BarrierReportInput | ResearchReportInput
  >,
) {
  try {
    // Check onboarding completion from session
    const onboardingCompleted = await checkOnboardingFromSession();
    if (onboardingCompleted === null) {
      return { success: false, error: "Please sign in to update reports" };
    }
    if (!onboardingCompleted) {
      return {
        success: false,
        error: "Please complete onboarding before updating reports",
      };
    }

    // Check if report exists and belongs to user
    const existing = await db
      .select()
      .from(report)
      .where(
        and(
          eq(report.id, reportId),
          eq(report.userId, userId),
          isNull(report.deletedAt),
        ),
      )
      .limit(1);

    if (existing.length === 0) {
      return { success: false, error: "Report not found" };
    }

    // Check if report has verifications (can't edit if verified)
    if (
      existing[0].verificationCount > 0 &&
      existing[0].status === "approved"
    ) {
      return { success: false, error: "Cannot edit verified reports" };
    }

    // Update report
    await db
      .update(report)
      .set({
        ...reportData,
        updatedAt: new Date(),
      })
      .where(eq(report.id, reportId));

    return { success: true };
  } catch (error) {
    console.error("Error updating report:", error);
    return { success: false, error: "Failed to update report" };
  }
}

/**
 * Soft delete report (only if no verifications)
 */
export async function softDeleteReport(reportId: string, userId: string) {
  try {
    // Check onboarding completion from session
    const onboardingCompleted = await checkOnboardingFromSession();
    if (onboardingCompleted === null) {
      return { success: false, error: "Please sign in to delete reports" };
    }
    if (!onboardingCompleted) {
      return {
        success: false,
        error: "Please complete onboarding before deleting reports",
      };
    }

    // Check if report exists and belongs to user
    const existing = await db
      .select()
      .from(report)
      .where(
        and(
          eq(report.id, reportId),
          eq(report.userId, userId),
          isNull(report.deletedAt),
        ),
      )
      .limit(1);

    if (existing.length === 0) {
      return { success: false, error: "Report not found" };
    }

    // Check if report has verifications (can't delete if verified)
    if (existing[0].verificationCount > 0) {
      return {
        success: false,
        error: "Cannot delete reports with verifications",
      };
    }

    // Soft delete
    await db
      .update(report)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(report.id, reportId));

    return { success: true };
  } catch (error) {
    console.error("Error soft deleting report:", error);
    return { success: false, error: "Failed to delete report" };
  }
}

/**
 * Restore soft-deleted report
 */
export async function restoreReport(reportId: string, userId: string) {
  try {
    // Check onboarding completion from session
    const onboardingCompleted = await checkOnboardingFromSession();
    if (onboardingCompleted === null) {
      return { success: false, error: "Please sign in to restore reports" };
    }
    if (!onboardingCompleted) {
      return {
        success: false,
        error: "Please complete onboarding before restoring reports",
      };
    }

    // Check if report exists and belongs to user
    const existing = await db
      .select()
      .from(report)
      .where(and(eq(report.id, reportId), eq(report.userId, userId)))
      .limit(1);

    if (existing.length === 0) {
      return { success: false, error: "Report not found" };
    }

    // Restore
    await db
      .update(report)
      .set({
        deletedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(report.id, reportId));

    return { success: true };
  } catch (error) {
    console.error("Error restoring report:", error);
    return { success: false, error: "Failed to restore report" };
  }
}

/**
 * Get all approved reports (for public feed)
 */
export async function getApprovedReports(limit = 20, offset = 0) {
  "use cache";
  cacheLife({ stale: 900, revalidate: 3600 * 2 });
  try {
    // Single query with JSON aggregation for evidence and author info
    const reports = await db
      .select({
        report,
        author: {
          id: user.id,
          name: user.name,
          username: user.username,
          displayUsername: user.displayUsername,
          image: user.image,
        },
        authorProfile: userProfile,
        authorReputation: userReputation,
        evidence: sql<Array<typeof reportEvidence.$inferSelect>>`
          COALESCE(
            (SELECT json_agg(e.* ORDER BY e.created_at)
             FROM ${reportEvidence} e
             WHERE e.report_id = ${report.id}),
            '[]'::json
          )
        `.as("evidence"),
      })
      .from(report)
      .leftJoin(user, eq(report.userId, user.id))
      .leftJoin(userProfile, eq(userProfile.userId, user.id))
      .leftJoin(userReputation, eq(userReputation.userId, user.id))
      .where(
        and(
          eq(report.status, "approved"),
          eq(report.isDraft, false),
          isNull(report.deletedAt),
        ),
      )
      .orderBy(desc(report.createdAt))
      .limit(limit)
      .offset(offset);

    return reports.map((r) => ({
      ...r.report,
      author: r.author || null,
      authorProfile: r.authorProfile || null,
      authorReputation: r.authorReputation || null,
      evidence: r.evidence || [],
    }));
  } catch (error) {
    console.error("Error getting approved reports:", error);
    return [];
  }
}

/**
 * Get personalized reports based on user's job title and industry
 */
export async function getPersonalizedReports(
  jobTitle?: string | null,
  industry?: string | null,
  limit = 10,
) {
  "use cache";
  cacheLife({ stale: 120, revalidate: 3600 * 2 });
  try {
    const conditions = [
      eq(report.status, "approved"),
      eq(report.isDraft, false),
      isNull(report.deletedAt),
    ];

    // If user has job title or industry, filter by them
    if (jobTitle || industry) {
      const jobConditions: SQL<unknown>[] = [];
      if (jobTitle) {
        const jobTitlePattern = `%${jobTitle}%`;
        // Match reports with same job title (from jobId or jobTitle field)
        const jobTitleCondition = or(
          ilike(report.jobTitle, jobTitlePattern),
          sql`EXISTS (
            SELECT 1 FROM ${job} j
            WHERE j.id = ${report.jobId}
            AND j.title ILIKE ${jobTitlePattern}
          )`,
        );
        if (jobTitleCondition) {
          jobConditions.push(jobTitleCondition);
        }
      }
      if (industry) {
        const industryPattern = `%${industry}%`;
        // Match reports with same industry
        const industryCondition = sql`EXISTS (
          SELECT 1 FROM ${job} j
          INNER JOIN industry i ON j.industry_id = i.id
          WHERE j.id = ${report.jobId}
          AND i.name ILIKE ${industryPattern}
        )`;
        jobConditions.push(industryCondition);
      }
      if (jobConditions.length > 0) {
        const combinedCondition = or(...jobConditions);
        if (combinedCondition) {
          conditions.push(combinedCondition);
        }
      }
    }

    // Single query with JSON aggregation for evidence and author info
    const reports = await db
      .select({
        report,
        author: {
          id: user.id,
          name: user.name,
          username: user.username,
          displayUsername: user.displayUsername,
          image: user.image,
        },
        authorProfile: userProfile,
        authorReputation: userReputation,
        evidence: sql<Array<typeof reportEvidence.$inferSelect>>`
          COALESCE(
            (SELECT json_agg(e.* ORDER BY e.created_at)
             FROM ${reportEvidence} e
             WHERE e.report_id = ${report.id}),
            '[]'::json
          )
        `.as("evidence"),
      })
      .from(report)
      .leftJoin(user, eq(report.userId, user.id))
      .leftJoin(userProfile, eq(userProfile.userId, user.id))
      .leftJoin(userReputation, eq(userReputation.userId, user.id))
      .where(and(...conditions))
      .orderBy(desc(report.upvotes), desc(report.createdAt))
      .limit(limit);

    return reports.map((r) => ({
      ...r.report,
      author: r.author || null,
      authorProfile: r.authorProfile || null,
      authorReputation: r.authorReputation || null,
      evidence: r.evidence || [],
    }));
  } catch (error) {
    console.error("Error getting personalized reports:", error);
    return [];
  }
}
