"use server";

import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { cacheLife } from "next/cache";
import { db } from "@/db";
import { capability } from "@/db/schema/capabilities";
import {
  type JobCategory,
  job,
  jobCapability,
  type RiskLevel,
  task,
  taskCapability,
} from "@/db/schema/jobs";

// Types
export type JobFilters = {
  category?: JobCategory;
  riskLevel?: RiskLevel;
  riskMin?: number;
  riskMax?: number;
  search?: string;
};

export type JobSort = "risk_desc" | "risk_asc" | "name_asc" | "updated_desc";

// Type for job comparison data (matches JobComparisonTable props)
export type JobComparisonData = {
  id: string;
  slug: string;
  name: string;
  category: JobCategory;
  description: string;
  automationRiskPercentage: number;
  riskLevel: RiskLevel;
  timelineEstimate: string | null;
  confidence: string;
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
        name: job.name,
        category: job.category,
        description: job.description,
        automationRiskPercentage: job.automationRiskPercentage,
        riskLevel: job.riskLevel,
        timelineEstimate: job.timelineEstimate,
        confidence: job.confidence,
      })
      .from(job)
      .where(inArray(job.slug, jobSlugs));

    // Return jobs in the order of the slugs provided
    return jobSlugs
      .map((slug) => jobs.find((j) => j.slug === slug))
      .filter((j): j is NonNullable<typeof j> => j !== undefined)
      .map(
        (j): JobComparisonData => ({
          id: j.id,
          slug: j.slug,
          name: j.name,
          category: j.category,
          description: j.description,
          automationRiskPercentage: j.automationRiskPercentage,
          riskLevel: j.riskLevel,
          timelineEstimate: j.timelineEstimate,
          confidence: j.confidence,
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
  const [tasks, jobCaps] = await Promise.all([
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
      percentageOfJob: jc.percentageOfJob,
      blockingAutomation: jc.blockingAutomation,
      notes: jc.notes,
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

  if (filters.category) {
    conditions.push(eq(job.category, filters.category));
  }

  if (filters.riskLevel) {
    conditions.push(eq(job.riskLevel, filters.riskLevel));
  }

  if (filters.riskMin !== undefined) {
    conditions.push(sql`${job.automationRiskPercentage} >= ${filters.riskMin}`);
  }

  if (filters.riskMax !== undefined) {
    conditions.push(sql`${job.automationRiskPercentage} <= ${filters.riskMax}`);
  }

  if (filters.search) {
    conditions.push(
      or(
        ilike(job.name, `%${filters.search}%`),
        ilike(job.description, `%${filters.search}%`),
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
        return desc(job.automationRiskPercentage);
      case "risk_asc":
        return asc(job.automationRiskPercentage);
      case "name_asc":
        return asc(job.name);
      case "updated_desc":
        return desc(job.updatedAt);
      default:
        return desc(job.automationRiskPercentage);
    }
  };

  // Apply pagination and execute
  const results = await queryWithWhere
    .orderBy(getSortOrder())
    .limit(limit)
    .offset(offset);

  return results;
}

// Get job categories (static enum values)
export async function getJobCategories() {
  "use cache";
  cacheLife({ stale: 600, revalidate: 3600 * 5 });

  // Return static category enum values
  const categories: Array<{ id: JobCategory; name: string; slug: string }> = [
    { id: "healthcare", name: "Healthcare", slug: "healthcare" },
    { id: "technology", name: "Technology", slug: "technology" },
    { id: "trades", name: "Trades", slug: "trades" },
    { id: "service", name: "Service", slug: "service" },
    { id: "creative", name: "Creative", slug: "creative" },
    { id: "finance", name: "Finance", slug: "finance" },
    { id: "education", name: "Education", slug: "education" },
    { id: "legal", name: "Legal", slug: "legal" },
    { id: "manufacturing", name: "Manufacturing", slug: "manufacturing" },
    { id: "other", name: "Other", slug: "other" },
  ];

  return categories;
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
      name: job.name,
      category: job.category,
      automationRiskPercentage: job.automationRiskPercentage,
      riskLevel: job.riskLevel,
    })
    .from(job)
    .where(
      or(
        ilike(job.name, `%${query}%`),
        ilike(job.description, `%${query}%`),
        ilike(job.category, `%${query}%`),
      ),
    )
    .orderBy(asc(job.name))
    .limit(limit);

  return results.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    category: r.category,
    automationRiskPercentage: r.automationRiskPercentage,
    riskLevel: r.riskLevel,
  }));
}

// Search jobs by title (for backwards compatibility with report forms)
export async function searchJobsByTitle(query: string, limit = 10) {
  if (!query || query.length < 2) {
    return { success: true, jobs: [] };
  }

  try {
    const jobs = await db
      .select({
        id: job.id,
        name: job.name,
        category: job.category,
      })
      .from(job)
      .where(ilike(job.name, `%${query}%`))
      .limit(limit)
      .orderBy(asc(job.name));

    // Map to expected format for backwards compatibility
    return {
      success: true,
      jobs: jobs.map((j) => ({
        id: j.id,
        title: j.name,
        industry: j.category,
      })),
    };
  } catch (error) {
    console.error("Error searching jobs:", error);
    return { success: false, jobs: [], error: "Failed to search jobs" };
  }
}
