import { createServerFn } from '@tanstack/react-start'

import z from 'zod'

import {
  createCapability,
  createCapabilitySubtype,
  deleteCapability,
  deleteCapabilitySubtype,
  getAllCapabilities,
  getAllSubtypes,
  getCapabilityById,
  getCapabilityBySlug,
  getSubtypesByCapabilityId,
  updateCapability,
  updateCapabilitySubtype,
} from '@/data-layer/capabilities'
import { adminMiddleware } from '@/middleware/server'

// ============================================
// ADMIN CAPABILITY ACTIONS
// ============================================

/**
 * Create a new capability
 * Admin only - uses adminMiddleware
 */
export const createCapabilityFn = createServerFn({ method: 'POST' })
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
      description: z
        .string()
        .min(10, 'Description must be at least 10 characters')
        .max(500),
      icon: z.string().optional(),
    }),
  )
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    try {
      const capability = await createCapability(data)
      return { success: true, data: capability }
    } catch (error) {
      console.error('Error creating capability:', error)
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create capability',
      }
    }
  })

/**
 * Update an existing capability
 * Admin only - uses adminMiddleware
 */
export const updateCapabilityFn = createServerFn({ method: 'POST' })
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
      description: z.string().min(10).max(500).optional(),
      icon: z.string().optional(),
    }),
  )
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    try {
      const capability = await updateCapability(data)
      return { success: true, data: capability }
    } catch (error) {
      console.error('Error updating capability:', error)
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update capability',
      }
    }
  })

/**
 * Delete a capability
 * Admin only - uses adminMiddleware
 */
export const deleteCapabilityFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      id: z.string().min(1, 'ID is required'),
    }),
  )
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    try {
      await deleteCapability(data.id)
      return { success: true }
    } catch (error) {
      console.error('Error deleting capability:', error)
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to delete capability',
      }
    }
  })

/**
 * Get all capabilities for admin
 * Admin only - uses adminMiddleware
 */
export const getAllCapabilitiesForAdminFn = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(async () => {
    try {
      const capabilities = await getAllCapabilities()
      return { success: true, data: capabilities }
    } catch (error) {
      console.error('Error fetching capabilities:', error)
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch capabilities',
      }
    }
  })

/**
 * Get a single capability by ID for admin
 * Admin only - uses adminMiddleware
 */
export const getCapabilityForAdminFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      id: z.string().min(1, 'ID is required'),
    }),
  )
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    try {
      const capability = await getCapabilityById(data.id)
      if (!capability) {
        return { success: false, error: 'Capability not found' }
      }
      return { success: true, data: capability }
    } catch (error) {
      console.error('Error fetching capability:', error)
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to fetch capability',
      }
    }
  })

/**
 * Get a capability by slug with its subtypes
 * Admin only - uses adminMiddleware
 */
export const getCapabilityBySlugForAdminFn = createServerFn({
  method: 'POST',
})
  .inputValidator(
    z.object({
      slug: z.string().min(1, 'Slug is required'),
    }),
  )
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    try {
      const capability = await getCapabilityBySlug(data.slug)
      if (!capability) {
        return { success: false, error: 'Capability not found' }
      }

      // Fetch subtypes for this capability
      const subtypes = await getSubtypesByCapabilityId(capability.id)

      return {
        success: true,
        data: {
          ...capability,
          subtypes,
        },
      }
    } catch (error) {
      console.error('Error fetching capability by slug:', error)
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to fetch capability',
      }
    }
  })

// ============================================
// ADMIN CAPABILITY SUBTYPE ACTIONS
// ============================================

/**
 * Create a new capability subtype
 * Admin only - uses adminMiddleware
 */
