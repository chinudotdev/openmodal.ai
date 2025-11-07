"use server";

import { generateRandomString } from "better-auth/crypto";
import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { capability } from "@/db/schema/capabilities";
import {
  type AutomationStatus,
  job,
  jobCapability,
  jobComment,
  jobGeographicData,
  jobTracking,
  relatedJob,
  task,
  taskCapability,
} from "@/db/schema/jobs";
import { checkOnboardingFromSession } from "@/lib/session-utils";
import { cacheLife, cacheTag } from "next/cache";

// Types
export type JobFilters = {
  industry?: string;
  status?: AutomationStatus;
  riskMin?: number;
  riskMax?: number;
  salaryMin?: number;
  salaryMax?: number;
  search?: string;
};

export type JobSort =
  | "risk_desc"
  | "risk_asc"
  | "workers_desc"
  | "salary_desc"
  | "name_asc"
  | "updated_desc";

export type CommentVoteType = "up" | "down";

// Type for job comparison data (matches JobComparisonTable props)
export type JobComparisonData = {
  id: string;
  slug: string;
  title: string;
  automationPercentage: number;
  automationStatus: "safe" | "partial" | "high_risk" | "automated";
  totalWorkersGlobal: number | null;
  medianSalaryUsa: number | null;
  estimatedAutomationYear: number | null;
  growthRate: number | null;
};

// Compare jobs (up to 3)
export async function compareJobs(
  slugs: string[],
): Promise<JobComparisonData[]> {
  "use cache";
  cacheLife({ stale: 3600, revalidate: 3600 * 4 });

  // Limit to 3 jobs
  const jobSlugs = slugs.slice(0, 3).filter(Boolean);

  if (jobSlugs.length === 0) {
    return [];
  }

  try {
    // Fetch only the fields needed for comparison in a single query
    const jobs = await db
      .select({
        id: job.id,
        slug: job.slug,
        title: job.title,
        automationPercentage: job.automationPercentage,
        automationStatus: job.automationStatus,
        totalWorkersGlobal: job.totalWorkersGlobal,
        medianSalaryUsa: job.medianSalaryUsa,
        estimatedAutomationYear: job.estimatedAutomationYear,
        growthRate: job.growthRate,
      })
      .from(job)
      .where(inArray(job.slug, jobSlugs));

    // Return jobs in the order of the slugs provided, with proper type conversions
    return jobSlugs
      .map((slug) => jobs.find((job) => job.slug === slug))
      .filter((job): job is NonNullable<typeof job> => job !== undefined)
      .map(
        (job): JobComparisonData => ({
          id: job.id,
          slug: job.slug,
          title: job.title,
          automationPercentage: job.automationPercentage,
          automationStatus: job.automationStatus,
          totalWorkersGlobal: job.totalWorkersGlobal,
          medianSalaryUsa: job.medianSalaryUsa
            ? Number(job.medianSalaryUsa)
            : null,
          estimatedAutomationYear: job.estimatedAutomationYear,
          growthRate: job.growthRate ? Number(job.growthRate) : null,
        }),
      );
  } catch (error) {
    console.error("Error comparing jobs:", error);
    return [];
  }
}

