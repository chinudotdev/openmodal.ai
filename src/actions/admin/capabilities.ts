import { createServerFn } from '@tanstack/react-start'

import z from 'zod'

import { getAllSubtypes } from '@/data-layer/capabilities'
import { adminMiddleware } from '@/middleware/server'

// ============================================
// ADMIN CAPABILITY ACTIONS
// ============================================

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
