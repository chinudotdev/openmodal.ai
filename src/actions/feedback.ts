import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'

import { and, desc, eq, ilike, or, sql } from 'drizzle-orm'
import z from 'zod'

import { dbClient } from '@/db'
import { feedback, user } from '@/db/schema'
import { auth } from '@/lib/auth'

// Submit feedback
export const submitFeedbackFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      content: z.string().min(1),
      type: z.enum(['general', 'bug', 'feature', 'improvement']).optional(),
      rating: z.enum(['1', '2', '3', '4', '5']).optional(),
      email: z.string().email().optional(),
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

    const db =  dbClient()
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

// Get all feedbacks with filters (admin only)
export const getFeedbacksFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      search: z.string().optional(),
      type: z
        .array(z.enum(['general', 'bug', 'feature', 'improvement']))
        .optional(),
      reviewed: z.enum(['true', 'false']).optional(),
      sortBy: z.enum(['recent', 'oldest']).optional().default('recent'),
      limit: z.number().optional().default(50),
    }),
  )
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })

    if (!session || session.user.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required')
    }

    // Build conditions
    const conditions = []

    if (data.search) {
      const searchTerm = `%${data.search}%`
      conditions.push(
        or(
          ilike(feedback.content, searchTerm),
          ilike(user.name, searchTerm),
          ilike(user.email, searchTerm),
          ilike(feedback.email, searchTerm),
        ),
      )
    }

    if (data.type && data.type.length > 0) {
      conditions.push(eq(feedback.type, data.type[0]))
    }

    if (data.reviewed) {
      conditions.push(eq(feedback.reviewed, data.reviewed))
    }

    // Build order by
    const orderBy =
      data.sortBy === 'oldest' ? feedback.createdAt : desc(feedback.createdAt)

    // Get feedbacks with user info
    const db =  dbClient()
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
      .limit(data.limit)

    // Get total count
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(feedback)
      .leftJoin(user, eq(feedback.userId, user.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)

    return {
      feedbacks,
      total: Number(totalCount[0]?.count || 0),
    }
  })

// Mark feedback as reviewed (admin only)
export const markFeedbackReviewedFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      id: z.string().min(1),
      reviewed: z.enum(['true', 'false']).optional(),
      notes: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })

    if (!session || session.user.role !== 'admin') {
      return {
        success: false,
        error: 'Unauthorized: Admin access required',
      }
    }

    const db =  dbClient()
    await db
      .update(feedback)
      .set({
        reviewed: data.reviewed || 'true',
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
        adminNotes: data.notes,
      })
      .where(eq(feedback.id, data.id))

    return {
      success: true,
    }
  })
