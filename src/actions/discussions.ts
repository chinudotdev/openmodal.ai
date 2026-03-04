import { createServerFn } from '@tanstack/react-start'

import { eq, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { z } from 'zod'

import type {EntityType} from '@/db/schema';
import {
  getDiscussionByEntity,
  getDiscussionById,
  getDiscussionReplies,
  getDiscussions,
  getDiscussionsByUserId,
  getEntityInfo,
  getTrendingTopics,
} from '@/data-layer/discussions'
import { dbClient } from '@/db'
import {  discussion } from '@/db/schema'
import { authMiddleware, rateLimitMiddleware } from '@/middleware/server'

// ============================================
// TYPES & VALIDATION
// ============================================

export const discussionFiltersSchema = z.object({
  entityType: z
    .enum([
      'organization',
      'technology',
      'capability',
      'capability_subtype',
      'job',
      'impact_report',
    ])
    .optional(),
  entityId: z.string().optional(),
  searchTerm: z.string().optional(),
  isTopLevel: z.boolean().optional(),
  timeRange: z.enum(['today', 'week', 'month', 'all']).optional(),
})

export const createDiscussionSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').optional(),
  body: z.string().min(10, 'Body must be at least 10 characters'),
  entityType: z.enum([
    'organization',
    'technology',
    'capability',
    'capability_subtype',
    'job',
    'impact_report',
  ]),
  entityId: z.string(),
  isAnonymous: z.boolean().default(false),
})

export const createReplySchema = z.object({
  body: z.string().min(10, 'Reply must be at least 10 characters'),
  parentId: z.string(),
  isAnonymous: z.boolean().default(false),
})

export const updateDiscussionSchema = z.object({
  id: z.string(),
  title: z.string().min(5, 'Title must be at least 5 characters').optional(),
  body: z.string().min(10, 'Body must be at least 10 characters'),
})

export const deleteDiscussionSchema = z.object({
  id: z.string(),
  reason: z.string().optional(),
})

export const voteDiscussionSchema = z.object({
  id: z.string(),
  voteType: z.enum(['upvote', 'downvote']),
})

// ============================================
// PUBLIC SERVER FUNCTIONS (No Auth Required)
// ============================================

/**
 * Get discussions with filters, sorting, and pagination
 */
export const getDiscussionsFn = createServerFn({ method: 'GET' })
  .inputValidator(
    discussionFiltersSchema.extend({
      sort: z.enum(['recent', 'upvotes', 'hot']).default('recent'),
      limit: z.number().int().positive().max(100).default(20),
      offset: z.number().int().nonnegative().default(0),
    }),
  )
  .handler(async ({ data }) => {
    const result = await getDiscussions({
      filters: data,
      sort: data.sort,
      limit: data.limit,
      offset: data.offset,
    })
    return { success: true, ...result }
  })

/**
 * Get a single discussion by ID with replies
 */
export const getDiscussionByIdFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      id: z.string(),
      includeReplies: z.boolean().default(true),
    }),
  )
  .handler(async ({ data }) => {
    const discussionData = await getDiscussionById(data.id)
    if (!discussionData) {
      return { success: false, error: 'Discussion not found' }
    }

    let replies: Awaited<ReturnType<typeof getDiscussionReplies>> = []
    if (data.includeReplies) {
      replies = await getDiscussionReplies(data.id)
    }

    // Get entity info
    const entityInfo = await getEntityInfo(
      discussionData.entityType,
      discussionData.entityId,
    )

    return {
      success: true,
      discussion: discussionData,
      replies,
      entityInfo,
    }
  })

/**
 * Get discussion for a specific entity (1:1 relationship)
 */
