import { and, asc, count, desc, eq, ilike, or } from 'drizzle-orm'
import { nanoid } from 'nanoid'

import { dbClient } from '@/db'
import { capability, capabilitySubtype } from '@/db/schema/capabilities'
import { job, task, taskCapabilitySubtype } from '@/db/schema/jobs'
import {
  technology,
  technologyCapabilitySubtype,
} from '@/db/schema/technologies'

// ============================================
// JOB QUERIES
// ============================================

export interface JobsQueryOptions {
  page?: number
  limit?: number
  category?: string
  riskLevel?: string
  search?: string
  sortBy?: 'name' | 'risk' | 'recent'
}

export async function getJobsPaginated(options: JobsQueryOptions = {}) {
  const {
    page = 1,
    limit = 12,
    category,
    riskLevel,
    search,
    sortBy = 'name',
  } = options

  const offset = (page - 1) * limit

  try {
    const db = await dbClient()
    // Build conditions
    const conditions = []

    if (category) {
      conditions.push(eq(job.category, category as any))
    }

    if (riskLevel) {
      conditions.push(eq(job.riskLevel, riskLevel as any))
    }

    if (search) {
      const searchTerm = `%${search}%`
      conditions.push(
        or(ilike(job.name, searchTerm), ilike(job.description, searchTerm)),
      )
    }

    // Determine order
    const orderBy =
      sortBy === 'risk'
        ? desc(job.automationRiskPercentage)
        : sortBy === 'recent'
          ? desc(job.createdAt)
          : asc(job.name)

    // Fetch jobs with pagination
    const jobs = await db
      .select({
        id: job.id,
        slug: job.slug,
        name: job.name,
        category: job.category,
        description: job.description,
        icon: job.icon,
        automationRiskPercentage: job.automationRiskPercentage,
        riskLevel: job.riskLevel,
        timelineEstimate: job.timelineEstimate,
        confidence: job.confidence,
        createdAt: job.createdAt,
      })
      .from(job)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset)

    // Get total count
    const result = await db
      .select({ count: count() })
      .from(job)
      .where(conditions.length > 0 ? and(...conditions) : undefined)

    const total = result[0]?.count ?? 0

    return {
      jobs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return {
      jobs: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    }
  }
}

export async function getAllJobs() {
  try {
    const db = await dbClient()
    const jobs = await db
      .select({
        id: job.id,
        slug: job.slug,
        name: job.name,
        category: job.category,
        description: job.description,
        icon: job.icon,
        automationRiskPercentage: job.automationRiskPercentage,
        riskLevel: job.riskLevel,
        timelineEstimate: job.timelineEstimate,
        confidence: job.confidence,
        createdAt: job.createdAt,
      })
      .from(job)
      .orderBy(asc(job.name))

    // Get task count for each job
    const jobsWithStats = await Promise.all(
      jobs.map(async (j) => {
        const tasks = await getTasksByJobId(j.id)
        return {
          ...j,
          tasksCount: tasks.length,
        }
      }),
    )

    return jobsWithStats
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return []
  }
}

export async function getJobBySlug(slug: string) {
  try {
    const db = await dbClient()
    const result = await db
      .select()
      .from(job)
      .where(eq(job.slug, slug))
      .limit(1)

    return result[0] ?? null
  } catch (error) {
    console.error('Error fetching job by slug:', error)
    return null
  }
}

export async function getJobById(id: string) {
  try {
    const db = await dbClient()
    const result = await db.select().from(job).where(eq(job.id, id)).limit(1)

    return result[0] ?? null
  } catch (error) {
    console.error('Error fetching job by ID:', error)
    return null
  }
}

export async function getJobsByCategory(category: string) {
  try {
    const db = await dbClient()
    const jobs = await db
      .select({
        id: job.id,
        slug: job.slug,
        name: job.name,
        category: job.category,
        description: job.description,
        icon: job.icon,
        automationRiskPercentage: job.automationRiskPercentage,
        riskLevel: job.riskLevel,
        timelineEstimate: job.timelineEstimate,
        confidence: job.confidence,
        createdAt: job.createdAt,
      })
      .from(job)
      .where(eq(job.category, category as any))
      .orderBy(desc(job.automationRiskPercentage))

    return jobs
  } catch (error) {
    console.error('Error fetching jobs by category:', error)
    return []
  }
}

// ============================================
// TASK QUERIES
// ============================================

export async function getTasksByJobId(jobId: string) {
  try {
    const db = await dbClient()
    const tasks = await db
      .select({
        id: task.id,
        jobId: task.jobId,
        name: task.name,
        percentageOfJob: task.percentageOfJob,
        automatable: task.automatable,
        reason: task.reason,
        createdAt: task.createdAt,
      })
      .from(task)
      .where(eq(task.jobId, jobId))
      .orderBy(desc(task.percentageOfJob))

    // Get capability requirements for each task
    const tasksWithCapabilities = await Promise.all(
      tasks.map(async (t) => {
        const capabilityRequirements = await getCapabilityRequirementsByTaskId(
          t.id,
        )
        return {
          ...t,
          capabilityRequirements,
        }
      }),
    )

    return tasksWithCapabilities
  } catch (error) {
    console.error('Error fetching tasks by job ID:', error)
    return []
  }
}

