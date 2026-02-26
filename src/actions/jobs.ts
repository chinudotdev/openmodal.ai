import { createServerFn } from '@tanstack/react-start'

import z from 'zod'

import {
  getAllJobs,
  getAverageAutomationRisk,
  getJobBySlug,
  getJobsPaginated,
  getTasksByJobId,
} from '@/data-layer/jobs'
import { rateLimitMiddleware } from '@/middleware/server'

// ============================================
// PUBLIC JOB ACTIONS
// ============================================

// Job categories enum for validation (includes 'all' for UI)
const jobCategoryEnum = z.enum([
  'all',
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

// Risk level enum for validation (includes 'all' for UI)
const riskLevelEnum = z.enum(['all', 'low', 'medium', 'high', 'critical'])

// Sort by enum for validation
const sortByEnum = z.enum(['name', 'risk', 'recent'])

/**
 * Fetch jobs with pagination and filters
 * Public endpoint - no auth required
 */
export const getJobsPaginatedFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      page: z.number().min(1).optional().default(1),
      limit: z.number().min(1).max(100).optional().default(12),
      category: jobCategoryEnum.optional(),
      riskLevel: riskLevelEnum.optional(),
      search: z.string().optional(),
      sortBy: sortByEnum.optional().default('name'),
    }),
  )
  .middleware([rateLimitMiddleware({ max: 60, window: 60 })])
  .handler(async ({ data }) => {
    // Transform 'all' to undefined for the data layer
    const transformedData = {
      ...data,
      category:
        data.category && data.category !== 'all' ? data.category : undefined,
      riskLevel:
        data.riskLevel && data.riskLevel !== 'all' ? data.riskLevel : undefined,
    }
    return await getJobsPaginated(transformedData)
  })

/**
 * Fetch all jobs with their stats
 * Public endpoint - no auth required
 */
export const getAllJobsFn = createServerFn({ method: 'GET' })
  .middleware([rateLimitMiddleware({ max: 60, window: 60 })])
  .handler(async () => {
    return await getAllJobs()
  })

/**
 * Fetch a single job by slug with its tasks and related data
 * Public endpoint - no auth required
 */
export const getJobBySlugFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      slug: z.string().min(1),
    }),
  )
  .middleware([rateLimitMiddleware({ max: 60, window: 60 })])
  .handler(async ({ data }) => {
    const jobData = await getJobBySlug(data.slug)
    if (!jobData) {
      return null
    }

    // Fetch related data
    const tasks = await getTasksByJobId(jobData.id)

    return {
      ...jobData,
      tasks,
    }
  })

/**
 * Fetch average automation risk across all jobs
 * Public endpoint - no auth required
 */
export const getAverageAutomationRiskFn = createServerFn({ method: 'GET' })
  .middleware([rateLimitMiddleware({ max: 30, window: 60 })])
  .handler(async () => {
    const average = await getAverageAutomationRisk()
    return { average }
  })
