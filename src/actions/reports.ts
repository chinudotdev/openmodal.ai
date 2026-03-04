import { createServerFn } from '@tanstack/react-start'

import { eq, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { z } from 'zod'

import {
  getFeaturedReports,
  getFlaggedReports,
  getReportById,
  getReportEnrichmentsWithDetails,
  getReportFlagCount,
  getReportStats,
  getReports,
  getReportsByUserId,
  hasUserFlaggedReport,
  incrementReportViewCount,
} from '@/data-layer/reports'
import { dbClient } from '@/db'
import { impactReport, reportEnrichment, reportFlag } from '@/db/schema'
import { authMiddleware, rateLimitMiddleware } from '@/middleware/server'

// ============================================
// TYPES & VALIDATION
// ============================================

export const reportFiltersSchema = z.object({
  impactType: z
    .enum([
      'layoffs',
      'reduced_hours',
      'role_change',
      'new_tools',
      'productivity_boost',
      'no_change',
    ])
    .optional(),
  country: z.string().optional(),
  companySize: z
    .enum(['1-10', '11-50', '51-200', '201-1000', '1000+'])
    .optional(),
  searchTerm: z.string().optional(),
  featured: z.boolean().optional(),
})

export const submitReportSchema = z.object({
  // Required fields
  jobTitle: z.string().min(2, 'Job title is required'),
  description: z
    .string()
    .min(100, 'Description must be at least 100 characters'),
  impactType: z.enum([
    'layoffs',
    'reduced_hours',
    'role_change',
    'new_tools',
    'productivity_boost',
    'no_change',
  ]),

  // Optional fields
  title: z.string().max(200).optional(),
  location: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  companyName: z.string().max(100).optional(),
  companySize: z
    .enum(['1-10', '11-50', '51-200', '201-1000', '1000+'])
    .optional(),
  technologyDescription: z.string().max(500).optional(),
  workersAffectedCount: z.number().int().positive().optional(),
  eventDate: z.string().datetime().optional(),
  sourceUrl: z.url().optional().or(z.literal('')),
  technologyId: z.string().optional(),
  isAnonymous: z.boolean().default(false),
  reporterRelationship: z
    .enum([
      'employee',
      'former_employee',
      'manager',
      'witness',
      'news',
      'researcher',
    ])
    .optional(),
})

export const enrichmentSchema = z.object({
  reportId: z.string(),
  enrichmentType: z.enum([
    'job_link',
    'technology_link',
    'task_link',
    'capability_subtype_link',
  ]),
  linkedEntityId: z.string().optional(),
  suggestedName: z.string().optional(),
  confidence: z.enum(['certain', 'likely', 'guess']),
  notes: z.string().max(500).optional(),
})

export const flagReportSchema = z.object({
  reportId: z.string(),
  reason: z.enum(['spam', 'fake', 'duplicate', 'inappropriate', 'other']),
  notes: z.string().max(500).optional(),
})

export const voteEnrichmentSchema = z.object({
  enrichmentId: z.string(),
  voteType: z.enum(['upvote', 'downvote']),
})

export const voteReportSchema = z.object({
  reportId: z.string(),
  voteType: z.enum(['upvote', 'downvote']),
})

// ============================================
// PUBLIC SERVER FUNCTIONS (No Auth Required)
// ============================================

/**
 * Get reports with filters, sorting, and pagination
 */
export const getReportsFn = createServerFn({ method: 'GET' })
  .inputValidator(
    reportFiltersSchema.extend({
      sort: z.enum(['recent', 'upvotes', 'views']).default('recent'),
      limit: z.number().int().positive().max(100).default(20),
      offset: z.number().int().nonnegative().default(0),
    }),
  )
  .handler(async ({ data }) => {
    const reports = await getReports({
      filters: data,
      sort: data.sort,
      limit: data.limit,
      offset: data.offset,
    })
    return { success: true, ...reports }
  })

/**
 * Get a single report by ID with enrichments
 * Increments view count
 */
export const getReportByIdFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      id: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const report = await getReportById(data.id)
    if (!report) {
      return { success: false, error: 'Report not found' }
    }

    // Increment view count (fire and forget)
    incrementReportViewCount(data.id).catch(console.error)

    return { success: true, report }
  })

