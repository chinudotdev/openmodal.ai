import { createServerFn } from '@tanstack/react-start'

import z from 'zod'

import { updateTechnologyCapabilityMappings } from '@/data-layer/technologies'
import { adminMiddleware } from '@/middleware/server'

// ============================================
// ADMIN TECHNOLOGY ACTIONS
// ============================================

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