export async function getTaskById(id: string) {
  try {
    const db = await dbClient()
    const result = await db.select().from(task).where(eq(task.id, id)).limit(1)

    return result[0] ?? null
  } catch (error) {
    console.error('Error fetching task by ID:', error)
    return null
  }
}

// ============================================
// CAPABILITY REQUIREMENT QUERIES (for tasks)
// ============================================

export async function getCapabilityRequirementsByTaskId(taskId: string) {
  try {
    const db = await dbClient()
    const requirements = await db
      .select({
        id: taskCapabilitySubtype.id,
        taskId: taskCapabilitySubtype.taskId,
        capabilitySubtypeId: taskCapabilitySubtype.capabilitySubtypeId,
        importance: taskCapabilitySubtype.importance,
        minimumLevelRequired: taskCapabilitySubtype.minimumLevelRequired,
        notes: taskCapabilitySubtype.notes,
        // Capability subtype fields
        capabilitySubtype: {
          id: capabilitySubtype.id,
          slug: capabilitySubtype.slug,
          name: capabilitySubtype.name,
          domain: capabilitySubtype.domain,
          progressPercentage: capabilitySubtype.progressPercentage,
          status: capabilitySubtype.status,
        },
        // Parent capability fields
        capability: {
          id: capability.id,
          slug: capability.slug,
          name: capability.name,
          icon: capability.icon,
        },
      })
      .from(taskCapabilitySubtype)
      .innerJoin(
        capabilitySubtype,
        eq(taskCapabilitySubtype.capabilitySubtypeId, capabilitySubtype.id),
      )
      .innerJoin(capability, eq(capabilitySubtype.capabilityId, capability.id))
      .where(eq(taskCapabilitySubtype.taskId, taskId))
      .orderBy(desc(taskCapabilitySubtype.minimumLevelRequired))

    return requirements
  } catch (error) {
    console.error('Error fetching capability requirements by task ID:', error)
    return []
  }
}

// ============================================
// TECHNOLOGY QUERIES (for jobs)
// ============================================

/**
 * Get technologies mentioned for a job through its tasks' capability requirements
 */
export async function getTechnologiesByJobId(jobId: string) {
  try {
    const db = await dbClient()
    // Get tasks for the job
    const tasks = await db
      .select({ id: task.id })
      .from(task)
      .where(eq(task.jobId, jobId))

    if (tasks.length === 0) return []

    const taskIds = tasks.map((t) => t.id)

    // Get unique capability subtype IDs from task requirements
    const capabilitySubtypeLinks = await db
      .select({
        capabilitySubtypeId: taskCapabilitySubtype.capabilitySubtypeId,
      })
      .from(taskCapabilitySubtype)
      .where(eq(taskCapabilitySubtype.taskId, taskIds[0])) // Will need IN clause for multiple tasks

    // For now, get technologies for the first task's capabilities
    // TODO: Aggregate across all tasks
    const capabilitiesSubtypeIds = capabilitySubtypeLinks.map(
      (l) => l.capabilitySubtypeId,
    )

    if (capabilitiesSubtypeIds.length === 0) return []

    const technologies = await db
      .select({
        id: technology.id,
        slug: technology.slug,
        name: technology.name,
        type: technology.type,
        description: technology.description,
        image: technology.image,
        website: technology.website,
        stage: technology.stage,
        performanceScore: technologyCapabilitySubtype.performanceScore,
      })
      .from(technologyCapabilitySubtype)
      .innerJoin(
        technology,
        eq(technologyCapabilitySubtype.technologyId, technology.id),
      )
      .where(
        eq(
          technologyCapabilitySubtype.capabilitySubtypeId,
          capabilitiesSubtypeIds[0],
        ),
      )
      .orderBy(desc(technologyCapabilitySubtype.performanceScore))

    return technologies
  } catch (error) {
    console.error('Error fetching technologies by job ID:', error)
    return []
  }
}

// ============================================
// REPORT QUERIES (for jobs)
// ============================================

/**
 * Get mock report count for a job
 * TODO: Implement when reports schema is ready
 */
export function getReportCountForJob(_jobId: string): number {
  return 0
}

// ============================================
// AGGREGATE QUERIES
// ============================================

export async function getAverageAutomationRisk() {
  try {
    const db = await dbClient()
    const allJobs = await db
      .select({
        automationRiskPercentage: job.automationRiskPercentage,
      })
      .from(job)

    if (allJobs.length === 0) return 0

    const totalRisk = allJobs.reduce(
      (sum, j) => sum + j.automationRiskPercentage,
      0,
    )
    return Math.round(totalRisk / allJobs.length)
  } catch (error) {
    console.error('Error calculating average automation risk:', error)
    return 0
  }
}