export const createCapabilitySubtypeFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      capabilityId: z.string().min(1, 'Capability ID is required'),
      name: z.string().min(1, 'Name is required').max(100),
      slug: z
        .string()
        .min(1, 'Slug is required')
        .max(100)
        .regex(
          /^[a-z0-9-]+$/,
          'Slug must contain only lowercase letters, numbers, and hyphens',
        ),
      domain: z.string().min(1, 'Domain is required').max(50),
      description: z
        .string()
        .min(10, 'Description must be at least 10 characters')
        .max(500),
      progressPercentage: z.number().min(0).max(100).default(0),
      status: z.enum(['solved', 'partial', 'unsolved']).default('unsolved'),
      whatWorks: z.array(z.string()).default([]),
      whatStruggles: z.array(z.string()).default([]),
      whatDoesntWork: z.array(z.string()).default([]),
    }),
  )
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    try {
      const subtype = await createCapabilitySubtype(data)
      return { success: true, data: subtype }
    } catch (error) {
      console.error('Error creating capability subtype:', error)
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create capability subtype',
      }
    }
  })

/**
 * Update an existing capability subtype
 * Admin only - uses adminMiddleware
 */
export const updateCapabilitySubtypeFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      id: z.string().min(1, 'ID is required'),
      name: z.string().min(1).max(100).optional(),
      slug: z
        .string()
        .min(1)
        .max(100)
        .regex(/^[a-z0-9-]+$/)
        .optional(),
      domain: z.string().min(1).max(50).optional(),
      description: z.string().min(10).max(500).optional(),
      progressPercentage: z.number().min(0).max(100).optional(),
      status: z.enum(['solved', 'partial', 'unsolved']).optional(),
      whatWorks: z.array(z.string()).optional(),
      whatStruggles: z.array(z.string()).optional(),
      whatDoesntWork: z.array(z.string()).optional(),
    }),
  )
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    try {
      const subtype = await updateCapabilitySubtype(data)
      return { success: true, data: subtype }
    } catch (error) {
      console.error('Error updating capability subtype:', error)
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update capability subtype',
      }
    }
  })

/**
 * Delete a capability subtype
 * Admin only - uses adminMiddleware
 */
export const deleteCapabilitySubtypeFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      id: z.string().min(1, 'ID is required'),
    }),
  )
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    try {
      await deleteCapabilitySubtype(data.id)
      return { success: true }
    } catch (error) {
      console.error('Error deleting capability subtype:', error)
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to delete capability subtype',
      }
    }
  })

/**
 * Get all subtypes for admin
 * Admin only - uses adminMiddleware
 */
export const getAllSubtypesForAdminFn = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(async () => {
    try {
      const subtypes = await getAllSubtypes()
      return { success: true, data: subtypes }
    } catch (error) {
      console.error('Error fetching subtypes:', error)
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to fetch subtypes',
      }
    }
  })

/**
 * Search capability subtypes by query
 * Admin only - uses adminMiddleware
 */
export const searchSubtypesForAdminFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      query: z.string().optional(),
    }),
  )
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    try {
      let subtypes = await getAllSubtypes()

      // Filter by query if provided (server-side filtering)
      if (data.query && data.query.trim()) {
        const query = data.query.toLowerCase()
        subtypes = subtypes.filter(
          (s) =>
            s.name.toLowerCase().includes(query) ||
            s.domain.toLowerCase().includes(query) ||
            s.capability.name.toLowerCase().includes(query),
        )
      }

      return { success: true, data: subtypes }
    } catch (error) {
      console.error('Error searching subtypes:', error)
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to search subtypes',
      }
    }
  })

/**
 * Get a single subtype by ID for admin
 * Admin only - uses adminMiddleware
 */
export const getSubtypeForAdminFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      id: z.string().min(1, 'ID is required'),
    }),
  )
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    try {
      // Get all subtypes and find by ID (includes capability from join)
      const subtypes = await getAllSubtypes()
      const subtype = subtypes.find((s) => s.id === data.id)

      if (!subtype) {
        return { success: false, error: 'Subtype not found' }
      }

      return {
        success: true,
        data: subtype,
      }
    } catch (error) {
      console.error('Error fetching subtype:', error)
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to fetch subtype',
      }
    }
  })