export const getDiscussionByEntityFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      entityType: z.enum([
        'organization',
        'technology',
        'capability',
        'capability_subtype',
        'job',
        'impact_report',
      ]),
      entityId: z.string(),
      includeReplies: z.boolean().default(true),
    }),
  )
  .handler(async ({ data }) => {
    const discussionData = await getDiscussionByEntity(
      data.entityType,
      data.entityId,
    )

    if (!discussionData) {
      return { success: true, discussion: null, exists: false }
    }

    let replies: Awaited<ReturnType<typeof getDiscussionReplies>> = []
    if (data.includeReplies) {
      replies = await getDiscussionReplies(discussionData.id)
    }

    return {
      success: true,
      discussion: discussionData,
      replies,
      exists: true,
    }
  })

/**
 * Get trending topics (most discussed entities)
 */
export const getTrendingTopicsFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      limit: z.number().int().positive().max(20).default(5),
    }),
  )
  .handler(async ({ data }) => {
    const topics = await getTrendingTopics(data.limit)
    return { success: true, topics }
  })

// ============================================
// AUTHENTICATED SERVER FUNCTIONS
// ============================================

/**
 * Create a new discussion
 * Requires authentication and rate limiting
 */
export const createDiscussionFn = createServerFn({ method: 'POST' })
  .middleware([
    authMiddleware,
    rateLimitMiddleware({ max: 10, window: 3600 }), // 10 discussions per hour
  ])
  .inputValidator(createDiscussionSchema)
  .handler(async ({ data, context }) => {
    const userId = context.user.id

    // Check if discussion already exists for this entity (1:1)
    const existing = await getDiscussionByEntity(data.entityType, data.entityId)
    if (existing) {
      return {
        success: false,
        error: 'Discussion already exists for this entity',
        discussionId: existing.id,
      }
    }

    // Create the discussion
    const db = await dbClient()
    const [newDiscussion] = await db
      .insert(discussion)
      .values({
        id: nanoid(),
        title: data.title || null,
        body: data.body,
        isTopLevel: true,
        entityType: data.entityType,
        entityId: data.entityId,
        parentId: null,
        depth: 0,
        userId,
        isAnonymous: data.isAnonymous,
        upvotes: 0,
        downvotes: 0,
        replyCount: 0,
      })
      .returning()

    return {
      success: true,
      discussion: newDiscussion,
    }
  })

/**
 * Create a reply to a discussion
 * Requires authentication and rate limiting
 */
