"use server";

import { db } from "@/db";
import {
  report,
  reportEvidence,
  type ReportStatus,
  user,
  userBadge,
  userProfile,
  userReputation,
} from "@/db/schema";
import { capability, capabilityCategory } from "@/db/schema/capabilities";
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
import { generateRandomString } from "better-auth/crypto";
import {
  and,
  desc,
  eq,
  ilike,
  inArray,
  isNull,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import { cacheLife } from "next/cache";
import { z } from "zod";

/**
 * Helper: Create or get job by title
 */
async function createOrGetJob(
  jobTitle: string,
  industry?: string,
): Promise<string> {
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
    industry: industry || "Unknown",
    category: industry || "Unknown",
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

    // Create report
    const reportId = generateRandomString(32);
    const status: ReportStatus = validatedData.isDraft ? "draft" : "pending";

    await db.insert(report).values({
      id: reportId,
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
    });

    // Save evidence
    if (
      validatedData.step3.evidenceLinks &&
      validatedData.step3.evidenceLinks.length > 0
    ) {
      const evidence = validatedData.step3.evidenceLinks.map((url) => ({
        id: generateRandomString(32),
        reportId,
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
        reportId,
        type: "photo",
        fileUrl,
        description: null,
      }));

      await db.insert(reportEvidence).values(fileEvidence);
    }

    return { success: true, reportId };
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
    // Single query with LEFT JOINs for report, user, profile, and reputation
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
    const userId = reportData.report.userId;

    // Fetch one-to-many relationships (evidence, badges) in parallel
    const [evidence, authorBadges] = await Promise.all([
      db
        .select()
        .from(reportEvidence)
        .where(eq(reportEvidence.reportId, reportId)),
      userId
        ? db.select().from(userBadge).where(eq(userBadge.userId, userId))
        : Promise.resolve([]),
    ]);

    return {
      ...reportData.report,
      evidence,
      author: reportData.author || null,
      authorProfile: reportData.authorProfile || null,
      authorReputation: reportData.authorReputation || null,
      authorBadges,
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
    const reports = await db
      .select()
      .from(report)
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

    // Get all evidence for all reports in a single query
    const reportIds = reports.map((r) => r.id);
    const allEvidence =
      reportIds.length > 0
        ? await db
            .select()
            .from(reportEvidence)
            .where(inArray(reportEvidence.reportId, reportIds))
        : [];

    // Group evidence by reportId
    const evidenceMap = new Map<string, typeof allEvidence>();
    for (const evidence of allEvidence) {
      const existing = evidenceMap.get(evidence.reportId);
      if (existing) {
        existing.push(evidence);
      } else {
        evidenceMap.set(evidence.reportId, [evidence]);
      }
    }

    // Map reports with their evidence
    return reports.map((r) => ({
      ...r,
      evidence: evidenceMap.get(r.id) || [],
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
          WHERE j.id = ${report.jobId}
          AND j.industry ILIKE ${industryPattern}
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

    const reports = await db
      .select()
      .from(report)
      .where(and(...conditions))
      .orderBy(desc(report.upvotes), desc(report.createdAt))
      .limit(limit);

    // Get all evidence for all reports in a single query
    const reportIds = reports.map((r) => r.id);
    const allEvidence =
      reportIds.length > 0
        ? await db
            .select()
            .from(reportEvidence)
            .where(inArray(reportEvidence.reportId, reportIds))
        : [];

    // Group evidence by reportId
    const evidenceMap = new Map<string, typeof allEvidence>();
    for (const evidence of allEvidence) {
      const existing = evidenceMap.get(evidence.reportId);
      if (existing) {
        existing.push(evidence);
      } else {
        evidenceMap.set(evidence.reportId, [evidence]);
      }
    }

    // Map reports with their evidence
    return reports.map((r) => ({
      ...r,
      evidence: evidenceMap.get(r.id) || [],
    }));
  } catch (error) {
    console.error("Error getting personalized reports:", error);
    return [];
  }
}