// ============================================
// ADMIN JOB OPERATIONS
// ============================================

export interface CreateJobInput {
  name: string
  slug: string
  category: string
  description: string
  icon?: string
}

export async function createJob(input: CreateJobInput) {
  try {
    const id = nanoid()
    const db = await dbClient()
    const [newJob] = await db
      .insert(job)
      .values({
        id,
        slug: input.slug,
        name: input.name,
        category: input.category as any,
        description: input.description,
        icon: input.icon,
        automationRiskPercentage: 0, // Inferred from tasks
        riskLevel: 'low' as any, // Inferred from tasks
        timelineEstimate: undefined, // Inferred from tasks
        confidence: 'medium' as any, // Inferred/default
      })
      .returning()

    return newJob
  } catch (error) {
    console.error('Error creating job:', error)
    throw error
  }
}

export interface UpdateJobInput {
  id: string
  name?: string
  slug?: string
  category?: string
  description?: string
  icon?: string
}

export async function updateJob(input: UpdateJobInput) {
  try {
    const { id, ...updates } = input
    const db = await dbClient()
    const [updatedJob] = await db
      .update(job)
      .set(updates as any)
      .where(eq(job.id, id))
      .returning()

    return updatedJob
  } catch (error) {
    console.error('Error updating job:', error)
    throw error
  }
}

export async function deleteJob(id: string) {
  try {
    const db = await dbClient()
    await db.delete(job).where(eq(job.id, id))
    return { success: true }
  } catch (error) {
    console.error('Error deleting job:', error)
    throw error
  }
}

// ============================================
// ADMIN TASK OPERATIONS
// ============================================

export interface CreateTaskInput {
  jobId: string
  name: string
  percentageOfJob: number
  automatable: string
  reason?: string
}

export async function createTask(input: CreateTaskInput) {
  try {
    const id = nanoid()
    const db = await dbClient()
    const [newTask] = await db
      .insert(task)
      .values({
        id,
        jobId: input.jobId,
        name: input.name,
        percentageOfJob: input.percentageOfJob,
        automatable: input.automatable as any,
        reason: input.reason,
      })
      .returning()

    return newTask
  } catch (error) {
    console.error('Error creating task:', error)
    throw error
  }
}

export interface UpdateTaskInput {
  id: string
  name?: string
  percentageOfJob?: number
  automatable?: string
  reason?: string
}

export async function updateTask(input: UpdateTaskInput) {
  try {
    const { id, ...updates } = input
    const db = await dbClient()
    const [updatedTask] = await db
      .update(task)
      .set(updates as any)
      .where(eq(task.id, id))
      .returning()

    return updatedTask
  } catch (error) {
    console.error('Error updating task:', error)
    throw error
  }
}

export async function deleteTask(id: string) {
  try {
    const db = await dbClient()
    await db.delete(task).where(eq(task.id, id))
    return { success: true }
  } catch (error) {
    console.error('Error deleting task:', error)
    throw error
  }
}

// ============================================
// ADMIN TASK_CAPABILITY_SUBTYPE OPERATIONS
// ============================================

export interface CreateTaskCapabilitySubtypeInput {
  taskId: string
  capabilitySubtypeId: string
  importance: string
  minimumLevelRequired: number
  notes?: string
}

export async function createTaskCapabilitySubtype(
  input: CreateTaskCapabilitySubtypeInput,
) {
  try {
    const id = nanoid()
    const db = await dbClient()
    const [newLink] = await db
      .insert(taskCapabilitySubtype)
      .values({
        id,
        taskId: input.taskId,
        capabilitySubtypeId: input.capabilitySubtypeId,
        importance: input.importance as any,
        minimumLevelRequired: input.minimumLevelRequired,
        notes: input.notes,
      })
      .returning()

    return newLink
  } catch (error) {
    console.error('Error creating task capability subtype link:', error)
    throw error
  }
}

export interface UpdateTaskCapabilitySubtypeInput {
  id: string
  importance?: string
  minimumLevelRequired?: number
  notes?: string
}

export async function updateTaskCapabilitySubtype(
  input: UpdateTaskCapabilitySubtypeInput,
) {
  try {
    const { id, ...updates } = input
    const db = await dbClient()
    const [updatedLink] = await db
      .update(taskCapabilitySubtype)
      .set(updates as any)
      .where(eq(taskCapabilitySubtype.id, id))
      .returning()

    return updatedLink
  } catch (error) {
    console.error('Error updating task capability subtype link:', error)
    throw error
  }
}

export async function deleteTaskCapabilitySubtype(id: string) {
  try {
    const db = await dbClient()
    await db
      .delete(taskCapabilitySubtype)
      .where(eq(taskCapabilitySubtype.id, id))
    return { success: true }
  } catch (error) {
    console.error('Error deleting task capability subtype link:', error)
    throw error
  }
}
