import { and, asc, desc, eq, gt, or, sql } from 'drizzle-orm'

import type {EntityType} from '@/db/schema';
import { dbClient } from '@/db'
import {
  
  capability,
  capabilitySubtype,
  discussion,
  impactReport,
  job,
  organization,
  technology,
  user
} from '@/db/schema'

// ============================================
// TYPES
// ============================================

export type DiscussionFilters = {
  entityType?: EntityType
  entityId?: string
  searchTerm?: string
  isTopLevel?: boolean
  userId?: string
  timeRange?: 'today' | 'week' | 'month' | 'all'
}

export type DiscussionSortOption = 'recent' | 'upvotes' | 'hot'

export type DiscussionWithAuthor = {
  id: string
  title: string | null
  body: string
  isTopLevel: boolean
  entityType: EntityType
  entityId: string
  parentId: string | null
  depth: number
  userId: string
  isAnonymous: boolean
  upvotes: number
  downvotes: number
  replyCount: number
  isDeleted: boolean
  deletedBy: string | null
  deleteReason: string | null
  createdAt: Date
  updatedAt: Date
  // Joined fields
  author?: {
    id: string
    name: string | null
    username: string
    email: string | null
    role: string | null
  } | null
  // Entity info (when filtering by entity)
  entityInfo?: {
    name: string
    slug: string | null
  } | null
}

export type DiscussionThread = DiscussionWithAuthor & {
  replies: Array<DiscussionThread>
}

// ============================================
// QUERIES
// ============================================

/**
 * Get discussions with filters, sorting, and pagination
 */
export async function getDiscussions(options: {
  filters?: DiscussionFilters
  sort?: DiscussionSortOption
  limit?: number
  offset?: number
}) {
  const { filters = {}, sort = 'recent', limit = 20, offset = 0 } = options

  // Build where conditions
  const conditions = []

  // Don't show deleted discussions
  conditions.push(eq(discussion.isDeleted, false))

  // Top-level only for main feed
  if (filters.isTopLevel !== undefined) {
    conditions.push(eq(discussion.isTopLevel, filters.isTopLevel))
  } else {
    conditions.push(eq(discussion.isTopLevel, true))
  }

  // Entity type filter
  if (filters.entityType) {
    conditions.push(eq(discussion.entityType, filters.entityType))
  }

  // Entity ID filter
  if (filters.entityId) {
    conditions.push(eq(discussion.entityId, filters.entityId))
  }

  // User filter
  if (filters.userId) {
    conditions.push(eq(discussion.userId, filters.userId))
  }

  // Search term (search in title and body)
  if (filters.searchTerm) {
    const searchPattern = `%${filters.searchTerm}%`
    conditions.push(
      or(
        sql`${discussion.title} ILIKE ${searchPattern}`,
        sql`${discussion.body} ILIKE ${searchPattern}`,
      ),
    )
  }

  // Time range filter
  if (filters.timeRange && filters.timeRange !== 'all') {
    const now = new Date()
    let cutoffDate: Date

    switch (filters.timeRange) {
      case 'today':
        cutoffDate = new Date(now.setHours(0, 0, 0, 0))
        break
      case 'week':
        cutoffDate = new Date(now.setDate(now.getDate() - 7))
        break
      case 'month':
        cutoffDate = new Date(now.setMonth(now.getMonth() - 1))
        break
      default:
        cutoffDate = new Date(0)
    }

    conditions.push(gt(discussion.createdAt, cutoffDate))
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  // Build order by
  let orderByClause
  switch (sort) {
    case 'upvotes':
      orderByClause = [
        desc(sql`${discussion.upvotes} - ${discussion.downvotes}`),
        desc(discussion.createdAt),
      ]
      break
    case 'hot':
      // Hot algorithm: (upvotes - downvotes) / (age + 2)^1.5
      orderByClause = [
        desc(
          sql`(${discussion.upvotes} - ${discussion.downvotes}) / POWER(EXTRACT(EPOCH FROM (NOW() - ${discussion.createdAt})) / 3600 + 2, 1.5)`,
        ),
      ]
      break
    case 'recent':
    default:
      orderByClause = [desc(discussion.createdAt)]
      break
  }
  const db = dbClient()

  // Get total count
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(discussion)
    .where(whereClause)

  // Get discussions with author info
  const discussions = await db
    .select({
      id: discussion.id,
      title: discussion.title,
      body: discussion.body,
      isTopLevel: discussion.isTopLevel,
      entityType: discussion.entityType,
      entityId: discussion.entityId,
      parentId: discussion.parentId,
      depth: discussion.depth,
      userId: discussion.userId,
      isAnonymous: discussion.isAnonymous,
      upvotes: discussion.upvotes,
      downvotes: discussion.downvotes,
      replyCount: discussion.replyCount,
      isDeleted: discussion.isDeleted,
      deletedBy: discussion.deletedBy,
      deleteReason: discussion.deleteReason,
      createdAt: discussion.createdAt,
      updatedAt: discussion.updatedAt,
      // Author
      author: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    })
    .from(discussion)
    .leftJoin(user, eq(discussion.userId, user.id))
    .where(whereClause)
    .orderBy(...orderByClause)
    .limit(limit)
    .offset(offset)

  return {
    discussions: discussions as Array<DiscussionWithAuthor>,
    totalCount: Number(count || 0),
    hasMore: offset + limit < Number(count || 0),
  }
}

/**
 * Get a single discussion by ID with its full reply tree
 */
export async function getDiscussionById(
  discussionId: string,
): Promise<DiscussionWithAuthor | null> {
  const db = dbClient()
  const results = await db
    .select({
      id: discussion.id,
      title: discussion.title,
      body: discussion.body,
      isTopLevel: discussion.isTopLevel,
      entityType: discussion.entityType,
      entityId: discussion.entityId,
      parentId: discussion.parentId,
      depth: discussion.depth,
      userId: discussion.userId,
      isAnonymous: discussion.isAnonymous,
      upvotes: discussion.upvotes,
      downvotes: discussion.downvotes,
      replyCount: discussion.replyCount,
      isDeleted: discussion.isDeleted,
      deletedBy: discussion.deletedBy,
      deleteReason: discussion.deleteReason,
      createdAt: discussion.createdAt,
      updatedAt: discussion.updatedAt,
      author: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    })
    .from(discussion)
    .leftJoin(user, eq(discussion.userId, user.id))
    .where(eq(discussion.id, discussionId))
    .limit(1)

  const discussionResult = results[0]
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!discussionResult) {
    return null
  }

  return discussionResult as DiscussionWithAuthor
}

