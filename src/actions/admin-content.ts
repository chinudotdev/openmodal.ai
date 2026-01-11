"use server";

import { generateRandomString } from "better-auth/crypto";
import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  or,
  sql,
} from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import {
  bottleneck,
  capability,
  capabilityCategory,
  capabilityOrganization,
  organization,
} from "@/db/schema/capabilities";
import { industry } from "@/db/schema/industries";
import {
  type AutomationStatus,
  job,
  task,
  taskCapability,
} from "@/db/schema/jobs";
import { auth } from "@/lib/auth";

// ============================================
// Helper Functions
// ============================================

async function checkAdminAccess() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }
  return session.user.id;
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function ensureUniqueSlug(
  table: any,
  slug: string,
  excludeId?: string,
): Promise<string> {
  let uniqueSlug = slug;
  let counter = 1;
  while (true) {
    const conditions = [eq(table.slug, uniqueSlug)];
    if (excludeId) {
      conditions.push(sql`${table.id} != ${excludeId}`);
    }
    const existing = await db
      .select()
      .from(table)
      .where(and(...conditions))
      .limit(1);
    if (existing.length === 0) break;
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }
  return uniqueSlug;
}

function calculateAutomationMetrics(
  tasks: Array<{ automationStatus: string; percentageOfJob: number }>,
) {
  const replaceable = tasks
    .filter((t) => t.automationStatus === "replaceable")
    .reduce((sum, t) => sum + t.percentageOfJob, 0);
  const partial = tasks
    .filter((t) => t.automationStatus === "partial")
    .reduce((sum, t) => sum + t.percentageOfJob, 0);
  const safe = tasks
    .filter((t) => t.automationStatus === "safe")
    .reduce((sum, t) => sum + t.percentageOfJob, 0);

  const automationPercentage = Math.round(replaceable + partial * 0.5);

  let automationStatus: AutomationStatus = "safe";
  if (automationPercentage >= 76) {
    automationStatus = "high_risk";
  } else if (automationPercentage >= 26) {
    automationStatus = "partial";
  } else if (automationPercentage === 100) {
    automationStatus = "automated";
  }

  return {
    automationPercentage,
    automationStatus,
    totalTasks: tasks.length,
    tasksReplaceable: tasks.filter((t) => t.automationStatus === "replaceable")
      .length,
    tasksPartial: tasks.filter((t) => t.automationStatus === "partial").length,
    tasksSafe: tasks.filter((t) => t.automationStatus === "safe").length,
  };
}

// ============================================
// JOBS
// ============================================

export interface JobFilters {
  industryId?: string;
  status?: AutomationStatus;
  search?: string;
  published?: boolean;
}

