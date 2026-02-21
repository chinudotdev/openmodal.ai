import { createServerFn } from '@tanstack/react-start'

import z from 'zod'

import { getAllSubtypes } from '@/data-layer/capabilities'
import {
  createJob,
  createTask,
  createTaskCapabilitySubtype,
  deleteJob,
  deleteTask,
  deleteTaskCapabilitySubtype,
  getAllJobs,
  getJobById,
  getJobBySlug,
  getTasksByJobId,
  updateJob,
  updateTask,
  updateTaskCapabilitySubtype,
} from '@/data-layer/jobs'
import { adminMiddleware } from '@/middleware/server'

// ============================================
// ADMIN JOB ACTIONS
// ============================================

/**
 * Create a new job
 * Admin only - uses adminMiddleware
 */
export const createJobFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      name: z.string().min(1, 'Name is required').max(100),
      slug: z
        .string()
        .min(1, 'Slug is required')
        .max(100)
        .regex(
          /^[a-z0-9-]+$/,
          'Slug must contain only lowercase letters, numbers, and hyphens',
        ),
      category: z.enum([
        'healthcare',
        'technology',
        'trades',
        'service',
        'creative',
        'finance',
        'education',
        'legal',
        'manufacturing',
        'other',
      ]),
      description: z
        .string()
        .min(10, 'Description must be at least 10 characters')
        .max(2000),
      icon: z.string().optional(),
    }),
  )
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    try {
      const job = await createJob(data)
      return { success: true, data: job }
    } catch (error) {
      console.error('Error creating job:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create job',
      }
    }
  })

/**
 * Update an existing job
 * Admin only - uses adminMiddleware
 */
export const updateJobFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      id: z.string().min(1, 'ID is required'),
      name: z.string().min(1).max(100).optional(),
      slug: z
        .string()
        .min(1)
        .max(100)
        .regex(
          /^[a-z0-9-]+$/,
          'Slug must contain only lowercase letters, numbers, and hyphens',
        )
        .optional(),
      category: z
        .enum([
          'healthcare',
          'technology',
          'trades',
          'service',
          'creative',
          'finance',
          'education',
          'legal',
          'manufacturing',
          'other',
        ])
        .optional(),
      description: z.string().min(10).max(2000).optional(),
      icon: z.string().optional(),
    }),
  )
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    try {
      const job = await updateJob(data)
      return { success: true, data: job }
    } catch (error) {
      console.error('Error updating job:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update job',
      }
    }
  })

/**
 * Delete a job
 * Admin only - uses adminMiddleware
 */
export const deleteJobFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      id: z.string().min(1, 'ID is required'),
    }),
  )
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    try {
      await deleteJob(data.id)
      return { success: true }
    } catch (error) {
      console.error('Error deleting job:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete job',
      }
    }
  })

/**
 * Get all jobs for admin
 * Admin only - uses adminMiddleware
 */
export const getAllJobsForAdminFn = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(async () => {
    try {
      const jobs = await getAllJobs()
      return { success: true, data: jobs }
    } catch (error) {
      console.error('Error fetching jobs:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch jobs',
      }
    }
  })

/**
 * Get a single job by ID for admin
 * Admin only - uses adminMiddleware
 */
export const getJobForAdminFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      id: z.string().min(1, 'ID is required'),
    }),
  )
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    try {
      const job = await getJobById(data.id)
      if (!job) {
        return { success: false, error: 'Job not found' }
      }
      return { success: true, data: job }
    } catch (error) {
      console.error('Error fetching job:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch job',
      }
    }
  })

/**
 * Get a job by slug with its tasks for admin
 * Admin only - uses adminMiddleware
 */
export const getJobBySlugForAdminFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      slug: z.string().min(1, 'Slug is required'),
    }),
  )
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    try {
      const job = await getJobBySlug(data.slug)
      if (!job) {
        return { success: false, error: 'Job not found' }
      }

      // Fetch tasks for this job
      const tasks = await getTasksByJobId(job.id)

      return {
        success: true,
        data: {
          ...job,
          tasks,
        },
      }
    } catch (error) {
      console.error('Error fetching job by slug:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch job',
      }
    }
  })

