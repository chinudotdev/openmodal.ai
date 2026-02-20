import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { and, desc, eq, ilike, or, sql } from 'drizzle-orm'
import z from 'zod'

import { db } from '@/db'
import { feedback, user } from '@/db/schema'
import { auth } from '@/lib/auth'

// Submit feedback
export const submitFeedbackFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      content: z.string().min(1),
      type: z.enum(['general', 'bug', 'feature', 'improvement']).optional(),
      rating: z.enum(['1', '2', '3', '4', '5']).optional(),
      email: z.email().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })
    const userId = session?.user ? session.user.id : null

    // If no user and no email, return error
    if (!userId && !data.email) {
      return {
        success: false,
        error: 'Email is required for unauthenticated users',
      }
    }

    await db.insert(feedback).values({
      id: crypto.randomUUID(),
      content: data.content,
      type: data.type || 'general',
      rating: data.rating,
      userId: userId || null,
      email: data.email,
      reviewed: 'false',
    })

    return {
      success: true,
    }
  })

// Get all feedbacks with filters
export const getFeedbacksFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      search: z.string().optional(),
      type: z.enum(['general', 'bug', 'feature', 'improvement']).optional(),
      rating: z.enum(['1', '2', '3', '4', '5']).optional(),
      reviewed: z.enum(['true', 'false']).optional(),
      sortBy: z.enum(['recent', 'oldest']).optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })

    // Check if user is admin
    // TODO: Add proper admin check
    if (!session?.user) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    const page = data.page || 1
    const limit = data.limit || 50
    const offset = (page - 1) * limit

    // Build conditions
    const conditions = []

    if (data.search) {
      conditions.push(
        or(
          ilike(feedback.content, `%${data.search}%`),
          ilike(user.name, `%${data.search}%`),
          ilike(user.email, `%${data.search}%`),
          ilike(feedback.email, `%${data.search}%`),
        ),
      )
    }

    if (data.type) {
      conditions.push(eq(feedback.type, data.type))
    }

    if (data.rating) {
      conditions.push(eq(feedback.rating, data.rating))
    }

    if (data.reviewed) {
      conditions.push(eq(feedback.reviewed, data.reviewed))
    }

    // Build order by
    const orderBy =
      data.sortBy === 'oldest' ? feedback.createdAt : desc(feedback.createdAt)

    // Get feedbacks with user info
    const feedbacks = await db
      .select({
        id: feedback.id,
        content: feedback.content,
        type: feedback.type,
        rating: feedback.rating,
        email: feedback.email,
        reviewed: feedback.reviewed,
        reviewedBy: feedback.reviewedBy,
        reviewedAt: feedback.reviewedAt,
        adminNotes: feedback.adminNotes,
        createdAt: feedback.createdAt,
        updatedAt: feedback.updatedAt,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      })
      .from(feedback)
      .leftJoin(user, eq(feedback.userId, user.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset)

    // Get total count
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(feedback)
      .leftJoin(user, eq(feedback.userId, user.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)

    return {
      success: true,
      feedbacks,
      pagination: {
        page,
        limit,
        total: Number(totalCount[0]?.count || 0),
        totalPages: Math.ceil(Number(totalCount[0]?.count || 0) / limit),
      },
    }
  })

// Mark feedback as reviewed
export const markFeedbackReviewedFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      feedbackId: z.string().min(1),
      notes: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })

    // Check if user is admin
    // TODO: Add proper admin check
    if (!session?.user) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    await db
      .update(feedback)
      .set({
        reviewed: 'true',
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
        adminNotes: data.notes,
      })
      .where(eq(feedback.id, data.feedbackId))

    return {
      success: true,
    }
  })