/**
 * Get all replies for a discussion (threaded, max 3 levels)
 */
export async function getDiscussionReplies(
  discussionId: string,
): Promise<Array<DiscussionThread>> {
  // Get all descendants of this discussion
  const db = dbClient()
  const allReplies = await db
    .select({
      id: discussion.id,
      title: discussion.title,
      body: discussion.body,
      isTopLevel: discussion.isTopLevel,
      entityType: discussion.entityType,
      entityId: discussion.entityId,
      parentId: discussion.parentId,
      depth: discussion.depth,
      userId: discussion.userId,
      isAnonymous: discussion.isAnonymous,
      upvotes: discussion.upvotes,
      downvotes: discussion.downvotes,
      replyCount: discussion.replyCount,
      isDeleted: discussion.isDeleted,
      deletedBy: discussion.deletedBy,
      deleteReason: discussion.deleteReason,
      createdAt: discussion.createdAt,
      updatedAt: discussion.updatedAt,
      author: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    })
    .from(discussion)
    .leftJoin(user, eq(discussion.userId, user.id))
    .where(
      and(
        eq(discussion.parentId, discussionId),
        eq(discussion.isDeleted, false),
      ),
    )
    .orderBy(asc(discussion.createdAt))

  // Build threaded structure recursively
  const buildThread = async (
    parentId: string | null,
    currentDepth: number,
  ): Promise<Array<DiscussionThread>> => {
    if (currentDepth >= 3) {
      return []
    }

    const replies = allReplies.filter((r) => r.parentId === parentId)

    const threadedReplies = await Promise.all(
      replies.map(async (reply) => {
        const authorData = reply.author
        return {
          ...reply,
          replies: await buildThread(reply.id, currentDepth + 1),
          author: authorData
            ? {
                ...authorData,
                username: authorData.username ?? '',
              }
            : null,
        }
      }),
    )

    return threadedReplies
  }

  return buildThread(discussionId, 0)
}

/**
 * Get discussions for a specific entity (1:1 relationship)
 * Each entity has exactly one top-level discussion
 */
export async function getDiscussionByEntity(
  entityType: EntityType,
  entityId: string,
): Promise<DiscussionWithAuthor | null> {
  const db = dbClient()
  const results = await db
    .select({
      id: discussion.id,
      title: discussion.title,
      body: discussion.body,
      isTopLevel: discussion.isTopLevel,
      entityType: discussion.entityType,
      entityId: discussion.entityId,
      parentId: discussion.parentId,
      depth: discussion.depth,
      userId: discussion.userId,
      isAnonymous: discussion.isAnonymous,
      upvotes: discussion.upvotes,
      downvotes: discussion.downvotes,
      replyCount: discussion.replyCount,
      isDeleted: discussion.isDeleted,
      deletedBy: discussion.deletedBy,
      deleteReason: discussion.deleteReason,
      createdAt: discussion.createdAt,
      updatedAt: discussion.updatedAt,
      author: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    })
    .from(discussion)
    .leftJoin(user, eq(discussion.userId, user.id))
    .where(
      and(
        eq(discussion.entityType, entityType),
        eq(discussion.entityId, entityId),
        eq(discussion.isTopLevel, true),
      ),
    )
    .limit(1)

  return results[0] as DiscussionWithAuthor | null
}