export const createReplyFn = createServerFn({ method: 'POST' })
  .middleware([
    authMiddleware,
    rateLimitMiddleware({ max: 20, window: 3600 }), // 20 replies per hour
  ])
  .inputValidator(createReplySchema)
  .handler(async ({ data, context }) => {
    const userId = context.user.id

    // Get parent discussion to check depth
    const parent = await getDiscussionById(data.parentId)
    if (!parent) {
      return { success: false, error: 'Parent discussion not found' }
    }

    // Check if we're at max depth (3 levels: 0, 1, 2)
    if (parent.depth >= 2) {
      return {
        success: false,
        error: 'Maximum reply depth reached (3 levels)',
      }
    }

    // Create the reply
    const db = await dbClient()
    const [newReply] = await db
      .insert(discussion)
      .values({
        id: nanoid(),
        title: null, // Replies don't have titles
        body: data.body,
        isTopLevel: false,
        entityType: parent.entityType,
        entityId: parent.entityId,
        parentId: data.parentId,
        depth: parent.depth + 1,
        userId,
        isAnonymous: data.isAnonymous,
        upvotes: 0,
        downvotes: 0,
        replyCount: 0,
      })
      .returning()

    // Increment parent's reply count
    await db
      .update(discussion)
      .set({
        replyCount: sql`${discussion.replyCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(discussion.id, data.parentId))

    return {
      success: true,
      reply: newReply,
    }
  })

/**
 * Update a discussion (only by author)
 * Requires authentication
 */
export const updateDiscussionFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(updateDiscussionSchema)
  .handler(async ({ data, context }) => {
    const userId = context.user.id

    // Get the discussion
    const existing = await getDiscussionById(data.id)
    if (!existing) {
      return { success: false, error: 'Discussion not found' }
    }

    // Check ownership
    if (existing.userId !== userId) {
      return { success: false, error: 'You can only edit your own discussions' }
    }

    // Update the discussion
    const db = await dbClient()
    const updated = await db
      .update(discussion)
      .set({
        title: data.title !== undefined ? data.title : existing.title,
        body: data.body,
        updatedAt: new Date(),
      })
      .where(eq(discussion.id, data.id))
      .returning()

    if (updated.length === 0) {
      return { success: false, error: 'Failed to update discussion' }
    }

    return {
      success: true,
      discussion: updated[0],
    }
  })

/**
 * Delete a discussion (soft delete, only by author or admin)
 * Requires authentication
 */
export const deleteDiscussionFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(deleteDiscussionSchema)
  .handler(async ({ data, context }) => {
    const userId = context.user.id
    const userRole = context.user.role

    // Get the discussion
    const existing = await getDiscussionById(data.id)
    if (!existing) {
      return { success: false, error: 'Discussion not found' }
    }

    // Check ownership or admin role
    if (existing.userId !== userId && userRole !== 'admin') {
      return {
        success: false,
        error: 'You can only delete your own discussions',
      }
    }

    // Soft delete the discussion
    const db = await dbClient()
    const updated = await db
      .update(discussion)
      .set({
        isDeleted: true,
        deletedBy: userId,
        deleteReason: data.reason || null,
        updatedAt: new Date(),
      })
      .where(eq(discussion.id, data.id))
      .returning()

    if (updated.length === 0) {
      return { success: false, error: 'Failed to delete discussion' }
    }

    return {
      success: true,
      discussion: updated[0],
    }
  })

/**
 * Vote on a discussion (upvote/downvote)
 * Requires authentication and rate limiting
 */
export const voteDiscussionFn = createServerFn({ method: 'POST' })
  .middleware([
    authMiddleware,
    rateLimitMiddleware({ max: 50, window: 3600 }), // 50 votes per hour
  ])
  .inputValidator(voteDiscussionSchema)
  .handler(async ({ data, context: _context }) => {
    // TODO: Track user votes to prevent double voting
    // const userId = context.user.id

    // In production, track user votes in a separate table
    // For now, just increment the counter
    const db = await dbClient()
    const updateData =
      data.voteType === 'upvote'
        ? { upvotes: sql`${discussion.upvotes} + 1` }
        : { downvotes: sql`${discussion.downvotes} + 1` }

    const updated = await db
      .update(discussion)
      .set(updateData)
      .where(eq(discussion.id, data.id))
      .returning()

    if (updated.length === 0) {
      return { success: false, error: 'Discussion not found' }
    }

    return {
      success: true,
      discussion: updated[0],
    }
  })

/**
 * Get current user's discussions
 */
export const getMyDiscussionsFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(
    z
      .object({
        limit: z.number().int().positive().max(100).default(20),
        offset: z.number().int().nonnegative().default(0),
      })
      .optional(),
  )
  .handler(async ({ data, context }) => {
    const userId = context.user.id
    const limit = data?.limit ?? 20
    const offset = data?.offset ?? 0

    const result = await getDiscussionsByUserId(userId, { limit, offset })

    return {
      success: true,
      ...result,
    }
  })

// Helper to get entity type from route
export function getEntityTypeFromRoute(
  routeType: string,
): EntityType | undefined {
  switch (routeType) {
    case 'organization':
      return 'organization'
    case 'technology':
      return 'technology'
    case 'capability':
    case 'capabilities':
      return 'capability'
    case 'capability_subtype':
    case 'capability-subtype':
      return 'capability_subtype'
    case 'job':
    case 'jobs':
      return 'job'
    case 'impact_report':
    case 'impact-report':
    case 'report':
    case 'reports':
      return 'impact_report'
    default:
      return undefined
  }
}