/**
 * Get featured reports for homepage
 */
export const getFeaturedReportsFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      limit: z.number().int().positive().max(50).default(6),
    }),
  )
  .handler(async ({ data }) => {
    const result = await getFeaturedReports(data.limit)
    return { success: true, reports: result.reports }
  })

/**
 * Get report enrichments with linked entity details
 */
export const getReportEnrichmentsFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      reportId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const enrichments = await getReportEnrichmentsWithDetails(data.reportId)
    return { success: true, enrichments }
  })

// ============================================
// AUTHENTICATED SERVER FUNCTIONS
// ============================================

/**
 * Submit a new impact report
 * Requires authentication and rate limiting
 */
export const submitReportFn = createServerFn({ method: 'POST' })
  .middleware([
    authMiddleware,
    rateLimitMiddleware({ max: 5, window: 3600 }), // 5 reports per hour
  ])
  .inputValidator(submitReportSchema)
  .handler(async ({ data, context }) => {
    const userId = context.user.id

    // Parse event date if provided
    const parsedEventDate = data.eventDate ? new Date(data.eventDate) : null

    // Create the report
    const db = await dbClient()
    const [newReport] = await db
      .insert(impactReport)
      .values({
        id: nanoid(),
        // Required
        jobTitle: data.jobTitle,
        description: data.description,
        impactType: data.impactType,
        // Optional
        title: data.title || null,
        location: data.location || null,
        country: data.country || null,
        companyName: data.companyName || null,
        companySize: data.companySize || null,
        technologyDescription: data.technologyDescription || null,
        workersAffectedCount: data.workersAffectedCount || null,
        eventDate: parsedEventDate,
        sourceUrl: data.sourceUrl || null,
        technologyId: data.technologyId || null,
        // Submit info
        submittedBy: userId,
        isAnonymous: data.isAnonymous,
        reporterRelationship: data.reporterRelationship || null,
        // Status
        status: 'published', // Instant publish!
      })
      .returning()

    return {
      success: true,
      report: newReport,
    }
  })

/**
 * Add an enrichment to a report
 */
export const addEnrichmentFn = createServerFn({ method: 'POST' })
  .middleware([
    authMiddleware,
    rateLimitMiddleware({ max: 20, window: 3600 }), // 20 enrichments per hour
  ])
  .inputValidator(enrichmentSchema)
  .handler(async ({ data, context }) => {
    const userId = context.user.id

    // Verify report exists
    const report = await getReportById(data.reportId)
    if (!report) {
      return { success: false, error: 'Report not found' }
    }

    // Create enrichment
    const db = await dbClient()
    const [newEnrichment] = await db
      .insert(reportEnrichment)
      .values({
        id: nanoid(),
        reportId: data.reportId,
        userId,
        enrichmentType: data.enrichmentType,
        linkedEntityId: data.linkedEntityId || null,
        suggestedName: data.suggestedName || null,
        confidence: data.confidence,
        notes: data.notes || null,
        upvotes: 0,
        downvotes: 0,
      })
      .returning()

    return {
      success: true,
      enrichment: newEnrichment,
    }
  })

/**
 * Flag a report for moderation
 */
export const flagReportFn = createServerFn({ method: 'POST' })
  .middleware([
    authMiddleware,
    rateLimitMiddleware({ max: 10, window: 3600 }), // 10 flags per hour
  ])
  .inputValidator(flagReportSchema)
  .handler(async ({ data, context }) => {
    const userId = context.user.id

    // Verify report exists
    const report = await getReportById(data.reportId)
    if (!report) {
      return { success: false, error: 'Report not found' }
    }

    // Check if user already flagged this report
    const alreadyFlagged = await hasUserFlaggedReport(data.reportId, userId)
    if (alreadyFlagged) {
      return { success: false, error: 'You have already flagged this report' }
    }

    // Create flag
    const db = await dbClient()
    await db.insert(reportFlag).values({
      id: nanoid(),
      reportId: data.reportId,
      userId,
      reason: data.reason,
      notes: data.notes || null,
    })

    // Check flag count and auto-hide if >= 3
    const flagCount = await getReportFlagCount(data.reportId)
    if (flagCount >= 3 && report.status === 'published') {
      // Auto-hide report
      await db
        .update(impactReport)
        .set({ status: 'flagged' })
        .where(eq(impactReport.id, data.reportId))
    }

    return {
      success: true,
      flagCount,
      autoHidden: flagCount >= 3,
    }
  })

