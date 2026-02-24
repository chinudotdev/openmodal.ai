import { and, desc, eq, or, sql } from 'drizzle-orm'

import { db } from '@/db'
import {
  capabilitySubtype,
  impactReport,
  job,
  reportEnrichment,
  reportFlag,
  task,
  technology,
  user,
} from '@/db/schema'

// ============================================
// TYPES
// ============================================

export type ReportFilters = {
  impactType?: string
  country?: string
  companySize?: string
  searchTerm?: string
  featured?: boolean
  status?: 'published' | 'flagged' | 'removed'
}

export type ReportSortOption = 'recent' | 'upvotes' | 'views'

export type ReportWithEnrichments = {
  id: string
  jobTitle: string
  description: string
  impactType: string
  title: string | null
  location: string | null
  country: string | null
  companyName: string | null
  companySize: string | null
  technologyDescription: string | null
  workersAffectedCount: number | null
  eventDate: Date | null
  sourceUrl: string | null
  technologyId: string | null
  submittedBy: string
  isAnonymous: boolean
  reporterRelationship: string | null
  status: string
  upvotes: number
  viewCount: number
  isFeatured: boolean
  createdAt: Date
  updatedAt: Date
  // Joined fields
  submitter?: {
    id: string
    name: string | null
    username: string
    email: string | null
  } | null
  technology?: {
    id: string
    name: string
    slug: string
    type: string
  } | null
  enrichments?: Array<{
    id: string
    enrichmentType: string
    linkedEntityId: string | null
    suggestedName: string | null
    confidence: string
    notes: string | null
    upvotes: number
    downvotes: number
    createdAt: Date
    user?: {
      id: string
      username: string
      reputation?: number
    } | null
  }>
  _enrichmentCount?: number
  _flagCount?: number
}

// ============================================
// QUERIES
// ============================================

/**
 * Get reports with filters, sorting, and pagination
 */