// ============================================
// ADMIN TASK ACTIONS
// ============================================

/**
 * Create a new task for a job
 * Admin only - uses adminMiddleware
 */
export const createTaskFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      jobId: z.string().min(1, 'Job ID is required'),
      name: z.string().min(1, 'Name is required').max(200),
      percentageOfJob: z
        .number()
        .min(1, 'Percentage must be at least 1')
        .max(100, 'Percentage must be at most 100'),
      automatable: z.enum(['yes', 'partial', 'no']),
      reason: z.string().optional(),
    }),
  )
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    try {
      const task = await createTask(data)
      return { success: true, data: task }
    } catch (error) {
      console.error('Error creating task:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create task',
      }
    }
  })

/**
 * Update an existing task
 * Admin only - uses adminMiddleware
 */
export const updateTaskFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      id: z.string().min(1, 'ID is required'),
      name: z.string().min(1).max(200).optional(),
      percentageOfJob: z.number().min(1).max(100).optional(),
      automatable: z.enum(['yes', 'partial', 'no']).optional(),
      reason: z.string().optional(),
    }),
  )
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    try {
      const task = await updateTask(data)
      return { success: true, data: task }
    } catch (error) {
      console.error('Error updating task:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update task',
      }
    }
  })

/**
 * Delete a task
 * Admin only - uses adminMiddleware
 */
export const deleteTaskFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      id: z.string().min(1, 'ID is required'),
    }),
  )
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    try {
      await deleteTask(data.id)
      return { success: true }
    } catch (error) {
      console.error('Error deleting task:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete task',
      }
    }
  })

// ============================================
// ADMIN TASK_CAPABILITY_SUBTYPE ACTIONS
// ============================================

/**
 * Link a task to a capability subtype
 * Admin only - uses adminMiddleware
 */
export const createTaskCapabilitySubtypeFn = createServerFn({
  method: 'POST',
})
  .inputValidator(
    z.object({
      taskId: z.string().min(1, 'Task ID is required'),
      capabilitySubtypeId: z
        .string()
        .min(1, 'Capability subtype ID is required'),
      importance: z.enum(['critical', 'important', 'minor']),
      minimumLevelRequired: z.number().min(0).max(100),
      notes: z.string().optional(),
    }),
  )
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    try {
      const link = await createTaskCapabilitySubtype(data)
      return { success: true, data: link }
    } catch (error) {
      console.error('Error creating task capability subtype link:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create link',
      }
    }
  })

/**
 * Update a task-capability subtype link
 * Admin only - uses adminMiddleware
 */
export const updateTaskCapabilitySubtypeFn = createServerFn({
  method: 'POST',
})
  .inputValidator(
    z.object({
      id: z.string().min(1, 'ID is required'),
      importance: z.enum(['critical', 'important', 'minor']).optional(),
      minimumLevelRequired: z.number().min(0).max(100).optional(),
      notes: z.string().optional(),
    }),
  )
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    try {
      const link = await updateTaskCapabilitySubtype(data)
      return { success: true, data: link }
    } catch (error) {
      console.error('Error updating task capability subtype link:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update link',
      }
    }
  })

/**
 * Delete a task-capability subtype link
 * Admin only - uses adminMiddleware
 */
export const deleteTaskCapabilitySubtypeFn = createServerFn({
  method: 'POST',
})
  .inputValidator(
    z.object({
      id: z.string().min(1, 'ID is required'),
    }),
  )
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    try {
      await deleteTaskCapabilitySubtype(data.id)
      return { success: true }
    } catch (error) {
      console.error('Error deleting task capability subtype link:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete link',
      }
    }
  })

/**
 * Get all capability subtypes for admin (for linking to tasks)
 * Admin only - uses adminMiddleware
 */
export const getAllCapabilitySubtypesForAdminFn = createServerFn({
  method: 'GET',
})
  .middleware([adminMiddleware])
  .handler(async () => {
    try {
      const subtypes = await getAllSubtypes()
      return { success: true, data: subtypes }
    } catch (error) {
      console.error('Error fetching capability subtypes:', error)
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to fetch subtypes',
      }
    }
  })
