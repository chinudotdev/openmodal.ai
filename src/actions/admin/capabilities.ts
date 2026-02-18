import { createServerFn } from '@tanstack/react-start'
import z from 'zod'
import { authMiddleware } from '@/middleware/server'
import {
  createCapability,
  createCapabilitySubtype,
  deleteCapability,
  deleteCapabilitySubtype,
  getAllCapabilities,
  getAllSubtypes,
  getCapabilityById,
  getSubtypeBySlug,
  updateCapability,
  updateCapabilitySubtype,
} from '@/data-layer/capabilities'

// ============================================
// ADMIN CAPABILITY ACTIONS
// ============================================

/**
 * Create a new capability
 * Admin only - requires auth middleware
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
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    // Check if user is admin
    if (context.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

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
 * Admin only - requires auth middleware
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
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    // Check if user is admin
    if (context.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

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
 * Admin only - requires auth middleware
 */
export const deleteCapabilityFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      id: z.string().min(1, 'ID is required'),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    // Check if user is admin
    if (context.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

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
 * Admin only - requires auth middleware
 */
export const getAllCapabilitiesForAdminFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    // Check if user is admin
    if (context.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

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
 * Admin only - requires auth middleware
 */
export const getCapabilityForAdminFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      id: z.string().min(1, 'ID is required'),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    // Check if user is admin
    if (context.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

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

// ============================================
// ADMIN CAPABILITY SUBTYPE ACTIONS
// ============================================

/**
 * Create a new capability subtype
 * Admin only - requires auth middleware
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
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    // Check if user is admin
    if (context.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

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
 * Admin only - requires auth middleware
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
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    // Check if user is admin
    if (context.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

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
 * Admin only - requires auth middleware
 */
export const deleteCapabilitySubtypeFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      id: z.string().min(1, 'ID is required'),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    // Check if user is admin
    if (context.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

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
 * Admin only - requires auth middleware
 */
export const getAllSubtypesForAdminFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    // Check if user is admin
    if (context.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    try {
      const subtypes = await getAllSubtypes()

      // Fetch parent capability for each subtype
      const subtypesWithCapabilities = await Promise.all(
        subtypes.map(async (subtype) => {
          const capability = await getCapabilityById(subtype.capabilityId)
          return {
            ...subtype,
            capability,
          }
        }),
      )

      return { success: true, data: subtypesWithCapabilities }
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
 * Get a single subtype by ID for admin
 * Admin only - requires auth middleware
 */
export const getSubtypeForAdminFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      id: z.string().min(1, 'ID is required'),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    // Check if user is admin
    if (context.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    try {
      // Use slug to get subtype (since we don't have getById)
      const subtypes = await getAllSubtypes()
      const subtype = subtypes.find((s) => s.id === data.id)

      if (!subtype) {
        return { success: false, error: 'Subtype not found' }
      }

      // Fetch parent capability
      const capability = await getCapabilityById(subtype.capabilityId)

      return {
        success: true,
        data: {
          ...subtype,
          capability,
        },
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
