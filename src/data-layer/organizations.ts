import { and, asc, count, desc, eq, ilike, or, sql } from 'drizzle-orm'

import type { OrganizationType, SponsorTier } from '@/db/schema/organizations'
import { dbClient } from '@/db'
import {
  capability,
  capabilitySubtype,
  impactReport,
  organization,
  technology,
  technologyCapabilitySubtype,
} from '@/db/schema'

// ============================================
// TYPES
// ============================================

export interface OrganizationFilters {
  types?: Array<OrganizationType>
  sponsorTier?: SponsorTier
  isSponsor?: boolean
  isClaimed?: boolean
  search?: string
  sortBy?: 'name' | 'newest' | 'oldest' | 'most_technologies' | 'most_reports'
}

// Re-export the base type to work around parsing issues
type OrganizationBase = typeof organization.$inferSelect

export interface OrganizationWithStats extends OrganizationBase {
  _count: {
    technologies: number
    reports: number
  }
}

export interface OrganizationDetail extends OrganizationWithStats {
  technologies: Array<{
    id: string
    slug: string
    name: string
    type: string
    stage: string
    _count: {
      reports: number
    }
  }>
  capabilities: Array<{
    id: string
    name: string
    slug: string
    icon: string | null
  }>
}

export interface ReportBreakdown {
  impactType: string
  count: number
  percentage: number
}

// ============================================
// QUERIES
// ============================================

/**
 * Get all organizations with optional filters
 */
export async function getAllOrganizations(filters: OrganizationFilters = {}) {
  const db = dbClient()
  const {
    types,
    sponsorTier,
    isSponsor,
    isClaimed,
    search,
    sortBy = 'name',
  } = filters

  const conditions = []

  if (types && types.length > 0) {
    conditions.push(sql`${organization.types} && ${types}`)
  }

  if (sponsorTier) {
    conditions.push(eq(organization.sponsorTier, sponsorTier))
  }

  if (isSponsor !== undefined) {
    conditions.push(eq(organization.isSponsor, isSponsor))
  }

  if (isClaimed !== undefined) {
    conditions.push(eq(organization.isClaimed, isClaimed))
  }

  if (search) {
    conditions.push(
      or(
        ilike(organization.name, `%${search}%`),
        ilike(organization.description, `%${search}%`),
      ),
    )
  }

  const orderBy =
    sortBy === 'name'
      ? asc(organization.name)
      : sortBy === 'oldest'
        ? asc(organization.createdAt)
        : sortBy === 'newest'
          ? desc(organization.createdAt)
          : sortBy === 'most_technologies'
            ? desc(sql`tech_count`)
            : desc(sql`report_count`)

  try {
    const results = await db
      .select({
        id: organization.id,
        slug: organization.slug,
        name: organization.name,
        types: organization.types,
        description: organization.description,
        website: organization.website,
        logo: organization.logo,
        foundedYear: organization.foundedYear,
        isSponsor: organization.isSponsor,
        sponsorTier: organization.sponsorTier,
        isClaimed: organization.isClaimed,
        verifiedBadge: organization.verifiedBadge,
        createdAt: organization.createdAt,
        updatedAt: organization.updatedAt,
        techCount: sql<number>`COALESCE(tech_counts.count, 0)`,
        reportCount: sql<number>`COALESCE(report_counts.count, 0)`,
      })
      .from(organization)
      .leftJoin(
        sql`(SELECT organization_id, COUNT(*) as count FROM technology WHERE status = 'approved' GROUP BY organization_id) as tech_counts`,
        eq(organization.id, sql`tech_counts.organization_id`),
      )
      .leftJoin(
        sql`(SELECT o.id as organization_id, COUNT(*) as count FROM impact_report ir JOIN technology t ON ir.technology_id = t.id JOIN organization o ON t.organization_id = o.id WHERE ir.technology_id IS NOT NULL GROUP BY o.id) as report_counts`,
        eq(organization.id, sql`report_counts.organization_id`),
      )
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(orderBy)

    return results.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      types: r.types,
      description: r.description,
      website: r.website,
      logo: r.logo,
      foundedYear: r.foundedYear,
      isSponsor: r.isSponsor,
      sponsorTier: r.sponsorTier,
      isClaimed: r.isClaimed,
      verifiedBadge: r.verifiedBadge,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      _count: {
        technologies: r.techCount,
        reports: r.reportCount,
      },
    })) as Array<OrganizationWithStats>
  } catch (error) {
    console.error('Error fetching organizations:', error)
    return []
  }
}

/**
 * Get organization by slug with full details
 */