export async function getReports(options: {
  filters?: ReportFilters
  sort?: ReportSortOption
  limit?: number
  offset?: number
}) {
  const { filters = {}, sort = 'recent', limit = 20, offset = 0 } = options

  // Build where conditions
  const conditions = []

  // Only show published reports by default
  if (filters.status) {
    conditions.push(eq(impactReport.status, filters.status))
  } else {
    conditions.push(eq(impactReport.status, 'published'))
  }

  // Featured filter
  if (filters.featured) {
    conditions.push(eq(impactReport.isFeatured, true))
  }

  // Impact type filter
  if (filters.impactType) {
    conditions.push(eq(impactReport.impactType, filters.impactType as any))
  }

  // Country filter
  if (filters.country) {
    conditions.push(eq(impactReport.country, filters.country))
  }

  // Company size filter
  if (filters.companySize) {
    conditions.push(eq(impactReport.companySize, filters.companySize as any))
  }

  // Search term (search in title, job title, company name, description)
  if (filters.searchTerm) {
    const searchPattern = `%${filters.searchTerm}%`
    conditions.push(
      or(
        sql`${impactReport.title} ILIKE ${searchPattern}`,
        sql`${impactReport.jobTitle} ILIKE ${searchPattern}`,
        sql`${impactReport.companyName} ILIKE ${searchPattern}`,
        sql`${impactReport.description} ILIKE ${searchPattern}`,
      ),
    )
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  // Build order by
  let orderByClause
  switch (sort) {
    case 'upvotes':
      orderByClause = [desc(impactReport.upvotes), desc(impactReport.createdAt)]
      break
    case 'views':
      orderByClause = [
        desc(impactReport.viewCount),
        desc(impactReport.createdAt),
      ]
      break
    case 'recent':
    default:
      orderByClause = [desc(impactReport.createdAt)]
      break
  }

  // Get total count
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(impactReport)
    .where(whereClause)

  // Get reports with submitter info
  const reports = await db
    .select({
      id: impactReport.id,
      jobTitle: impactReport.jobTitle,
      description: impactReport.description,
      impactType: impactReport.impactType,
      title: impactReport.title,
      location: impactReport.location,
      country: impactReport.country,
      companyName: impactReport.companyName,
      companySize: impactReport.companySize,
      technologyDescription: impactReport.technologyDescription,
      workersAffectedCount: impactReport.workersAffectedCount,
      eventDate: impactReport.eventDate,
      sourceUrl: impactReport.sourceUrl,
      technologyId: impactReport.technologyId,
      submittedBy: impactReport.submittedBy,
      isAnonymous: impactReport.isAnonymous,
      reporterRelationship: impactReport.reporterRelationship,
      status: impactReport.status,
      upvotes: impactReport.upvotes,
      viewCount: impactReport.viewCount,
      isFeatured: impactReport.isFeatured,
      createdAt: impactReport.createdAt,
      updatedAt: impactReport.updatedAt,
      // Submitter
      submitter: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
      // Technology
      technology: {
        id: technology.id,
        name: technology.name,
        slug: technology.slug,
        type: technology.type,
      },
    })
    .from(impactReport)
    .leftJoin(user, eq(impactReport.submittedBy, user.id))
    .leftJoin(technology, eq(impactReport.technologyId, technology.id))
    .where(whereClause)
    .orderBy(...orderByClause)
    .limit(limit)
    .offset(offset)

  return {
    reports: reports as Array<ReportWithEnrichments>,
    totalCount: Number(count || 0),
    hasMore: offset + limit < Number(count || 0),
  }
}

/**
 * Get a single report by ID with enrichments and flag count
 */
export async function getReportById(
  reportId: string,
): Promise<ReportWithEnrichments | null> {
  const results = await db
    .select({
      id: impactReport.id,
      jobTitle: impactReport.jobTitle,
      description: impactReport.description,
      impactType: impactReport.impactType,
      title: impactReport.title,
      location: impactReport.location,
      country: impactReport.country,
      companyName: impactReport.companyName,
      companySize: impactReport.companySize,
      technologyDescription: impactReport.technologyDescription,
      workersAffectedCount: impactReport.workersAffectedCount,
      eventDate: impactReport.eventDate,
      sourceUrl: impactReport.sourceUrl,
      technologyId: impactReport.technologyId,
      submittedBy: impactReport.submittedBy,
      isAnonymous: impactReport.isAnonymous,
      reporterRelationship: impactReport.reporterRelationship,
      status: impactReport.status,
      upvotes: impactReport.upvotes,
      viewCount: impactReport.viewCount,
      isFeatured: impactReport.isFeatured,
      createdAt: impactReport.createdAt,
      updatedAt: impactReport.updatedAt,
      submitter: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
      technology: {
        id: technology.id,
        name: technology.name,
        slug: technology.slug,
        type: technology.type,
      },
    })
    .from(impactReport)
    .leftJoin(user, eq(impactReport.submittedBy, user.id))
    .leftJoin(technology, eq(impactReport.technologyId, technology.id))
    .where(eq(impactReport.id, reportId))
    .limit(1)

  const report = results[0]
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!report) {
    return null
  }

  // Get enrichments with user info
  const enrichments = await db
    .select({
      id: reportEnrichment.id,
      enrichmentType: reportEnrichment.enrichmentType,
      linkedEntityId: reportEnrichment.linkedEntityId,
      suggestedName: reportEnrichment.suggestedName,
      confidence: reportEnrichment.confidence,
      notes: reportEnrichment.notes,
      upvotes: reportEnrichment.upvotes,
      downvotes: reportEnrichment.downvotes,
      createdAt: reportEnrichment.createdAt,
      user: {
        id: user.id,
        username: user.username,
      },
    })
    .from(reportEnrichment)
    .leftJoin(user, eq(reportEnrichment.userId, user.id))
    .where(eq(reportEnrichment.reportId, reportId))
    .orderBy(desc(reportEnrichment.upvotes))

  // Get flag count
  const [{ count: flagCount }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(reportFlag)
    .where(eq(reportFlag.reportId, reportId))

  return {
    ...report,
    enrichments,
    _enrichmentCount: enrichments.length,
    _flagCount: flagCount,
  } as ReportWithEnrichments
}

/**
 * Get reports by user ID
 */
export async function getReportsByUserId(userId: string, limit = 10) {
  const reports = await db
    .select({
      id: impactReport.id,
      jobTitle: impactReport.jobTitle,
      description: impactReport.description,
      impactType: impactReport.impactType,
      title: impactReport.title,
      location: impactReport.location,
      country: impactReport.country,
      companyName: impactReport.companyName,
      companySize: impactReport.companySize,
      technologyDescription: impactReport.technologyDescription,
      workersAffectedCount: impactReport.workersAffectedCount,
      eventDate: impactReport.eventDate,
      sourceUrl: impactReport.sourceUrl,
      technologyId: impactReport.technologyId,
      submittedBy: impactReport.submittedBy,
      isAnonymous: impactReport.isAnonymous,
      reporterRelationship: impactReport.reporterRelationship,
      status: impactReport.status,
      upvotes: impactReport.upvotes,
      viewCount: impactReport.viewCount,
      isFeatured: impactReport.isFeatured,
      createdAt: impactReport.createdAt,
      updatedAt: impactReport.updatedAt,
    })
    .from(impactReport)
    .where(eq(impactReport.submittedBy, userId))
    .orderBy(desc(impactReport.createdAt))
    .limit(limit)

  return reports as Array<ReportWithEnrichments>
}

/**
 * Get featured reports for homepage
 */
export async function getFeaturedReports(limit = 6) {
  return getReports({
    filters: { featured: true, status: 'published' },
    sort: 'upvotes',
    limit,
  })
}

/**
 * Increment view count for a report
 */
export async function incrementReportViewCount(reportId: string) {
  await db
    .update(impactReport)
    .set({
      viewCount: sql`${impactReport.viewCount} + 1`,
    })
    .where(eq(impactReport.id, reportId))
}

/**
 * Check if user has already flagged a report
 */
export async function hasUserFlaggedReport(
  reportId: string,
  userId: string,
): Promise<boolean> {
  const [flag] = await db
    .select()
    .from(reportFlag)
    .where(
      and(eq(reportFlag.reportId, reportId), eq(reportFlag.userId, userId)),
    )
    .limit(1)

  return !!flag
}

/**
 * Get flag count for a report
 */
export async function getReportFlagCount(reportId: string): Promise<number> {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(reportFlag)
    .where(eq(reportFlag.reportId, reportId))

  return count
}

/**
 * Get enrichments for a report with linked entity details
 */
export async function getReportEnrichmentsWithDetails(reportId: string) {
  const enrichments = await db
    .select({
      id: reportEnrichment.id,
      enrichmentType: reportEnrichment.enrichmentType,
      linkedEntityId: reportEnrichment.linkedEntityId,
      suggestedName: reportEnrichment.suggestedName,
      confidence: reportEnrichment.confidence,
      notes: reportEnrichment.notes,
      upvotes: reportEnrichment.upvotes,
      downvotes: reportEnrichment.downvotes,
      createdAt: reportEnrichment.createdAt,
      userId: reportEnrichment.userId,
    })
    .from(reportEnrichment)
    .where(eq(reportEnrichment.reportId, reportId))
    .orderBy(desc(reportEnrichment.upvotes))

  // For each enrichment, fetch the linked entity details if available
  const enrichedDetails = await Promise.all(
    enrichments.map(async (enrichment) => {
      let linkedEntity = null

      if (enrichment.linkedEntityId) {
        switch (enrichment.enrichmentType) {
          case 'job_link':
            ;[linkedEntity] = await db
              .select({
                id: job.id,
                title: job.name, // job.name is used as title
                slug: job.slug,
              })
              .from(job)
              .where(eq(job.id, enrichment.linkedEntityId))
              .limit(1)
            break
          case 'technology_link':
            ;[linkedEntity] = await db
              .select({
                id: technology.id,
                name: technology.name,
                slug: technology.slug,
                type: technology.type,
              })
              .from(technology)
              .where(eq(technology.id, enrichment.linkedEntityId))
              .limit(1)
            break
          case 'task_link':
            ;[linkedEntity] = await db
              .select({
                id: task.id,
                name: task.name,
              })
              .from(task)
              .where(eq(task.id, enrichment.linkedEntityId))
              .limit(1)
            break
          case 'capability_subtype_link':
            ;[linkedEntity] = await db
              .select({
                id: capabilitySubtype.id,
                name: capabilitySubtype.name,
                slug: capabilitySubtype.slug,
              })
              .from(capabilitySubtype)
              .where(eq(capabilitySubtype.id, enrichment.linkedEntityId))
              .limit(1)
            break
        }
      }

      return {
        ...enrichment,
        linkedEntity,
      }
    }),
  )

  return enrichedDetails
}

/**
 * Get report stats for admin/moderator dashboard
 */
export async function getReportStats() {
  const [
    [{ count: totalReports }],
    [{ count: publishedReports }],
    [{ count: flaggedReports }],
    [{ count: removedReports }],
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(impactReport),
    db
      .select({ count: sql<number>`count(*)` })
      .from(impactReport)
      .where(eq(impactReport.status, 'published')),
    db
      .select({ count: sql<number>`count(*)` })
      .from(impactReport)
      .where(eq(impactReport.status, 'flagged')),
    db
      .select({ count: sql<number>`count(*)` })
      .from(impactReport)
      .where(eq(impactReport.status, 'removed')),
  ])

  return {
    total: totalReports,
    published: publishedReports,
    flagged: flaggedReports,
    removed: removedReports,
  }
}

/**
 * Get reports that need moderation (flagged reports)
 */
export async function getFlaggedReports(limit = 50) {
  return getReports({
    filters: { status: 'flagged' },
    sort: 'recent',
    limit,
  })
}
