import { createServerFn } from '@tanstack/react-start'

import z from 'zod'

import {
  createTechnology,
  deleteTechnology,
  getTechnologiesByOrganizationForAdmin,
  getTechnologyById,
  getTechnologyBySlug,
  getTechnologyCapabilityMappings,
  updateTechnology,
  updateTechnologyCapabilityMappings,
} from '@/data-layer/technologies'
import { adminMiddleware } from '@/middleware/server'

// ============================================
// ADMIN TECHNOLOGY ACTIONS
// ============================================

/**
 * Create a new technology
 * Admin only - uses adminMiddleware
 */
export const createTechnologyFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      name: z.string().min(1, 'Name is required').max(200),
      slug: z
        .string()
        .min(1, 'Slug is required')
        .max(200)
        .regex(
          /^[a-z0-9.-]+$/,
          'Slug must contain only lowercase letters, numbers, hyphens, and dots',
        ),
      type: z.enum(['ai_model', 'robot', 'software', 'hardware', 'api']),
      description: z
        .string()
        .min(10, 'Description must be at least 10 characters')
        .max(5000),
      image: z.string().url('Must be a valid URL').optional().or(z.literal('')),
      website: z
        .string()
        .url('Must be a valid URL')
        .optional()
        .or(z.literal('')),
      organizationId: z.string().min(1, 'Organization ID is required'),
      stage: z.enum(['research', 'pilot', 'deployed', 'discontinued']),
      releaseDate: z.string().optional(),
      status: z.enum(['pending', 'approved', 'rejected']).default('approved'),
      capabilityMappings: z
        .array(
          z.object({
            capabilitySubtypeId: z.string(),
            performanceScore: z.number().min(0).max(100).optional(),
          }),
        )
        .optional(),
    }),
  )
  .middleware([adminMiddleware])
  .handler(async ({ data, context }) => {
    try {
      const tech = await createTechnology({
        id: crypto.randomUUID(),
        slug: data.slug,
        name: data.name,
        type: data.type,
        description: data.description,
        image: data.image || undefined,
        website: data.website || undefined,
        organizationId: data.organizationId,
        stage: data.stage,
        releaseDate: data.releaseDate ? new Date(data.releaseDate) : undefined,
        status: data.status,
        submittedBy: context.user.id,
      })

      // Handle capability mappings if provided
      if (data.capabilityMappings && data.capabilityMappings.length > 0) {
        await updateTechnologyCapabilityMappings(
          tech.id,
          data.capabilityMappings,
        )
      }

      return { success: true, data: tech }
    } catch (error) {
      console.error('Error creating technology:', error)
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create technology',
      }
    }
  })

/**
 * Update an existing technology
 * Admin only - uses adminMiddleware
 */
export const updateTechnologyFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      id: z.string().min(1, 'ID is required'),
      name: z.string().min(1).max(200).optional(),
      slug: z
        .string()
        .min(1)
        .max(200)
        .regex(/^[a-z0-9.-]+$/)
        .optional(),
      type: z
        .enum(['ai_model', 'robot', 'software', 'hardware', 'api'])
        .optional(),
      description: z.string().min(10).max(5000).optional(),
      image: z.string().url().optional().or(z.literal('')),
      website: z.string().url().optional().or(z.literal('')),
      stage: z
        .enum(['research', 'pilot', 'deployed', 'discontinued'])
        .optional(),
      releaseDate: z.string().optional(),
      status: z.enum(['pending', 'approved', 'rejected']).optional(),
      capabilityMappings: z
        .array(
          z.object({
            capabilitySubtypeId: z.string(),
            performanceScore: z.number().min(0).max(100).optional(),
          }),
        )
        .optional(),
    }),
  )
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    try {
      const tech = await updateTechnology(data.id, {
        name: data.name,
        slug: data.slug,
        type: data.type,
        description: data.description,
        image: data.image || undefined,
        website: data.website || undefined,
        stage: data.stage,
        releaseDate: data.releaseDate ? new Date(data.releaseDate) : undefined,
        status: data.status,
      })

      // Handle capability mappings if provided
      if (data.capabilityMappings !== undefined) {
        await updateTechnologyCapabilityMappings(
          data.id,
          data.capabilityMappings,
        )
      }

      return { success: true, data: tech }
    } catch (error) {
      console.error('Error updating technology:', error)
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update technology',
      }
    }
  })

/**
 * Delete a technology
 * Admin only - uses adminMiddleware
 */
export const deleteTechnologyFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      id: z.string().min(1, 'ID is required'),
    }),
  )
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    try {
      await deleteTechnology(data.id)
      return { success: true }
    } catch (error) {
      console.error('Error deleting technology:', error)
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to delete technology',
      }
    }
  })

/**
 * Get a single technology by ID for admin
 * Admin only - uses adminMiddleware
 */
export const getTechnologyForAdminFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      id: z.string().min(1, 'ID is required'),
    }),
  )
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    try {
      const tech = await getTechnologyById(data.id)
      if (!tech) {
        return { success: false, error: 'Technology not found' }
      }
      return { success: true, data: tech }
    } catch (error) {
      console.error('Error fetching technology:', error)
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to fetch technology',
      }
    }
  })

/**
 * Get a technology by slug for admin edit page
 * Admin only - uses adminMiddleware
 */
export const getTechnologyBySlugForAdminFn = createServerFn({
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
      const tech = await getTechnologyBySlug(data.slug)
      if (!tech) {
        return { success: false, error: 'Technology not found' }
      }
      return { success: true, data: tech }
    } catch (error) {
      console.error('Error fetching technology by slug:', error)
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to fetch technology',
      }
    }
  })

/**
 * Get technologies by organization for admin
 * Admin only - uses adminMiddleware
 */
export const getTechnologiesByOrganizationForAdminFn = createServerFn({
  method: 'POST',
})
  .inputValidator(
    z.object({
      organizationId: z.string().min(1, 'Organization ID is required'),
    }),
  )
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    try {
      const technologies = await getTechnologiesByOrganizationForAdmin(
        data.organizationId,
      )
      return { success: true, data: technologies }
    } catch (error) {
      console.error('Error fetching technologies:', error)
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch technologies',
      }
    }
  })

/**
 * Get capability mappings for a technology
 * Admin only - uses adminMiddleware
 */
export const getTechnologyCapabilityMappingsFn = createServerFn({
  method: 'POST',
})
  .inputValidator(
    z.object({
      technologyId: z.string().min(1, 'Technology ID is required'),
    }),
  )
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    try {
      const mappings = await getTechnologyCapabilityMappings(data.technologyId)
      return { success: true, data: mappings }
    } catch (error) {
      console.error('Error fetching technology capability mappings:', error)
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch capability mappings',
      }
    }
  })

/**
 * Update capability mappings for a technology
 * Admin only - uses adminMiddleware
 */
export const updateTechnologyCapabilityMappingsFn = createServerFn({
  method: 'POST',
})
  .inputValidator(
    z.object({
      technologyId: z.string().min(1, 'Technology ID is required'),
      mappings: z.array(
        z.object({
          capabilitySubtypeId: z.string(),
          performanceScore: z.number().min(0).max(100).optional(),
        }),
      ),
    }),
  )
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    try {
      await updateTechnologyCapabilityMappings(data.technologyId, data.mappings)
      return { success: true }
    } catch (error) {
      console.error('Error updating technology capability mappings:', error)
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update capability mappings',
      }
    }
  })
