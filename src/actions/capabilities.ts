import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

import {
  getAllCapabilities,
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
    return await getAllCapabilities()
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
      return null
    }

    // Fetch related data
    const subtypes = await getSubtypesByCapabilityId(capability.id)

    return {
      ...capability,
      subtypes,
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
    return { overall: progress }
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
      return null
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
      ...subtype,
      parentCapability,
      technologies,
      jobs,
      organizations,
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
    return await getTechnologiesBySubtypeId(data.subtypeId)
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
    return await getJobsBySubtypeId(data.subtypeId)
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
    return await getOrganizationsBySubtypeId(data.subtypeId)
  })
