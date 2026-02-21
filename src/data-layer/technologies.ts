import { and, asc, count, desc, eq, ilike, or, sql } from 'drizzle-orm'

import type {
  SubmissionStatus,
  TechnologyStage,
  TechnologyType,
} from '@/db/schema/technologies'
import { db } from '@/db'
import {
  capabilitySubtype,
  impactReport,
  organization,
  technology,
  technologyCapabilitySubtype,
} from '@/db/schema'

// ============================================
// TYPES
// ============================================

export interface TechnologyFilters {
  type?: TechnologyType
  stage?: TechnologyStage
  status?: SubmissionStatus
  search?: string
  sortBy?: 'name' | 'newest' | 'oldest' | 'most_reports'
}

export interface TechnologyWithOrg {
  id: string
  slug: string
  name: string
  type: TechnologyType
  description: string
  image: string | null
  website: string | null
  organizationId: string
  stage: TechnologyStage
  releaseDate: Date | null
  status: SubmissionStatus
  createdAt: Date
  updatedAt: Date
  organization: {
    id: string
    slug: string
    name: string
    logo: string | null
    types: Array<string>
    sponsorTier: 'none' | 'bronze' | 'silver' | 'gold'
    isSponsor: boolean
    verifiedBadge: boolean
    website?: string | null
    description?: string
    foundedYear?: number | null
  }
  _count: {
    reports: number
  }
}

export interface TechnologyDetail extends TechnologyWithOrg {
  capabilities: Array<{
    id: string
    name: string
    slug: string
    performanceScore: number | null
    status: string
  }>
  similarTechnologies: Array<TechnologyWithOrg>
}

export interface ReportBreakdown {
  impactType: string
  count: number
}

// ============================================
// QUERIES
// ============================================

/**
 * Get all technologies with optional filters
 */
export async function getAllTechnologies(filters: TechnologyFilters = {}) {
  const { type, stage, status, search, sortBy = 'newest' } = filters

  const conditions = []

  if (type) {
    conditions.push(eq(technology.type, type))
  }

  if (stage) {
    conditions.push(eq(technology.stage, stage))
  }

  if (status) {
    conditions.push(eq(technology.status, status))
  }

  if (search) {
    conditions.push(
      or(
        ilike(technology.name, `%${search}%`),
        ilike(technology.description, `%${search}%`),
      ),
    )
  }

  const orderBy =
    sortBy === 'name'
      ? asc(technology.name)
      : sortBy === 'oldest'
        ? asc(technology.createdAt)
        : sortBy === 'newest'
          ? desc(technology.createdAt)
          : desc(sql`report_count`)

  try {
    const results = await db
      .select({
        id: technology.id,
        slug: technology.slug,
        name: technology.name,
        type: technology.type,
        description: technology.description,
        image: technology.image,
        website: technology.website,
        organizationId: technology.organizationId,
        stage: technology.stage,
        releaseDate: technology.releaseDate,
        status: technology.status,
        createdAt: technology.createdAt,
        updatedAt: technology.updatedAt,
        organization: {
          id: organization.id,
          slug: organization.slug,
          name: organization.name,
          logo: organization.logo,
          types: sql<
            Array<string>
          >`COALESCE(${organization.types}, ARRAY[]::varchar[])`,
          sponsorTier: sql<
            'none' | 'bronze' | 'silver' | 'gold'
          >`COALESCE(${organization.sponsorTier}, 'none')`,
          isSponsor: sql<boolean>`COALESCE(${organization.isSponsor}, false)`,
          verifiedBadge: sql<boolean>`COALESCE(${organization.verifiedBadge}, false)`,
        },
        reportCount: sql<number>`COALESCE(report_counts.count, 0)`,
      })
      .from(technology)
      .leftJoin(organization, eq(technology.organizationId, organization.id))
      .leftJoin(
        sql`(SELECT technology_id, COUNT(*) as count FROM impact_report WHERE technology_id IS NOT NULL GROUP BY technology_id) as report_counts`,
        eq(technology.id, sql`report_counts.technology_id`),
      )
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(orderBy)

    return results.map((r) => ({
      ...r,
      _count: { reports: r.reportCount },
    })) as Array<TechnologyWithOrg>
  } catch (error) {
    console.error('Error fetching technologies:', error)
    return []
  }
}

/**
 * Get technology by slug with full details
 */