export interface JobListResult {
  jobs: Array<{
    id: string;
    slug: string;
    title: string;
    industry: { id: string; name: string; icon?: string | null };
    category: string;
    automationPercentage: number;
    automationStatus: AutomationStatus;
    totalTasks: number;
    trackingCount: number;
    reportCount: number;
    verified: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>;
  total: number;
}

export async function getAdminJobs(
  filters: JobFilters = {},
  limit = 50,
  offset = 0,
): Promise<JobListResult> {
  await checkAdminAccess();

  const conditions = [];

  if (filters.industryId) {
    conditions.push(eq(job.industryId, filters.industryId));
  }

  if (filters.status) {
    conditions.push(eq(job.automationStatus, filters.status));
  }

  if (filters.search) {
    conditions.push(
      or(
        ilike(job.title, `%${filters.search}%`),
        ilike(job.shortDescription, `%${filters.search}%`),
        ilike(industry.name, `%${filters.search}%`),
      ),
    );
  }

  // Optimized: Get total count using window function in single query
  const baseQuery = db
    .select({
      job,
      industry,
      total: sql<number>`COUNT(*) OVER()`.as("total"),
    })
    .from(job)
    .innerJoin(industry, eq(job.industryId, industry.id));

  const queryWithWhere =
    conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;

  const results = await queryWithWhere
    .orderBy(desc(job.updatedAt))
    .limit(limit)
    .offset(offset);

  const total = results.length > 0 ? Number(results[0]?.total || 0) : 0;

  return {
    jobs: results.map((r) => ({
      id: r.job.id,
      slug: r.job.slug,
      title: r.job.title,
      industry: {
        id: r.industry.id,
        name: r.industry.name,
        icon: r.industry.icon,
      },
      category: r.job.category,
      automationPercentage: r.job.automationPercentage,
      automationStatus: r.job.automationStatus,
      totalTasks: r.job.totalTasks,
      trackingCount: r.job.trackingCount,
      reportCount: r.job.reportCount,
      verified: r.job.verified,
      createdAt: r.job.createdAt,
      updatedAt: r.job.updatedAt,
    })),
    total,
  };
}

export async function getAdminJobById(jobId: string) {
  await checkAdminAccess();

  // Optimized: Single query with JSON aggregation for tasks
  const result = await db
    .select({
      job,
      industry,
      tasks: sql<Array<typeof task.$inferSelect>>`
        COALESCE(
          (SELECT json_agg(t.* ORDER BY t.percentage_of_job)
           FROM ${task} t
           WHERE t.job_id = ${job.id}),
          '[]'::json
        )
      `.as("tasks"),
    })
    .from(job)
    .innerJoin(industry, eq(job.industryId, industry.id))
    .where(eq(job.id, jobId))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  return {
    ...result[0].job,
    industry: result[0].industry,
    tasks: result[0].tasks || [],
  };
}

export interface CreateJobInput {
  title: string;
  slug?: string;
  industryId: string;
  category: string;
  description: string;
  shortDescription: string;
  metaDescription?: string;
  metaKeywords?: string[];
}

export async function createJob(input: CreateJobInput) {
  await checkAdminAccess();

  const jobId = generateRandomString(32);
  const slug =
    input.slug || (await ensureUniqueSlug(job, generateSlug(input.title)));

  await db.insert(job).values({
    id: jobId,
    slug,
    title: input.title,
    industryId: input.industryId,
    category: input.category,
    description: input.description,
    shortDescription: input.shortDescription,
    metaDescription: input.metaDescription,
    metaKeywords: input.metaKeywords || [],
    keyResponsibilities: [],
    automationPercentage: 0,
    automationStatus: "safe",
    totalTasks: 0,
    tasksReplaceable: 0,
    tasksPartial: 0,
    tasksSafe: 0,
    confidenceLevel: "medium",
    verified: false,
    dataQuality: 0,
  });

  return { success: true, jobId, slug };
}

export interface UpdateJobInput {
  title?: string;
  slug?: string;
  industryId?: string;
  category?: string;
  description?: string;
  shortDescription?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  verified?: boolean;
}

export async function updateJob(jobId: string, input: UpdateJobInput) {
  await checkAdminAccess();

  const updateData: any = {};
  if (input.title !== undefined) updateData.title = input.title;
  if (input.slug !== undefined) {
    updateData.slug = await ensureUniqueSlug(job, input.slug, jobId);
  }
  if (input.industryId !== undefined) updateData.industryId = input.industryId;
  if (input.category !== undefined) updateData.category = input.category;
  if (input.description !== undefined)
    updateData.description = input.description;
  if (input.shortDescription !== undefined)
    updateData.shortDescription = input.shortDescription;
  if (input.metaDescription !== undefined)
    updateData.metaDescription = input.metaDescription;
  if (input.metaKeywords !== undefined)
    updateData.metaKeywords = input.metaKeywords;
  if (input.verified !== undefined) updateData.verified = input.verified;

  await db.update(job).set(updateData).where(eq(job.id, jobId));

  return { success: true };
}

export interface TaskInput {
  description: string;
  category?: string;
  automationStatus: "safe" | "partial" | "replaceable";
  difficultyToAutomate: "trivial" | "easy" | "moderate" | "hard" | "very_hard";
  percentageOfJob: number;
  timeSpentHoursPerWeek?: number;
  reasoningNotes?: string;
  evidenceLinks?: string[];
  existingAiSolutions?: string[];
  capabilityIds?: string[];
}

export async function updateJobTasks(jobId: string, tasks: TaskInput[]) {
  await checkAdminAccess();

  // Validate tasks sum to 100%
  const totalPercentage = tasks.reduce((sum, t) => sum + t.percentageOfJob, 0);
  if (Math.abs(totalPercentage - 100) > 0.01) {
    return {
      success: false,
      error: `Tasks must sum to 100%. Current sum: ${totalPercentage}%`,
    };
  }

  // Delete existing tasks
  await db.delete(task).where(eq(task.jobId, jobId));

  // Insert new tasks
  const taskIds: string[] = [];
  for (const taskInput of tasks) {
    const taskId = generateRandomString(32);
    taskIds.push(taskId);

    await db.insert(task).values({
      id: taskId,
      jobId,
      description: taskInput.description,
      category: taskInput.category || null,
      automationStatus: taskInput.automationStatus,
      difficultyToAutomate: taskInput.difficultyToAutomate,
      percentageOfJob: taskInput.percentageOfJob,
      timeSpentHoursPerWeek: taskInput.timeSpentHoursPerWeek
        ? String(taskInput.timeSpentHoursPerWeek)
        : null,
      reasoningNotes: taskInput.reasoningNotes || null,
      evidenceLinks: taskInput.evidenceLinks || [],
      existingAiSolutions: taskInput.existingAiSolutions || [],
    });

    // Link capabilities
    if (taskInput.capabilityIds && taskInput.capabilityIds.length > 0) {
      for (const capabilityId of taskInput.capabilityIds) {
        await db.insert(taskCapability).values({
          id: generateRandomString(32),
          taskId,
          capabilityId,
          importance: "important", // Default, can be updated later
        });
      }
    }
  }

  // Recalculate automation metrics
  const metrics = calculateAutomationMetrics(tasks);
  await db.update(job).set(metrics).where(eq(job.id, jobId));

  // Recalculate job capabilities (simplified - would need full logic)
  // For now, just update the counts

  return { success: true };
}

export async function deleteJob(jobId: string) {
  await checkAdminAccess();

  await db.delete(job).where(eq(job.id, jobId));

  return { success: true };
}

// ============================================
// INDUSTRIES
// ============================================

export interface IndustryFilters {
  search?: string;
  status?: "active" | "hidden";
}

export interface IndustryListResult {
  industries: Array<{
    id: string;
    slug: string;
    name: string;
    icon?: string | null;
    shortDescription?: string | null;
    displayOrder: number;
    status: "active" | "hidden";
    jobCount: number;
    createdAt: Date;
    updatedAt: Date;
  }>;
  total: number;
}

export async function getAdminIndustries(
  filters: IndustryFilters = {},
  limit = 50,
  offset = 0,
): Promise<IndustryListResult> {
  await checkAdminAccess();

  const conditions = [];

  if (filters.search) {
    conditions.push(
      or(
        ilike(industry.name, `%${filters.search}%`),
        ilike(industry.shortDescription, `%${filters.search}%`),
      ),
    );
  }

  if (filters.status) {
    conditions.push(eq(industry.status, filters.status));
  }

  const baseQuery = db.select().from(industry);
  const queryWithWhere =
    conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;

  // Optimized: Single query with LEFT JOIN and GROUP BY for job counts
  const results = await db
    .select({
      industry,
      jobCount: sql<number>`COUNT(${job.id})::int`.as("job_count"),
      total: sql<number>`COUNT(*) OVER()`.as("total"),
    })
    .from(industry)
    .leftJoin(job, eq(job.industryId, industry.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(industry.id)
    .orderBy(asc(industry.displayOrder), asc(industry.name))
    .limit(limit)
    .offset(offset);

  const total = results.length > 0 ? Number(results[0]?.total || 0) : 0;

  return {
    industries: results.map((r) => ({
      ...r.industry,
      jobCount: Number(r.jobCount || 0),
    })),
    total,
  };
}

export async function getAdminIndustryById(industryId: string) {
  await checkAdminAccess();

  const result = await db
    .select()
    .from(industry)
    .where(eq(industry.id, industryId))
    .limit(1);

  return result[0] || null;
}

export interface CreateIndustryInput {
  name: string;
  slug?: string;
  icon?: string;
  shortDescription?: string;
  longDescription?: string;
  parentIndustryId?: string;
  displayOrder?: number;
  status?: "active" | "hidden";
}

export async function createIndustry(input: CreateIndustryInput) {
  await checkAdminAccess();

  const industryId = generateRandomString(32);
  const slug =
    input.slug || (await ensureUniqueSlug(industry, generateSlug(input.name)));

  await db.insert(industry).values({
    id: industryId,
    slug,
    name: input.name,
    icon: input.icon || null,
    shortDescription: input.shortDescription || null,
    longDescription: input.longDescription || null,
    parentIndustryId: input.parentIndustryId || null,
    displayOrder: input.displayOrder ?? 0,
    status: input.status || "active",
  });

  return { success: true, industryId, slug };
}

export interface UpdateIndustryInput {
  name?: string;
  slug?: string;
  icon?: string;
  shortDescription?: string;
  longDescription?: string;
  parentIndustryId?: string;
  displayOrder?: number;
  status?: "active" | "hidden";
}

export async function updateIndustry(
  industryId: string,
  input: UpdateIndustryInput,
) {
  await checkAdminAccess();

  const updateData: any = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.slug !== undefined) {
    updateData.slug = await ensureUniqueSlug(industry, input.slug, industryId);
  }
  if (input.icon !== undefined) updateData.icon = input.icon;
  if (input.shortDescription !== undefined)
    updateData.shortDescription = input.shortDescription;
  if (input.longDescription !== undefined)
    updateData.longDescription = input.longDescription;
  if (input.parentIndustryId !== undefined)
    updateData.parentIndustryId = input.parentIndustryId;
  if (input.displayOrder !== undefined)
    updateData.displayOrder = input.displayOrder;
  if (input.status !== undefined) updateData.status = input.status;

  await db.update(industry).set(updateData).where(eq(industry.id, industryId));

  return { success: true };
}

export async function deleteIndustry(industryId: string) {
  await checkAdminAccess();

  // Check if any jobs reference this industry
  const jobsUsingIndustry = await db
    .select({ count: count() })
    .from(job)
    .where(eq(job.industryId, industryId));

  if (jobsUsingIndustry[0]?.count && jobsUsingIndustry[0].count > 0) {
    return {
      success: false,
      error: `Cannot delete industry: ${jobsUsingIndustry[0].count} job(s) are using it`,
    };
  }

  await db.delete(industry).where(eq(industry.id, industryId));

  return { success: true };
}

// ============================================
// CAPABILITIES
// ============================================

export interface CapabilityFilters {
  categoryId?: string;
  status?: "solved" | "partial" | "unsolved";
  search?: string;
}

export interface CapabilityListResult {
  capabilities: Array<{
    id: string;
    slug: string;
    name: string;
    category: { id: string; name: string; icon?: string | null } | null;
    progressPercentage: number;
    status: "solved" | "partial" | "unsolved";
    confidenceLevel: "high" | "medium" | "low";
    jobsProtectedCount: number;
    trackingCount: number;
    createdAt: Date;
    updatedAt: Date;
  }>;
  total: number;
}

export async function getAdminCapabilities(
  filters: CapabilityFilters = {},
  limit = 50,
  offset = 0,
): Promise<CapabilityListResult> {
  await checkAdminAccess();

  const conditions = [];

  if (filters.categoryId) {
    conditions.push(eq(capability.categoryId, filters.categoryId));
  }

  if (filters.status) {
    conditions.push(eq(capability.status, filters.status));
  }

  if (filters.search) {
    conditions.push(
      or(
        ilike(capability.name, `%${filters.search}%`),
        ilike(capability.description, `%${filters.search}%`),
      ),
    );
  }

  const baseQuery = db
    .select({
      capability,
      category: capabilityCategory,
    })
    .from(capability)
    .leftJoin(
      capabilityCategory,
      eq(capability.categoryId, capabilityCategory.id),
    );

  const queryWithWhere =
    conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;

  const results = await queryWithWhere
    .orderBy(desc(capability.updatedAt))
    .limit(limit)
    .offset(offset);

  const totalResult = await db
    .select({ count: count() })
    .from(capability)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return {
    capabilities: results.map((r) => ({
      id: r.capability.id,
      slug: r.capability.slug,
      name: r.capability.name,
      category: r.category
        ? {
            id: r.category.id,
            name: r.category.name,
            icon: r.category.icon,
          }
        : null,
      progressPercentage: r.capability.progressPercentage,
      status: r.capability.status,
      confidenceLevel: r.capability.confidenceLevel,
      jobsProtectedCount: r.capability.jobsProtectedCount,
      trackingCount: r.capability.trackingCount,
      createdAt: r.capability.createdAt,
      updatedAt: r.capability.updatedAt,
    })),
    total: totalResult[0]?.count ?? 0,
  };
}

export async function getAdminCapabilityById(capabilityId: string) {
  await checkAdminAccess();

  // Optimized: Single query with JSON aggregation for bottlenecks and organizations
  const result = await db
    .select({
      capability,
      category: capabilityCategory,
      bottlenecks: sql<Array<typeof bottleneck.$inferSelect>>`
        COALESCE(
          (SELECT json_agg(b.* ORDER BY b.severity DESC)
           FROM ${bottleneck} b
           WHERE b.capability_id = ${capability.id}),
          '[]'::json
        )
      `.as("bottlenecks"),
      organizations: sql<
        Array<{
          organization: typeof organization.$inferSelect;
          focusArea: string | null;
        }>
      >`
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'organization', row_to_json(o.*),
              'focusArea', co.focus_area
            )
           )
           FROM ${capabilityOrganization} co
           INNER JOIN ${organization} o ON co.organization_id = o.id
           WHERE co.capability_id = ${capability.id}),
          '[]'::json
        )
      `.as("organizations"),
    })
    .from(capability)
    .leftJoin(
      capabilityCategory,
      eq(capability.categoryId, capabilityCategory.id),
    )
    .where(eq(capability.id, capabilityId))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  const data = result[0];

  return {
    ...data.capability,
    category: data.category || undefined,
    bottlenecks: data.bottlenecks || [],
    organizations: (data.organizations || []).map((org) => ({
      ...org.organization,
      focusArea: org.focusArea,
    })),
  };
}

export interface CreateCapabilityInput {
  name: string;
  slug?: string;
  categoryId: string;
  description: string;
  technicalDescription: string;
  whyItMatters: string;
  alternativeNames?: string[];
}

export async function createCapability(input: CreateCapabilityInput) {
  await checkAdminAccess();

  const capabilityId = generateRandomString(32);
  const slug =
    input.slug ||
    (await ensureUniqueSlug(capability, generateSlug(input.name)));

  await db.insert(capability).values({
    id: capabilityId,
    slug,
    name: input.name,
    categoryId: input.categoryId,
    description: input.description,
    technicalDescription: input.technicalDescription,
    whyItMatters: input.whyItMatters,
    progressPercentage: 0,
    status: "unsolved",
    confidenceLevel: "medium",
    whatWorks: [],
    whatStruggles: [],
    whatDoesntWork: [],
    jobsProtectedExamples: [],
  });

  return { success: true, capabilityId, slug };
}

export interface UpdateCapabilityInput {
  name?: string;
  slug?: string;
  categoryId?: string;
  description?: string;
  technicalDescription?: string;
  whyItMatters?: string;
  alternativeNames?: string[];
  progressPercentage?: number;
  status?: "solved" | "partial" | "unsolved";
  confidenceLevel?: "high" | "medium" | "low";
  whatWorks?: string[];
  whatStruggles?: string[];
  whatDoesntWork?: string[];
  timelineEstimate?: string;
  expertConsensus?: string;
  reasoning?: string;
  recentBreakthroughDate?: Date;
  recentBreakthroughName?: string;
  jobsProtectedExamples?: string[];
}

export async function updateCapability(
  capabilityId: string,
  input: UpdateCapabilityInput,
) {
  await checkAdminAccess();

  const updateData: any = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.slug !== undefined) {
    updateData.slug = await ensureUniqueSlug(
      capability,
      input.slug,
      capabilityId,
    );
  }
  if (input.categoryId !== undefined) updateData.categoryId = input.categoryId;
  if (input.description !== undefined)
    updateData.description = input.description;
  if (input.technicalDescription !== undefined)
    updateData.technicalDescription = input.technicalDescription;
  if (input.whyItMatters !== undefined)
    updateData.whyItMatters = input.whyItMatters;
  if (input.progressPercentage !== undefined)
    updateData.progressPercentage = input.progressPercentage;
  if (input.status !== undefined) updateData.status = input.status;
  if (input.confidenceLevel !== undefined)
    updateData.confidenceLevel = input.confidenceLevel;
  if (input.whatWorks !== undefined) updateData.whatWorks = input.whatWorks;
  if (input.whatStruggles !== undefined)
    updateData.whatStruggles = input.whatStruggles;
  if (input.whatDoesntWork !== undefined)
    updateData.whatDoesntWork = input.whatDoesntWork;
  if (input.timelineEstimate !== undefined)
    updateData.timelineEstimate = input.timelineEstimate;
  if (input.expertConsensus !== undefined)
    updateData.expertConsensus = input.expertConsensus;
  if (input.reasoning !== undefined) updateData.reasoning = input.reasoning;
  if (input.recentBreakthroughDate !== undefined)
    updateData.recentBreakthroughDate = input.recentBreakthroughDate;
  if (input.jobsProtectedExamples !== undefined)
    updateData.jobsProtectedExamples = input.jobsProtectedExamples;

  await db
    .update(capability)
    .set(updateData)
    .where(eq(capability.id, capabilityId));

  return { success: true };
}

export interface BottleneckInput {
  title: string;
  types: string[];
  description: string;
  severity: "critical" | "major" | "minor";
}

export async function updateCapabilityBottlenecks(
  capabilityId: string,
  bottlenecks: BottleneckInput[],
) {
  await checkAdminAccess();

  // Delete existing bottlenecks
  await db.delete(bottleneck).where(eq(bottleneck.capabilityId, capabilityId));

  // Insert new bottlenecks
  for (const bottleneckInput of bottlenecks) {
    await db.insert(bottleneck).values({
      id: generateRandomString(32),
      capabilityId,
      title: bottleneckInput.title,
      types: bottleneckInput.types,
      description: bottleneckInput.description,
      severity: bottleneckInput.severity,
    });
  }

  return { success: true };
}

export async function updateCapabilityOrganizations(
  capabilityId: string,
  organizationIds: string[],
) {
  await checkAdminAccess();

  // Delete existing links
  await db
    .delete(capabilityOrganization)
    .where(eq(capabilityOrganization.capabilityId, capabilityId));

  // Insert new links
  for (const orgId of organizationIds) {
    await db.insert(capabilityOrganization).values({
      id: generateRandomString(32),
      capabilityId,
      organizationId: orgId,
    });
  }

  return { success: true };
}

export async function deleteCapability(capabilityId: string) {
  await checkAdminAccess();

  await db.delete(capability).where(eq(capability.id, capabilityId));

  return { success: true };
}

// ============================================
// CATEGORIES
// ============================================

export interface CategoryListResult {
  categories: Array<{
    id: string;
    slug: string;
    name: string;
    icon?: string | null;
    description?: string | null;
    displayOrder: number;
    capabilityCount: number;
    avgProgress: number;
    createdAt: Date;
    updatedAt: Date;
  }>;
  total: number;
}

export async function getAdminCategories(): Promise<CategoryListResult> {
  await checkAdminAccess();

  // Optimized: Single query with LEFT JOIN and GROUP BY for stats
  const categories = await db
    .select({
      category: capabilityCategory,
      capabilityCount: sql<number>`COUNT(${capability.id})::int`.as(
        "capability_count",
      ),
      avgProgress: sql<number>`
        COALESCE(ROUND(AVG(${capability.progressPercentage})), 0)::int
      `.as("avg_progress"),
    })
    .from(capabilityCategory)
    .leftJoin(capability, eq(capability.categoryId, capabilityCategory.id))
    .groupBy(capabilityCategory.id)
    .orderBy(
      asc(capabilityCategory.displayOrder),
      asc(capabilityCategory.name),
    );

  return {
    categories: categories.map((c) => ({
      ...c.category,
      capabilityCount: Number(c.capabilityCount || 0),
      avgProgress: Number(c.avgProgress || 0),
    })),
    total: categories.length,
  };
}

export async function getAdminCategoryById(categoryId: string) {
  await checkAdminAccess();

  const result = await db
    .select()
    .from(capabilityCategory)
    .where(eq(capabilityCategory.id, categoryId))
    .limit(1);

  return result[0] || null;
}

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  icon?: string;
  description?: string;
  displayOrder?: number;
}

