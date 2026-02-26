import { createServerFn } from '@tanstack/react-start'

import z from 'zod'

import {
  createOrganization,
  deleteOrganization,
  getAllOrganizations,
  getOrganizationById,
  getOrganizationBySlug,
  updateOrganization,
} from '@/data-layer/organizations'
import { adminMiddleware } from '@/middleware/server'

// ============================================
// ADMIN ORGANIZATION ACTIONS
// ============================================

/**
 * Create a new organization
 * Admin only - uses adminMiddleware
 */
export const createOrganizationFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      name: z.string().min(1, 'Name is required').max(200),
      slug: z
        .string()
        .min(1, 'Slug is required')
        .max(200)
        .regex(
          /^[a-z0-9-]+$/,
          'Slug must contain only lowercase letters, numbers, and hyphens',
        ),
      types: z
        .array(
          z.enum([
            'ai_lab',
            'robotics',
            'enterprise_software',
            'startup',
            'research_institution',
          ]),
        )
        .min(1, 'At least one type is required'),
      description: z
        .string()
        .min(10, 'Description must be at least 10 characters')
        .max(5000),
      website: z
        .string()
        .url('Must be a valid URL')
        .optional()
        .or(z.literal('')),
      logo: z.string().url('Must be a valid URL').optional().or(z.literal('')),
      foundedYear: z
        .number()
        .int('Must be a whole number')
        .min(1800, 'Must be a valid year')
        .max(
          new Date().getFullYear() + 10,
          'Year cannot be too far in the future',
        )
        .optional(),
      isSponsor: z.boolean().optional(),
      sponsorTier: z.enum(['none', 'bronze', 'silver', 'gold']).optional(),
      isClaimed: z.boolean().optional(),
      verifiedBadge: z.boolean().optional(),
    }),
  )
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    try {
      const org = await createOrganization({
        name: data.name,
        slug: data.slug,
        types: data.types,
        description: data.description,
        website: data.website || undefined,
        logo: data.logo || undefined,
        foundedYear: data.foundedYear,
        isSponsor: data.isSponsor,
        sponsorTier: data.sponsorTier,
        isClaimed: data.isClaimed,
        verifiedBadge: data.verifiedBadge,
      })
      return { success: true, data: org }
    } catch (error) {
      console.error('Error creating organization:', error)
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create organization',
      }
    }
  })

/**
 * Update an existing organization
 * Admin only - uses adminMiddleware
 */
export const updateOrganizationFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      id: z.string().min(1, 'ID is required'),
      name: z.string().min(1).max(200).optional(),
      slug: z
        .string()
        .min(1)
        .max(200)
        .regex(
          /^[a-z0-9-]+$/,
          'Slug must contain only lowercase letters, numbers, and hyphens',
        )
        .optional(),
      types: z
        .array(
          z.enum([
            'ai_lab',
            'robotics',
            'enterprise_software',
            'startup',
            'research_institution',
          ]),
        )
        .optional(),
      description: z.string().min(10).max(5000).optional(),
      website: z.string().url().optional().or(z.literal('')),
      logo: z.string().url().optional().or(z.literal('')),
      foundedYear: z
        .number()
        .int()
        .min(1800)
        .max(new Date().getFullYear() + 10)
        .optional(),
      isSponsor: z.boolean().optional(),
      sponsorTier: z.enum(['none', 'bronze', 'silver', 'gold']).optional(),
      isClaimed: z.boolean().optional(),
      verifiedBadge: z.boolean().optional(),
    }),
  )
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    try {
      const org = await updateOrganization(data)
      return { success: true, data: org }
    } catch (error) {
      console.error('Error updating organization:', error)
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update organization',
      }
    }
  })

/**
 * Delete an organization
 * Admin only - uses adminMiddleware
 */
export const deleteOrganizationFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      id: z.string().min(1, 'ID is required'),
    }),
  )
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    try {
      await deleteOrganization(data.id)
      return { success: true }
    } catch (error) {
      console.error('Error deleting organization:', error)
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to delete organization',
      }
    }
  })

/**
 * Get all organizations for admin
 * Admin only - uses adminMiddleware
 */
export const getAllOrganizationsForAdminFn = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(async () => {
    try {
      const organizations = await getAllOrganizations()
      return { success: true, data: organizations }
    } catch (error) {
      console.error('Error fetching organizations:', error)
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch organizations',
      }
    }
  })

/**
 * Get a single organization by ID for admin
 * Admin only - uses adminMiddleware
 */
export const getOrganizationForAdminFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      id: z.string().min(1, 'ID is required'),
    }),
  )
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    try {
      const org = await getOrganizationById(data.id)
      if (!org) {
        return { success: false, error: 'Organization not found' }
      }
      return { success: true, data: org }
    } catch (error) {
      console.error('Error fetching organization:', error)
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch organization',
      }
    }
  })

/**
 * Get a organization by slug for admin edit page
 * Admin only - uses adminMiddleware
 */
export const getOrganizationBySlugForAdminFn = createServerFn({
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
      const org = await getOrganizationBySlug(data.slug)
      if (!org) {
        return { success: false, error: 'Organization not found' }
      }
      return { success: true, data: org }
    } catch (error) {
      console.error('Error fetching organization by slug:', error)
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch organization',
      }
    }
  })