export async function getOrganizationBySlug(
  slug: string,
): Promise<OrganizationDetail | null> {
  const db = dbClient()
  try {
    // Get organization with counts
    const orgResults = await db
      .select({
        id: organization.id,
        slug: organization.slug,
        name: organization.name,
        types: organization.types,
        description: organization.description,
        website: organization.website,
        logo: organization.logo,
        foundedYear: organization.foundedYear,
        isSponsor: organization.isSponsor,
        sponsorTier: organization.sponsorTier,
        isClaimed: organization.isClaimed,
        verifiedBadge: organization.verifiedBadge,
        createdAt: organization.createdAt,
        updatedAt: organization.updatedAt,
        techCount: sql<number>`COALESCE(tech_counts.count, 0)`,
        reportCount: sql<number>`COALESCE(report_counts.count, 0)`,
      })
      .from(organization)
      .leftJoin(
        sql`(SELECT organization_id, COUNT(*) as count FROM technology WHERE status = 'approved' GROUP BY organization_id) as tech_counts`,
        eq(organization.id, sql`tech_counts.organization_id`),
      )
      .leftJoin(
        sql`(SELECT o.id as organization_id, COUNT(*) as count FROM impact_report ir JOIN technology t ON ir.technology_id = t.id JOIN organization o ON t.organization_id = o.id WHERE ir.technology_id IS NOT NULL GROUP BY o.id) as report_counts`,
        eq(organization.id, sql`report_counts.organization_id`),
      )
      .where(eq(organization.slug, slug))
      .limit(1)

    if (orgResults.length === 0) {
      return null
    }

    const orgResult = orgResults[0]

    // Get technologies for this organization
    const technologies = await db
      .select({
        id: technology.id,
        slug: technology.slug,
        name: technology.name,
        type: technology.type,
        stage: technology.stage,
        reportCount: sql<number>`COALESCE(report_counts.count, 0)`,
      })
      .from(technology)
      .leftJoin(
        sql`(SELECT technology_id, COUNT(*) as count FROM impact_report WHERE technology_id IS NOT NULL GROUP BY technology_id) as report_counts`,
        eq(technology.id, sql`report_counts.technology_id`),
      )
      .where(
        and(
          eq(technology.organizationId, orgResult.id),
          eq(technology.status, 'approved'),
        ),
      )
      .orderBy(desc(technology.createdAt))

    // Get unique capabilities through technologies
    const capabilities = await db
      .select({
        id: capability.id,
        name: capability.name,
        slug: capability.slug,
        icon: capability.icon,
      })
      .from(capability)
      .innerJoin(
        capabilitySubtype,
        eq(capability.id, capabilitySubtype.capabilityId),
      )
      .innerJoin(
        technologyCapabilitySubtype,
        eq(
          capabilitySubtype.id,
          technologyCapabilitySubtype.capabilitySubtypeId,
        ),
      )
      .innerJoin(
        technology,
        eq(technologyCapabilitySubtype.technologyId, technology.id),
      )
      .where(eq(technology.organizationId, orgResult.id))
      .groupBy(capability.id, capability.name, capability.slug, capability.icon)

    return {
      id: orgResult.id,
      slug: orgResult.slug,
      name: orgResult.name,
      types: orgResult.types,
      description: orgResult.description,
      website: orgResult.website,
      logo: orgResult.logo,
      foundedYear: orgResult.foundedYear,
      isSponsor: orgResult.isSponsor,
      sponsorTier: orgResult.sponsorTier,
      isClaimed: orgResult.isClaimed,
      verifiedBadge: orgResult.verifiedBadge,
      createdAt: orgResult.createdAt,
      updatedAt: orgResult.updatedAt,
      _count: {
        technologies: orgResult.techCount,
        reports: orgResult.reportCount,
      },
      technologies: technologies.map((t) => ({
        id: t.id,
        slug: t.slug,
        name: t.name,
        type: t.type,
        stage: t.stage,
        _count: { reports: t.reportCount },
      })),
      capabilities,
    }
  } catch (error) {
    console.error('Error fetching organization by slug:', error)
    return null
  }
}

/**
 * Get sponsors by tier
 */
export async function getSponsorOrganizations(tier: SponsorTier) {
  const db = dbClient()
  try {
    const results = await db
      .select({
        id: organization.id,
        slug: organization.slug,
        name: organization.name,
        logo: organization.logo,
        types: organization.types,
        description: organization.description,
        sponsorTier: organization.sponsorTier,
        techCount: sql<number>`COALESCE(tech_counts.count, 0)`,
        reportCount: sql<number>`COALESCE(report_counts.count, 0)`,
      })
      .from(organization)
      .leftJoin(
        sql`(SELECT organization_id, COUNT(*) as count FROM technology WHERE status = 'approved' GROUP BY organization_id) as tech_counts`,
        eq(organization.id, sql`tech_counts.organization_id`),
      )
      .leftJoin(
        sql`(SELECT o.id as organization_id, COUNT(*) as count FROM impact_report ir JOIN technology t ON ir.technology_id = t.id JOIN organization o ON t.organization_id = o.id WHERE ir.technology_id IS NOT NULL GROUP BY o.id) as report_counts`,
        eq(organization.id, sql`report_counts.organization_id`),
      )
      .where(
        and(
          eq(organization.sponsorTier, tier),
          eq(organization.isSponsor, true),
        ),
      )

    return results.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      types: r.types,
      description: r.description,
      logo: r.logo,
      website: null as string | null,
      foundedYear: null as number | null,
      isSponsor: true,
      sponsorTier: r.sponsorTier,
      isClaimed: false,
      verifiedBadge: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      _count: {
        technologies: r.techCount,
        reports: r.reportCount,
      },
    })) as Array<OrganizationWithStats>
  } catch (error) {
    console.error('Error fetching sponsor organizations:', error)
    return []
  }
}

