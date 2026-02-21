import { createServerFn } from '@tanstack/react-start'

import z from 'zod'

import {
  getAllTechnologies,
  getTechnologyBySlug,
  getTechnologyReportBreakdown,
  getTechnologyStages,
  getTechnologyTypes,
} from '@/data-layer/technologies'

// ============================================
// SERVER FUNCTIONS
// ============================================

/**
 * Get all technologies with optional filters
 */
export const getAllTechnologiesFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      type: z
        .enum(['ai_model', 'robot', 'software', 'hardware', 'api'])
        .optional(),
      stage: z
        .enum(['research', 'pilot', 'deployed', 'discontinued'])
        .optional(),
      status: z.enum(['pending', 'approved', 'rejected']).optional(),
      search: z.string().optional(),
      sortBy: z.enum(['name', 'newest', 'oldest', 'most_reports']).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const technologies = await getAllTechnologies(data)
    return { technologies }
  })

/**
 * Get technology by slug with full details
 */
export const getTechnologyBySlugFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    const technology = await getTechnologyBySlug(data.slug)

    if (!technology) {
      return { technology: null, reportBreakdown: [] }
    }

    // Get report breakdown
    const reportBreakdown = await getTechnologyReportBreakdown(technology.id)

    return { technology, reportBreakdown }
  })

/**
 * Get technology types (for filters)
 */
export const getTechnologyTypesFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const types = await getTechnologyTypes()
    return { types }
  },
)

/**
 * Get technology stages (for filters)
 */
export const getTechnologyStagesFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const stages = await getTechnologyStages()
    return { stages }
  },
)