export async function getTechnologyBySlug(
  slug: string,
): Promise<TechnologyDetail | null> {
  try {
    // Get technology with organization
    const techResults = await db
      .select({
        id: technology.id,
        slug: technology.slug,
        name: technology.name,
        type: technology.type,
        description: technology.description,
        image: technology.image,
        website: technology.website,
        organizationId: technology.organizationId,
        stage: technology.stage,
        releaseDate: technology.releaseDate,
        status: technology.status,
        createdAt: technology.createdAt,
        updatedAt: technology.updatedAt,
        orgId: organization.id,
        orgSlug: organization.slug,
        orgName: organization.name,
        orgLogo: organization.logo,
        orgWebsite: organization.website,
        orgDescription: organization.description,
        orgTypes: sql<
          Array<string>
        >`COALESCE(${organization.types}, ARRAY[]::varchar[])`,
        orgSponsorTier: sql<
          'none' | 'bronze' | 'silver' | 'gold'
        >`COALESCE(${organization.sponsorTier}, 'none')`,
        orgIsSponsor: sql<boolean>`COALESCE(${organization.isSponsor}, false)`,
        orgVerifiedBadge: sql<boolean>`COALESCE(${organization.verifiedBadge}, false)`,
        orgFoundedYear: organization.foundedYear,
        reportCount: sql<number>`COALESCE(report_counts.count, 0)`,
      })
      .from(technology)
      .innerJoin(organization, eq(technology.organizationId, organization.id))
      .leftJoin(
        sql`(SELECT technology_id, COUNT(*) as count FROM impact_report WHERE technology_id IS NOT NULL GROUP BY technology_id) as report_counts`,
        eq(technology.id, sql`report_counts.technology_id`),
      )
      .where(eq(technology.slug, slug))
      .limit(1)

    if (techResults.length === 0) {
      return null
    }

    const techResult = techResults[0]

    // Get capabilities with performance scores
    const capabilities = await db
      .select({
        id: capabilitySubtype.id,
        name: capabilitySubtype.name,
        slug: capabilitySubtype.slug,
        performanceScore: technologyCapabilitySubtype.performanceScore,
        status: capabilitySubtype.status,
      })
      .from(technologyCapabilitySubtype)
      .innerJoin(
        capabilitySubtype,
        eq(
          technologyCapabilitySubtype.capabilitySubtypeId,
          capabilitySubtype.id,
        ),
      )
      .where(eq(technologyCapabilitySubtype.technologyId, techResult.id))

    // Get similar technologies (same type, different id)
    const similarResults = await db
      .select({
        id: technology.id,
        slug: technology.slug,
        name: technology.name,
        type: technology.type,
        description: technology.description,
        image: technology.image,
        website: technology.website,
        organizationId: technology.organizationId,
        stage: technology.stage,
        releaseDate: technology.releaseDate,
        status: technology.status,
        createdAt: technology.createdAt,
        updatedAt: technology.updatedAt,
        orgId: organization.id,
        orgSlug: organization.slug,
        orgName: organization.name,
        orgLogo: organization.logo,
        orgTypes: sql<
          Array<string>
        >`COALESCE(${organization.types}, ARRAY[]::varchar[])`,
        orgSponsorTier: sql<
          'none' | 'bronze' | 'silver' | 'gold'
        >`COALESCE(${organization.sponsorTier}, 'none')`,
        orgIsSponsor: sql<boolean>`COALESCE(${organization.isSponsor}, false)`,
        orgVerifiedBadge: sql<boolean>`COALESCE(${organization.verifiedBadge}, false)`,
        reportCount: sql<number>`COALESCE(report_counts.count, 0)`,
      })
      .from(technology)
      .leftJoin(organization, eq(technology.organizationId, organization.id))
      .leftJoin(
        sql`(SELECT technology_id, COUNT(*) as count FROM impact_report WHERE technology_id IS NOT NULL GROUP BY technology_id) as report_counts`,
        eq(technology.id, sql`report_counts.technology_id`),
      )
      .where(
        and(
          eq(technology.type, techResult.type),
          sql`${technology.id} != ${techResult.id}`,
          eq(technology.status, 'approved'),
        ),
      )
      .limit(3)

    const similarTechs = similarResults
      .filter((r) => r.orgId !== null)
      .map((r) => ({
        id: r.id,
        slug: r.slug,
        name: r.name,
        type: r.type,
        description: r.description,
        image: r.image,
        website: r.website,
        organizationId: r.organizationId,
        stage: r.stage,
        releaseDate: r.releaseDate,
        status: r.status,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        organization: {
          id: r.orgId!,
          slug: r.orgSlug!,
          name: r.orgName!,
          logo: r.orgLogo,
          types: (r.orgTypes as any) || [],
          sponsorTier: r.orgSponsorTier as any,
          isSponsor: r.orgIsSponsor as any,
          verifiedBadge: r.orgVerifiedBadge as any,
        },
        _count: { reports: r.reportCount },
      }))

    return {
      id: techResult.id,
      slug: techResult.slug,
      name: techResult.name,
      type: techResult.type,
      description: techResult.description,
      image: techResult.image,
      website: techResult.website,
      organizationId: techResult.organizationId,
      stage: techResult.stage,
      releaseDate: techResult.releaseDate,
      status: techResult.status,
      createdAt: techResult.createdAt,
      updatedAt: techResult.updatedAt,
      organization: {
        id: techResult.orgId,
        slug: techResult.orgSlug,
        name: techResult.orgName,
        logo: techResult.orgLogo,
        website: techResult.orgWebsite,
        description: techResult.orgDescription,
        types: techResult.orgTypes as any,
        sponsorTier: techResult.orgSponsorTier as any,
        isSponsor: techResult.orgIsSponsor as any,
        verifiedBadge: techResult.orgVerifiedBadge as any,
        foundedYear: techResult.orgFoundedYear,
      },
      _count: { reports: techResult.reportCount },
      capabilities,
      similarTechnologies: similarTechs,
    }
  } catch (error) {
    console.error('Error fetching technology by slug:', error)
    return null
  }
}