// Get job by slug
export async function getJobBySlug(slug: string) {
  "use cache";
  cacheLife({ stale: 300, revalidate: 3600 * 2 });

  const result = await db.select().from(job).where(eq(job.slug, slug)).limit(1);

  if (result.length === 0) {
    return null;
  }

  const jobData = result[0];

  // Run independent queries in parallel
  const [tasks, jobCaps, geographicData, related] = await Promise.all([
    // Get tasks
    db
      .select()
      .from(task)
      .where(eq(task.jobId, jobData.id))
      .orderBy(asc(task.percentageOfJob)),
    // Get job capabilities (rollup)
    db
      .select({
        capabilityId: jobCapability.capabilityId,
        importance: jobCapability.importance,
        taskCount: jobCapability.taskCount,
        percentageOfJob: jobCapability.percentageOfJob,
        blockingAutomation: jobCapability.blockingAutomation,
        notes: jobCapability.notes,
        capability: capability,
      })
      .from(jobCapability)
      .innerJoin(capability, eq(jobCapability.capabilityId, capability.id))
      .where(eq(jobCapability.jobId, jobData.id))
      .orderBy(
        desc(jobCapability.blockingAutomation),
        desc(jobCapability.percentageOfJob),
      ),
    // Get geographic data
    db
      .select()
      .from(jobGeographicData)
      .where(eq(jobGeographicData.jobId, jobData.id))
      .orderBy(desc(jobGeographicData.workersCount)),
    // Get related jobs
    db
      .select({
        relatedJob: job,
        similarityScore: relatedJob.similarityScore,
        relationshipType: relatedJob.relationshipType,
      })
      .from(relatedJob)
      .innerJoin(job, eq(relatedJob.relatedJobId, job.id))
      .where(eq(relatedJob.jobId, jobData.id))
      .orderBy(desc(relatedJob.similarityScore))
      .limit(10),
  ]);

  // Get task capabilities (depends on tasks)
  const taskIds = tasks.map((t) => t.id);
  const taskCaps =
    taskIds.length > 0
      ? await db
          .select({
            taskId: taskCapability.taskId,
            capabilityId: taskCapability.capabilityId,
            importance: taskCapability.importance,
            notes: taskCapability.notes,
            capability: capability,
          })
          .from(taskCapability)
          .innerJoin(capability, eq(taskCapability.capabilityId, capability.id))
          .where(inArray(taskCapability.taskId, taskIds))
      : [];

  // Group capabilities by task
  const capabilitiesByTask = new Map<string, typeof taskCaps>();
  for (const tc of taskCaps) {
    if (!capabilitiesByTask.has(tc.taskId)) {
      capabilitiesByTask.set(tc.taskId, []);
    }
    capabilitiesByTask.get(tc.taskId)!.push(tc);
  }

  return {
    ...jobData,
    tasks: tasks.map((t) => ({
      ...t,
      capabilities: capabilitiesByTask.get(t.id) || [],
    })),
    capabilities: jobCaps.map((jc) => ({
      ...jc.capability,
      importance: jc.importance,
      taskCount: jc.taskCount,
      percentageOfJob: jc.percentageOfJob,
      blockingAutomation: jc.blockingAutomation,
      notes: jc.notes,
    })),
    geographicData,
    relatedJobs: related.map((r) => ({
      ...r.relatedJob,
      similarityScore: r.similarityScore,
      relationshipType: r.relationshipType,
    })),
  };
}

// Get jobs with filters
export async function getJobs(
  filters: JobFilters = {},
  sort: JobSort = "risk_desc",
  limit = 20,
  offset = 0,
) {
  "use cache";
  cacheLife({ stale: 300, revalidate: 3600 * 1 });

  const conditions = [];

  if (filters.industry) {
    conditions.push(eq(job.industry, filters.industry));
  }

  if (filters.status) {
    conditions.push(eq(job.automationStatus, filters.status));
  }

  if (filters.riskMin !== undefined) {
    conditions.push(sql`${job.automationPercentage} >= ${filters.riskMin}`);
  }

  if (filters.riskMax !== undefined) {
    conditions.push(sql`${job.automationPercentage} <= ${filters.riskMax}`);
  }

  if (filters.salaryMin !== undefined) {
    conditions.push(sql`${job.medianSalaryUsa} >= ${filters.salaryMin}`);
  }

  if (filters.salaryMax !== undefined) {
    conditions.push(sql`${job.medianSalaryUsa} <= ${filters.salaryMax}`);
  }

  if (filters.search) {
    conditions.push(
      or(
        ilike(job.title, `%${filters.search}%`),
        ilike(job.shortDescription, `%${filters.search}%`),
        ilike(job.industry, `%${filters.search}%`),
        ilike(job.category, `%${filters.search}%`),
      ),
    );
  }

  // Build query with where clause
  const baseQuery = db.select().from(job);
  const queryWithWhere =
    conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;

  // Apply sorting
  const getSortOrder = () => {
    switch (sort) {
      case "risk_desc":
        return desc(job.automationPercentage);
      case "risk_asc":
        return asc(job.automationPercentage);
      case "workers_desc":
        return desc(job.totalWorkersGlobal);
      case "salary_desc":
        return desc(job.medianSalaryUsa);
      case "name_asc":
        return asc(job.title);
      case "updated_desc":
        return desc(job.updatedAt);
      default:
        return desc(job.automationPercentage);
    }
  };

  // Apply pagination and execute
  const results = await queryWithWhere
    .orderBy(getSortOrder())
    .limit(limit)
    .offset(offset);

  return results;
}

// Get job categories/industries
export async function getJobCategories() {
  "use cache";
  cacheLife({ stale: 600, revalidate: 3600 * 5 });
  const results = await db
    .selectDistinct({ industry: job.industry })
    .from(job)
    .orderBy(asc(job.industry));

  return results.map((r) => r.industry).filter(Boolean);
}