/**
 * Get entity info for a discussion
 */
export async function getEntityInfo(
  entityType: EntityType,
  entityId: string,
): Promise<{ name: string; slug: string | null } | null> {
  const db = dbClient()
  let result

  switch (entityType) {
    case 'organization':
      ;[result] = await db
        .select({ name: organization.name, slug: organization.slug })
        .from(organization)
        .where(eq(organization.id, entityId))
        .limit(1)
      break
    case 'technology':
      ;[result] = await db
        .select({ name: technology.name, slug: technology.slug })
        .from(technology)
        .where(eq(technology.id, entityId))
        .limit(1)
      break
    case 'capability':
      ;[result] = await db
        .select({ name: capability.name, slug: capability.slug })
        .from(capability)
        .where(eq(capability.id, entityId))
        .limit(1)
      break
    case 'capability_subtype':
      ;[result] = await db
        .select({ name: capabilitySubtype.name, slug: capabilitySubtype.slug })
        .from(capabilitySubtype)
        .where(eq(capabilitySubtype.id, entityId))
        .limit(1)
      break
    case 'job':
      ;[result] = await db
        .select({ name: job.name, slug: job.slug })
        .from(job)
        .where(eq(job.id, entityId))
        .limit(1)
      break
    case 'impact_report':
      // Reports don't have a slug, use title as name
      ;[result] = await db
        .select({
          name: sql<string>`COALESCE(${impactReport.title}, ${impactReport.jobTitle})`,
          slug: sql<string>`NULL`,
        })
        .from(impactReport)
        .where(eq(impactReport.id, entityId))
        .limit(1)
      break
    default:
      return null
  }

  return result
}

/**
 * Get trending topics (most discussed entities)
 */
export async function getTrendingTopics(limit = 5) {
  const db = dbClient()
  // Group by entity_type and entity_id, count replies
  const trending = await db
    .select({
      entityType: discussion.entityType,
      entityId: discussion.entityId,
      commentCount: sql<number>`count(*)`.as('comment_count'),
    })
    .from(discussion)
    .where(eq(discussion.isDeleted, false))
    .groupBy(discussion.entityType, discussion.entityId)
    .orderBy(desc(sql`count(*)`))
    .limit(limit)

  // Fetch entity info for each trending topic
  const topics = await Promise.all(
    trending.map(async (topic) => {
      const entityInfo = await getEntityInfo(topic.entityType, topic.entityId)
      return {
        entityType: topic.entityType,
        entityId: topic.entityId,
        entityName: entityInfo?.name || 'Unknown',
        entitySlug: entityInfo?.slug,
        commentCount: topic.commentCount,
      }
    }),
  )

  return topics
}

/**
 * Get discussions by user ID
 */
export async function getDiscussionsByUserId(
  userId: string,
  options?: { limit?: number; offset?: number },
) {
  const db = dbClient()
  const { limit = 20, offset = 0 } = options || {}

  const conditions = [
    eq(discussion.userId, userId),
    eq(discussion.isDeleted, false),
  ]

  // Get total count
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(discussion)
    .where(and(...conditions))

  // Get discussions
  const discussions = await db
    .select({
      id: discussion.id,
      title: discussion.title,
      body: discussion.body,
      isTopLevel: discussion.isTopLevel,
      entityType: discussion.entityType,
      entityId: discussion.entityId,
      parentId: discussion.parentId,
      depth: discussion.depth,
      userId: discussion.userId,
      isAnonymous: discussion.isAnonymous,
      upvotes: discussion.upvotes,
      downvotes: discussion.downvotes,
      replyCount: discussion.replyCount,
      isDeleted: discussion.isDeleted,
      deletedBy: discussion.deletedBy,
      deleteReason: discussion.deleteReason,
      createdAt: discussion.createdAt,
      updatedAt: discussion.updatedAt,
      author: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    })
    .from(discussion)
    .leftJoin(user, eq(discussion.userId, user.id))
    .where(and(...conditions))
    .orderBy(desc(discussion.createdAt))
    .limit(limit)
    .offset(offset)

  return {
    discussions: discussions as Array<DiscussionWithAuthor>,
    totalCount: Number(count || 0),
    hasMore: offset + limit < Number(count || 0),
  }
}
