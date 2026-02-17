import { createServerFn } from '@tanstack/react-start'
import z from 'zod'
import {
  getAllCapabilities,
  getCapabilitiesByCategory,
  getCapabilitiesProgressByCategory,
  getCapabilityById,
  getCapabilityBySlug,
  getJobsBySubtypeId,
  getOrganizationsBySubtypeId,
  getOverallProgress,
  getSubtypeBySlug,
  getSubtypesByCapabilityId,
  getTechnologiesBySubtypeId,
} from '@/data-layer/capabilities'
import { rateLimitMiddleware } from '@/middleware/server'

// ============================================
// PUBLIC CAPABILITY ACTIONS
// ============================================

/**
 * Fetch all capabilities with their stats
 * Public endpoint - no auth required
 */
export const getAllCapabilitiesFn = createServerFn({ method: 'GET' })
  .middleware([rateLimitMiddleware({ max: 60, window: 60 })])
  .handler(async () => {
    const capabilities = await getAllCapabilities()
    return { success: true, data: capabilities }
  })

/**
 * Fetch capabilities by category
 * Public endpoint - no auth required
 */
export const getCapabilitiesByCategoryFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      category: z.enum(['All', 'cognitive', 'physical', 'social', 'meta']),
    }),
  )
  .middleware([rateLimitMiddleware({ max: 60, window: 60 })])
  .handler(async ({ data }) => {
    const capabilities = await getCapabilitiesByCategory(data.category)
    return { success: true, data: capabilities }
  })

/**
 * Fetch a single capability by slug with its subtypes
 * Public endpoint - no auth required
 */
export const getCapabilityBySlugFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      slug: z.string().min(1),
    }),
  )
  .middleware([rateLimitMiddleware({ max: 60, window: 60 })])
  .handler(async ({ data }) => {
    const capability = await getCapabilityBySlug(data.slug)
    if (!capability) {
      return { success: false, error: 'Capability not found' }
    }

    // Fetch related data
    const subtypes = await getSubtypesByCapabilityId(capability.id)

    return {
      success: true,
      data: {
        ...capability,
        subtypes,
      },
    }
  })

/**
 * Fetch overall AGI progress
 * Public endpoint - no auth required
 */
export const getOverallProgressFn = createServerFn({ method: 'GET' })
  .middleware([rateLimitMiddleware({ max: 30, window: 60 })])
  .handler(async () => {
    const progress = await getOverallProgress()
    const byCategory = await getCapabilitiesProgressByCategory()

    return {
      success: true,
      data: {
        overall: progress,
        byCategory,
      },
    }
  })

// ============================================
// PUBLIC CAPABILITY SUBTYPE ACTIONS
// ============================================

/**
 * Fetch a single capability subtype by slug with related data
 * Public endpoint - no auth required
 */
export const getSubtypeBySlugFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      slug: z.string().min(1),
    }),
  )
  .middleware([rateLimitMiddleware({ max: 60, window: 60 })])
  .handler(async ({ data }) => {
    const subtype = await getSubtypeBySlug(data.slug)
    if (!subtype) {
      return { success: false, error: 'Subtype not found' }
    }

    // Fetch parent capability by ID
    const parentCapability = await getCapabilityById(subtype.capabilityId)

    // Fetch related data
    const [technologies, jobs, organizations] = await Promise.all([
      getTechnologiesBySubtypeId(subtype.id),
      getJobsBySubtypeId(subtype.id),
      getOrganizationsBySubtypeId(subtype.id),
    ])

    return {
      success: true,
      data: {
        ...subtype,
        parentCapability,
        technologies,
        jobs,
        organizations,
      },
    }
  })

/**
 * Fetch technologies for a capability subtype
 * Public endpoint - no auth required
 */
export const getTechnologiesBySubtypeFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      subtypeId: z.string().min(1),
    }),
  )
  .middleware([rateLimitMiddleware({ max: 60, window: 60 })])
  .handler(async ({ data }) => {
    const technologies = await getTechnologiesBySubtypeId(data.subtypeId)

    return {
      success: true,
      data: technologies,
    }
  })

/**
 * Fetch jobs for a capability subtype
 * Public endpoint - no auth required
 */
export const getJobsBySubtypeFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      subtypeId: z.string().min(1),
    }),
  )
  .middleware([rateLimitMiddleware({ max: 60, window: 60 })])
  .handler(async ({ data }) => {
    const jobs = await getJobsBySubtypeId(data.subtypeId)

    return {
      success: true,
      data: jobs,
    }
  })

/**
 * Fetch organizations working on a capability subtype
 * Public endpoint - no auth required
 */
export const getOrganizationsBySubtypeFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      subtypeId: z.string().min(1),
    }),
  )
  .middleware([rateLimitMiddleware({ max: 60, window: 60 })])
  .handler(async ({ data }) => {
    const organizations = await getOrganizationsBySubtypeId(data.subtypeId)

    return {
      success: true,
      data: organizations,
    }
  })
