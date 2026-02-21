import { createServerFn } from '@tanstack/react-start'

import z from 'zod'

import {
  getAllOrganizations,
  getAllSponsors,
  getOrganizationBySlug,
  getOrganizationReportBreakdown,
  getOrganizationTypes,
  getSponsorTiers,
} from '@/data-layer/organizations'

// ============================================
// SERVER FUNCTIONS
// ============================================

/**
 * Get all organizations with optional filters
 */
export const getAllOrganizationsFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      types: z.array(z.string()).optional(),
      sponsorTier: z.enum(['none', 'bronze', 'silver', 'gold']).optional(),
      isSponsor: z.boolean().optional(),
      isClaimed: z.boolean().optional(),
      search: z.string().optional(),
      sortBy: z
        .enum(['name', 'newest', 'oldest', 'most_technologies', 'most_reports'])
        .optional(),
    }),
  )
  .handler(async ({ data }) => {
    const organizations = await getAllOrganizations(data as any)
    return { organizations }
  })

/**
 * Get organization by slug with full details
 */
export const getOrganizationBySlugFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    const organization = await getOrganizationBySlug(data.slug)

    if (!organization) {
      return { organization: null, reportBreakdown: [] }
    }

    // Get report breakdown
    const reportBreakdown = await getOrganizationReportBreakdown(
      organization.id,
    )

    return { organization, reportBreakdown }
  })

/**
 * Get all sponsors grouped by tier
 */
export const getAllSponsorsFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const sponsors = await getAllSponsors()
    return { sponsors }
  },
)

/**
 * Get organization types (for filters)
 */
export const getOrganizationTypesFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const types = await getOrganizationTypes()
    return { types }
  },
)

/**
 * Get sponsor tiers (for filters)
 */
export const getSponsorTiersFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const tiers = await getSponsorTiers()
    return { tiers }
  },
)