// Track job
export async function trackJob(jobId: string, userId: string) {
  // Check onboarding completion from session
  const onboardingCompleted = await checkOnboardingFromSession();
  if (onboardingCompleted === null) {
    return { success: false, error: "Please sign in to track jobs" };
  }
  if (!onboardingCompleted) {
    return {
      success: false,
      error: "Please complete onboarding before tracking jobs",
    };
  }

  // Check if already tracking
  const existing = await db
    .select()
    .from(jobTracking)
    .where(and(eq(jobTracking.jobId, jobId), eq(jobTracking.userId, userId)))
    .limit(1);

  if (existing.length > 0) {
    return { success: true, alreadyTracking: true };
  }

  // Create tracking record and update tracking count in parallel
  await Promise.all([
    db.insert(jobTracking).values({
      id: generateRandomString(32),
      jobId,
      userId,
      emailNotifications: true,
    }),
    db
      .update(job)
      .set({
        trackingCount: sql`${job.trackingCount} + 1`,
      })
      .where(eq(job.id, jobId)),
  ]);

  return { success: true, alreadyTracking: false };
}

// Untrack job
export async function untrackJob(jobId: string, userId: string) {
  // Check onboarding completion from session
  const onboardingCompleted = await checkOnboardingFromSession();
  if (onboardingCompleted === null) {
    return { success: false, error: "Please sign in to untrack jobs" };
  }
  if (!onboardingCompleted) {
    return {
      success: false,
      error: "Please complete onboarding before untracking jobs",
    };
  }

  // Delete tracking record and update tracking count in parallel
  await Promise.all([
    db
      .delete(jobTracking)
      .where(and(eq(jobTracking.jobId, jobId), eq(jobTracking.userId, userId))),
    db
      .update(job)
      .set({
        trackingCount: sql`GREATEST(${job.trackingCount} - 1, 0)`,
      })
      .where(eq(job.id, jobId)),
  ]);

  return { success: true };
}

// Check if user is tracking
export async function isTrackingJob(jobId: string, userId: string) {
  const result = await db
    .select()
    .from(jobTracking)
    .where(and(eq(jobTracking.jobId, jobId), eq(jobTracking.userId, userId)))
    .limit(1);

  return result.length > 0;
}

// Increment view count
export async function incrementViewCount(jobId: string) {
  await db
    .update(job)
    .set({
      viewCount: sql`${job.viewCount} + 1`,
    })
    .where(eq(job.id, jobId));

  return { success: true };
}

// Get comments
export async function getJobComments(jobId: string, parentId?: string) {
  const conditions = [eq(jobComment.jobId, jobId)];

  if (parentId) {
    conditions.push(eq(jobComment.parentId, parentId));
  } else {
    conditions.push(sql`${jobComment.parentId} IS NULL`);
  }

  const comments = await db
    .select()
    .from(jobComment)
    .where(and(...conditions))
    .orderBy(desc(jobComment.upvotes), desc(jobComment.createdAt));

  // Get replies for each comment
  const commentIds = comments.map((c) => c.id);
  const replies =
    commentIds.length > 0
      ? await db
          .select()
          .from(jobComment)
          .where(inArray(jobComment.parentId, commentIds))
          .orderBy(desc(jobComment.upvotes), desc(jobComment.createdAt))
      : [];

  // Group replies by parent
  const repliesMap = new Map<string, typeof replies>();
  for (const reply of replies) {
    if (reply.parentId) {
      if (!repliesMap.has(reply.parentId)) {
        repliesMap.set(reply.parentId, []);
      }
      repliesMap.get(reply.parentId)!.push(reply);
    }
  }

  return comments.map((comment) => ({
    ...comment,
    replies: repliesMap.get(comment.id) || [],
  }));
}

// Create comment
export async function createJobComment(
  jobId: string,
  userId: string,
  content: string,
  parentId?: string,
) {
  // Check onboarding completion from session
  const onboardingCompleted = await checkOnboardingFromSession();
  if (onboardingCompleted === null) {
    return { success: false, error: "Please sign in to comment" };
  }
  if (!onboardingCompleted) {
    return {
      success: false,
      error: "Please complete onboarding before commenting",
    };
  }

  const id = generateRandomString(32);
  await db.insert(jobComment).values({
    id,
    jobId,
    userId,
    parentId: parentId || null,
    content,
    upvotes: 0,
  });

  return { success: true, commentId: id };
}