export async function createCategory(input: CreateCategoryInput) {
  await checkAdminAccess();

  const categoryId = generateRandomString(32);
  const slug =
    input.slug ||
    (await ensureUniqueSlug(capabilityCategory, generateSlug(input.name)));

  await db.insert(capabilityCategory).values({
    id: categoryId,
    slug,
    name: input.name,
    icon: input.icon || null,
    description: input.description || null,
    displayOrder: input.displayOrder ?? 0,
  });

  return { success: true, categoryId, slug };
}

export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  icon?: string;
  description?: string;
  displayOrder?: number;
}

export async function updateCategory(
  categoryId: string,
  input: UpdateCategoryInput,
) {
  await checkAdminAccess();

  const updateData: any = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.slug !== undefined) {
    updateData.slug = await ensureUniqueSlug(
      capabilityCategory,
      input.slug,
      categoryId,
    );
  }
  if (input.icon !== undefined) updateData.icon = input.icon;
  if (input.description !== undefined)
    updateData.description = input.description;
  if (input.displayOrder !== undefined)
    updateData.displayOrder = input.displayOrder;

  await db
    .update(capabilityCategory)
    .set(updateData)
    .where(eq(capabilityCategory.id, categoryId));

  return { success: true };
}

export async function reorderCategories(
  categoryOrders: Array<{ id: string; displayOrder: number }>,
) {
  await checkAdminAccess();

  for (const { id, displayOrder } of categoryOrders) {
    await db
      .update(capabilityCategory)
      .set({ displayOrder })
      .where(eq(capabilityCategory.id, id));
  }

  return { success: true };
}

