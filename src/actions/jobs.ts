"use server";

import { generateRandomString } from "better-auth/crypto";
import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { user, userBadge, userProfile, userReputation } from "@/db/schema";
import { capability } from "@/db/schema/capabilities";
import { industry } from "@/db/schema/industries";
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

// Types
export type JobFilters = {
  industryId?: string;
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
      .innerJoin(industry, eq(job.industryId, industry.id))
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

  const result = await db
    .select({
      job,
      industry,
    })
    .from(job)
    .innerJoin(industry, eq(job.industryId, industry.id))
    .where(eq(job.slug, slug))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  const jobData = { ...result[0].job, industry: result[0].industry };

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

  if (filters.industryId) {
    conditions.push(eq(job.industryId, filters.industryId));
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
        ilike(industry.name, `%${filters.search}%`),
        ilike(job.category, `%${filters.search}%`),
      ),
    );
  }

  // Build query with where clause and join industry
  const baseQuery = db
    .select({
      job,
      industry,
    })
    .from(job)
    .innerJoin(industry, eq(job.industryId, industry.id));
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

  // Map results to include industry relationship
  return results.map((r) => ({
    ...r.job,
    industry: r.industry,
  }));
}

// Get job categories/industries
export async function getJobCategories() {
  "use cache";
  cacheLife({ stale: 600, revalidate: 3600 * 5 });
  const results = await db
    .selectDistinct({
      id: industry.id,
      name: industry.name,
      slug: industry.slug,
      icon: industry.icon,
    })
    .from(industry)
    .innerJoin(job, eq(job.industryId, industry.id))
    .orderBy(asc(industry.name));

  return results;
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
  // Fetch all comments for the job to build tree structure with user info
  const rows = await db
    .select({
      comment: jobComment,
      author: {
        id: user.id,
        name: user.name,
        username: user.username,
        displayUsername: user.displayUsername,
        image: user.image,
      },
      profile: {
        displayName: userProfile.displayName,
        industry: userProfile.industry,
        location: userProfile.location,
        country: userProfile.country,
        stateProvince: userProfile.stateProvince,
        city: userProfile.city,
      },
      reputation: {
        reputationPoints: userReputation.reputationPoints,
        tier: userReputation.tier,
      },
      badges: sql<Array<typeof userBadge.$inferSelect>>`
        COALESCE(
          (SELECT json_agg(b.* ORDER BY b.earned_at DESC)
           FROM ${userBadge} b
           WHERE b.user_id = ${jobComment.userId}),
          '[]'::json
        )
      `.as("badges"),
    })
    .from(jobComment)
    .leftJoin(user, eq(jobComment.userId, user.id))
    .leftJoin(userProfile, eq(userProfile.userId, user.id))
    .leftJoin(userReputation, eq(userReputation.userId, user.id))
    .where(eq(jobComment.jobId, jobId))
    .orderBy(desc(jobComment.upvotes), desc(jobComment.createdAt));

  type CommentWithMeta = (typeof rows)[number]["comment"] & {
    author: (typeof rows)[number]["author"] | null;
    profile: (typeof rows)[number]["profile"] | null;
    reputation: (typeof rows)[number]["reputation"] | null;
    badges: (typeof rows)[number]["badges"];
    replies: CommentWithMeta[];
  };

  const items: CommentWithMeta[] = rows.map((row) => ({
    ...row.comment,
    author: row.author || null,
    profile: row.profile || null,
    reputation: row.reputation || null,
    badges: row.badges || [],
    replies: [],
  }));

  // Build reply tree structure
  const commentMap = new Map<string, CommentWithMeta>();
  const rootComments: CommentWithMeta[] = [];

  for (const item of items) {
    commentMap.set(item.id, item);
  }

  for (const item of items) {
    if (item.parentId) {
      const parent = commentMap.get(item.parentId);
      if (parent) {
        parent.replies.push(item);
      }
    } else {
      rootComments.push(item);
    }
  }

  // If parentId is provided, return only that comment's replies
  if (parentId) {
    const parentComment = commentMap.get(parentId);
    return parentComment ? parentComment.replies : [];
  }

  return rootComments;
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
  // Optimized: Single query with JSON aggregation for task capabilities
  const tasks = await db
    .select({
      task,
      capabilities: sql<
        Array<{
          taskId: string;
          capabilityId: string;
          importance: string;
          notes: string | null;
          capability: typeof capability.$inferSelect;
        }>
      >`
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'taskId', tc.task_id,
              'capabilityId', tc.capability_id,
              'importance', tc.importance,
              'notes', tc.notes,
              'capability', row_to_json(c.*)
            )
           )
           FROM ${taskCapability} tc
           INNER JOIN ${capability} c ON tc.capability_id = c.id
           WHERE tc.task_id = ${task.id}),
          '[]'::json
        )
      `.as("capabilities"),
    })
    .from(task)
    .where(eq(task.jobId, jobId))
    .orderBy(asc(task.percentageOfJob));

  return tasks.map((item) => ({
    ...item.task,
    capabilities: item.capabilities || [],
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
      industry: industry,
      automationPercentage: job.automationPercentage,
      automationStatus: job.automationStatus,
      totalWorkersGlobal: job.totalWorkersGlobal,
    })
    .from(job)
    .innerJoin(industry, eq(job.industryId, industry.id))
    .where(
      or(
        ilike(job.title, `%${query}%`),
        ilike(job.shortDescription, `%${query}%`),
        ilike(industry.name, `%${query}%`),
      ),
    )
    .orderBy(asc(job.title))
    .limit(limit);

  return results.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    industry: r.industry.name,
    automationPercentage: r.automationPercentage,
    automationStatus: r.automationStatus,
    totalWorkersGlobal: r.totalWorkersGlobal,
  }));
}