// Vote comment
export async function voteJobComment(
  commentId: string,
  userId: string,
  voteType: CommentVoteType,
) {
  // Check onboarding completion from session
  const onboardingCompleted = await checkOnboardingFromSession();
  if (onboardingCompleted === null) {
    return { success: false, error: "Please sign in to vote" };
  }
  if (!onboardingCompleted) {
    return {
      success: false,
      error: "Please complete onboarding before voting",
    };
  }

  // Note: This is a simplified version. In a full implementation,
  // you'd have a job_comment_vote table similar to capability_comment_vote
  // For now, we'll just update upvotes directly
  const current = await db
    .select({ upvotes: jobComment.upvotes })
    .from(jobComment)
    .where(eq(jobComment.id, commentId))
    .limit(1);

  if (current.length > 0) {
    const delta = voteType === "up" ? 1 : -1;
    const newUpvotes = Math.max(0, current[0].upvotes + delta);
    await db
      .update(jobComment)
      .set({ upvotes: newUpvotes })
      .where(eq(jobComment.id, commentId));
  }

  return { success: true };
}

// Get related jobs
export async function getRelatedJobs(jobId: string) {
  const related = await db
    .select({
      relatedJob: job,
      similarityScore: relatedJob.similarityScore,
      relationshipType: relatedJob.relationshipType,
    })
    .from(relatedJob)
    .innerJoin(job, eq(relatedJob.relatedJobId, job.id))
    .where(eq(relatedJob.jobId, jobId))
    .orderBy(desc(relatedJob.similarityScore))
    .limit(10);

  return related.map((r) => ({
    ...r.relatedJob,
    similarityScore: r.similarityScore,
    relationshipType: r.relationshipType,
  }));
}

// Get job tasks
export async function getJobTasks(jobId: string) {
  const tasks = await db
    .select()
    .from(task)
    .where(eq(task.jobId, jobId))
    .orderBy(asc(task.percentageOfJob));

  // Get task capabilities
  const taskIds = tasks.map((t) => t.id);
  const taskCaps =
    taskIds.length > 0
      ? await db
          .select({
            taskId: taskCapability.taskId,
            capabilityId: taskCapability.capabilityId,
            importance: taskCapability.importance,
            notes: taskCapability.notes,
            capability: capability,
          })
          .from(taskCapability)
          .innerJoin(capability, eq(taskCapability.capabilityId, capability.id))
          .where(inArray(taskCapability.taskId, taskIds))
      : [];

  // Group capabilities by task
  const capabilitiesByTask = new Map<string, typeof taskCaps>();
  for (const tc of taskCaps) {
    if (!capabilitiesByTask.has(tc.taskId)) {
      capabilitiesByTask.set(tc.taskId, []);
    }
    capabilitiesByTask.get(tc.taskId)!.push(tc);
  }

  return tasks.map((t) => ({
    ...t,
    capabilities: capabilitiesByTask.get(t.id) || [],
  }));
}

// Get job capabilities
export async function getJobCapabilities(jobId: string) {
  const jobCaps = await db
    .select({
      capabilityId: jobCapability.capabilityId,
      importance: jobCapability.importance,
      taskCount: jobCapability.taskCount,
      percentageOfJob: jobCapability.percentageOfJob,
      blockingAutomation: jobCapability.blockingAutomation,
      notes: jobCapability.notes,
      capability: capability,
    })
    .from(jobCapability)
    .innerJoin(capability, eq(jobCapability.capabilityId, capability.id))
    .where(eq(jobCapability.jobId, jobId))
    .orderBy(
      desc(jobCapability.blockingAutomation),
      desc(jobCapability.percentageOfJob),
    );

  return jobCaps.map((jc) => ({
    ...jc.capability,
    importance: jc.importance,
    taskCount: jc.taskCount,
    percentageOfJob: jc.percentageOfJob,
    blockingAutomation: jc.blockingAutomation,
    notes: jc.notes,
  }));
}

// Search jobs for autocomplete
export async function searchJobs(query: string, limit = 10) {
  if (!query || query.length < 2) {
    return [];
  }

  const results = await db
    .select({
      id: job.id,
      slug: job.slug,
      title: job.title,
      industry: job.industry,
      automationPercentage: job.automationPercentage,
      automationStatus: job.automationStatus,
      totalWorkersGlobal: job.totalWorkersGlobal,
    })
    .from(job)
    .where(
      or(
        ilike(job.title, `%${query}%`),
        ilike(job.shortDescription, `%${query}%`),
        ilike(job.industry, `%${query}%`),
      ),
    )
    .orderBy(asc(job.title))
    .limit(limit);

  return results;
}