export async function deleteCategory(categoryId: string) {
  await checkAdminAccess();

  // Check if any capabilities reference this category
  const capabilitiesUsingCategory = await db
    .select({ count: count() })
    .from(capability)
    .where(eq(capability.categoryId, categoryId));

  if (
    capabilitiesUsingCategory[0]?.count &&
    capabilitiesUsingCategory[0].count > 0
  ) {
    return {
      success: false,
      error: `Cannot delete category: ${capabilitiesUsingCategory[0].count} capability/capabilities are using it`,
    };
  }

  await db
    .delete(capabilityCategory)
    .where(eq(capabilityCategory.id, categoryId));

  return { success: true };
}

// Helper function to get all capabilities for dropdowns
export async function getAllCapabilitiesForSelect() {
  await checkAdminAccess();

  const capabilities = await db
    .select({
      id: capability.id,
      name: capability.name,
      slug: capability.slug,
      categoryId: capability.categoryId,
    })
    .from(capability)
    .orderBy(asc(capability.name));

  return capabilities;
}

// Helper function to get all industries for dropdowns
export async function getAllIndustriesForSelect() {
  await checkAdminAccess();

  const industries = await db
    .select({
      id: industry.id,
      name: industry.name,
      slug: industry.slug,
      icon: industry.icon,
    })
    .from(industry)
    .where(eq(industry.status, "active"))
    .orderBy(asc(industry.displayOrder), asc(industry.name));

  return industries;
}