/**
 * Vote on an enrichment
 */
export const voteEnrichmentFn = createServerFn({ method: 'POST' })
  .middleware([
    authMiddleware,
    rateLimitMiddleware({ max: 50, window: 3600 }), // 50 votes per hour
  ])
  .inputValidator(voteEnrichmentSchema)
  .handler(async ({ data, context: _context }) => {
    // TODO: Track user votes to prevent double voting
    // const userId = context.user.id

    // In production, track user votes to prevent double voting
    // For now, just increment the counter
    const db = await dbClient()
    const updateData =
      data.voteType === 'upvote'
        ? { upvotes: sql`${reportEnrichment.upvotes} + 1` }
        : { downvotes: sql`${reportEnrichment.downvotes} + 1` }

    const updated = await db
      .update(reportEnrichment)
      .set(updateData)
      .where(eq(reportEnrichment.id, data.enrichmentId))
      .returning()

    if (updated.length === 0) {
      return { success: false, error: 'Enrichment not found' }
    }

    return {
      success: true,
      enrichment: updated[0],
    }
  })

/**
 * Vote on a report (upvote/downvote)
 */
export const voteReportFn = createServerFn({ method: 'POST' })
  .middleware([
    authMiddleware,
    rateLimitMiddleware({ max: 50, window: 3600 }), // 50 votes per hour
  ])
  .inputValidator(voteReportSchema)
  .handler(async ({ data, context: _context }) => {
    // TODO: Track user votes to prevent double voting
    // const userId = context.user.id

    // In production, track user votes to prevent double voting
    const db = await dbClient()
    const updateData =
      data.voteType === 'upvote'
        ? { upvotes: sql`${impactReport.upvotes} + 1` }
        : { upvotes: sql`${impactReport.upvotes} - 1` }

    const updated = await db
      .update(impactReport)
      .set(updateData)
      .where(eq(impactReport.id, data.reportId))
      .returning()

    if (updated.length === 0) {
      return { success: false, error: 'Report not found' }
    }

    return {
      success: true,
      report: updated[0],
    }
  })

/**
 * Get current user's submitted reports
 */
export const getMyReportsFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(
    z
      .object({
        limit: z.number().int().positive().max(100).default(20),
      })
      .optional(),
  )
  .handler(async ({ data, context }) => {
    const userId = context.user.id
    const limit = data?.limit ?? 20

    const reports = await getReportsByUserId(userId, limit)

    return {
      success: true,
      reports,
    }
  })

// ============================================
// ADMIN/MODERATOR FUNCTIONS
// ============================================

/**
 * Moderator: Update report status (e.g., remove flagged report)
 */
export const updateReportStatusFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware]) // In production, use moderator middleware
  .inputValidator(
    z.object({
      reportId: z.string(),
      status: z.enum(['published', 'flagged', 'removed']),
    }),
  )
  .handler(async ({ data }) => {
    // TODO: In production, check if user is moderator/admin
    // For now, just require authentication
    // const userId = context.user.id

    const db = await dbClient()
    const updated = await db
      .update(impactReport)
      .set({ status: data.status })
      .where(eq(impactReport.id, data.reportId))
      .returning()

    if (updated.length === 0) {
      return { success: false, error: 'Report not found' }
    }

    return {
      success: true,
      report: updated[0],
    }
  })

/**
 * Moderator: Get flagged reports for review
 */
export const getFlaggedReportsFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware]) // In production, use moderator middleware
  .inputValidator(
    z
      .object({
        limit: z.number().int().positive().max(100).default(50),
      })
      .optional(),
  )
  .handler(async ({ data }) => {
    const limit = data?.limit ?? 50

    const result = await getFlaggedReports(limit)

    return {
      success: true,
      reports: result.reports,
    }
  })

/**
 * Admin: Get report statistics
 */
export const getReportStatsFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware]) // In production, use admin middleware
  .handler(async () => {
    const stats = await getReportStats()

    return {
      success: true,
      stats,
    }
  })