/**
 * Get report breakdown by impact type for an organization
 */
export async function getOrganizationReportBreakdown(
  organizationId: string,
): Promise<Array<ReportBreakdown>> {
  const db = dbClient()
  try {
    // Get all reports for technologies belonging to this organization
    const results = await db
      .select({
        impactType: impactReport.impactType,
        count: count(),
      })
      .from(impactReport)
      .innerJoin(technology, eq(impactReport.technologyId, technology.id))
      .where(eq(technology.organizationId, organizationId))
      .groupBy(impactReport.impactType)

    // Calculate total for percentages
    const total = results.reduce((sum, r) => sum + r.count, 0)

    return results.map((r) => ({
      impactType: r.impactType,
      count: r.count,
      percentage: total > 0 ? Math.round((r.count / total) * 100) : 0,
    }))
  } catch (error) {
    console.error('Error fetching organization report breakdown:', error)
    return []
  }
}

/**
 * Get all sponsors grouped by tier
 */
export async function getAllSponsors() {
  const [gold, silver, bronze] = await Promise.all([
    getSponsorOrganizations('gold'),
    getSponsorOrganizations('silver'),
    getSponsorOrganizations('bronze'),
  ])

  return { gold, silver, bronze }
}

/**
 * Get organization types
 */
export function getOrganizationTypes() {
  return [
    'ai_lab',
    'robotics',
    'enterprise_software',
    'startup',
    'research_institution',
  ] as const
}

/**
 * Get sponsor tiers
 */
export function getSponsorTiers() {
  return ['none', 'bronze', 'silver', 'gold'] as const
}

// ============================================
// ADMIN FUNCTIONS
// ============================================

/**
 * Get organization by ID for admin
 */
export async function getOrganizationById(id: string) {
  const db = dbClient()
  try {
    const results = await db
      .select()
      .from(organization)
      .where(eq(organization.id, id))
      .limit(1)

    return results[0] ?? null
  } catch (error) {
    console.error('Error fetching organization by ID:', error)
    return null
  }
}

/**
 * Create a new organization
 */
export async function createOrganization(data: {
  name: string
  slug: string
  types: Array<OrganizationType>
  description: string
  website?: string
  logo?: string
  foundedYear?: number
  isSponsor?: boolean
  sponsorTier?: SponsorTier
  isClaimed?: boolean
  verifiedBadge?: boolean
}) {
  const db = dbClient()
  try {
    const id = crypto.randomUUID()

    const [result] = await db
      .insert(organization)
      .values({
        id,
        slug: data.slug,
        name: data.name,
        types: data.types,
        description: data.description,
        website: data.website || null,
        logo: data.logo || null,
        foundedYear: data.foundedYear || null,
        isSponsor: data.isSponsor || false,
        sponsorTier: data.sponsorTier || 'none',
        isClaimed: data.isClaimed || false,
        verifiedBadge: data.verifiedBadge || false,
      })
      .returning()

    return result
  } catch (error) {
    console.error('Error creating organization:', error)
    throw error
  }
}

/**
 * Update an existing organization
 */
export async function updateOrganization(data: {
  id: string
  name?: string
  slug?: string
  types?: Array<OrganizationType>
  description?: string
  website?: string
  logo?: string
  foundedYear?: number
  isSponsor?: boolean
  sponsorTier?: SponsorTier
  isClaimed?: boolean
  verifiedBadge?: boolean
}) {
  const db = dbClient()
  try {
    const updateData: Record<string, unknown> = {}

    if (data.name !== undefined) updateData.name = data.name
    if (data.slug !== undefined) updateData.slug = data.slug
    if (data.types !== undefined) updateData.types = data.types
    if (data.description !== undefined)
      updateData.description = data.description
    if (data.website !== undefined) updateData.website = data.website
    if (data.logo !== undefined) updateData.logo = data.logo
    if (data.foundedYear !== undefined)
      updateData.foundedYear = data.foundedYear
    if (data.isSponsor !== undefined) updateData.isSponsor = data.isSponsor
    if (data.sponsorTier !== undefined)
      updateData.sponsorTier = data.sponsorTier
    if (data.isClaimed !== undefined) updateData.isClaimed = data.isClaimed
    if (data.verifiedBadge !== undefined)
      updateData.verifiedBadge = data.verifiedBadge

    const [result] = await db
      .update(organization)
      .set(updateData)
      .where(eq(organization.id, data.id))
      .returning()

    return result
  } catch (error) {
    console.error('Error updating organization:', error)
    throw error
  }
}

/**
 * Delete an organization
 */
export async function deleteOrganization(id: string) {
  const db = dbClient()
  try {
    await db.delete(organization).where(eq(organization.id, id))
  } catch (error) {
    console.error('Error deleting organization:', error)
    throw error
  }
}