/**
 * Get technologies by organization
 */
export async function getTechnologiesByOrganization(organizationId: string) {
  try {
    const results = await db
      .select({
        id: technology.id,
        slug: technology.slug,
        name: technology.name,
        type: technology.type,
        description: technology.description,
        image: technology.image,
        website: technology.website,
        organizationId: technology.organizationId,
        stage: technology.stage,
        releaseDate: technology.releaseDate,
        status: technology.status,
        createdAt: technology.createdAt,
        updatedAt: technology.updatedAt,
        reportCount: sql<number>`COALESCE(report_counts.count, 0)`,
      })
      .from(technology)
      .leftJoin(
        sql`(SELECT technology_id, COUNT(*) as count FROM impact_report WHERE technology_id IS NOT NULL GROUP BY technology_id) as report_counts`,
        eq(technology.id, sql`report_counts.technology_id`),
      )
      .where(
        and(
          eq(technology.organizationId, organizationId),
          eq(technology.status, 'approved'),
        ),
      )
      .orderBy(desc(technology.createdAt))

    return results.map((r) => ({
      ...r,
      _count: { reports: r.reportCount },
    }))
  } catch (error) {
    console.error('Error fetching technologies by organization:', error)
    return []
  }
}

/**
 * Get report count for a specific technology
 */
export async function getTechnologyReportCount(technologyId: string) {
  try {
    const result = await db
      .select({
        count: count(),
      })
      .from(impactReport)
      .where(eq(impactReport.technologyId, technologyId))
      .limit(1)

    return result[0]?.count ?? 0
  } catch (error) {
    console.error('Error fetching technology report count:', error)
    return 0
  }
}

/**
 * Get report breakdown by impact type for a technology
 */
export async function getTechnologyReportBreakdown(
  technologyId: string,
): Promise<Array<ReportBreakdown>> {
  try {
    const results = await db
      .select({
        impactType: impactReport.impactType,
        count: count(),
      })
      .from(impactReport)
      .where(eq(impactReport.technologyId, technologyId))
      .groupBy(impactReport.impactType)

    return results.map((r) => ({
      impactType: r.impactType,
      count: r.count,
    }))
  } catch (error) {
    console.error('Error fetching technology report breakdown:', error)
    return []
  }
}

/**
 * Get all technology types
 */
export function getTechnologyTypes() {
  return ['ai_model', 'robot', 'software', 'hardware', 'api'] as const
}

/**
 * Get all technology stages
 */
export function getTechnologyStages() {
  return ['research', 'pilot', 'deployed', 'discontinued'] as const
}
