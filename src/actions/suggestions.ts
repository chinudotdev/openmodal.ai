import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'

import { desc, eq, ilike, or } from 'drizzle-orm'
import z from 'zod'

import { dbClient } from '@/db'
import { capability, job, suggestion, technology, user } from '@/db/schema'
import { auth } from '@/lib/auth'

// Search capabilities, jobs, and technologies
export const searchCapabilitiesAndJobsFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      query: z.string().min(1),
      type: z.enum(['capability', 'job', 'technology']).optional(),
    }),
  )
  .handler(async ({ data: { query, type } }) => {
    const db =  dbClient()
    const searchTerm = `%${query}%`

    const results: Array<{
      id: string
      name: string
      type: 'capability' | 'job' | 'technology'
    }> = []

    if (!type || type === 'capability') {
      const capabilities = await db
        .select({
          id: capability.id,
          name: capability.name,
        })
        .from(capability)
        .where(ilike(capability.name, searchTerm))
        .limit(10)

      results.push(
        ...capabilities.map((c) => ({ ...c, type: 'capability' as const })),
      )
    }

    if (!type || type === 'job') {
      const jobs = await db
        .select({
          id: job.id,
          name: job.name,
        })
        .from(job)
        .where(ilike(job.name, searchTerm))
        .limit(10)

      results.push(...jobs.map((j) => ({ ...j, type: 'job' as const })))
    }

    if (!type || type === 'technology') {
      const technologies = await db
        .select({
          id: technology.id,
          name: technology.name,
        })
        .from(technology)
        .where(ilike(technology.name, searchTerm))
        .limit(10)

      results.push(
        ...technologies.map((t) => ({ ...t, type: 'technology' as const })),
      )
    }

    return results
  })

// Submit suggestions
export const submitSuggestionsFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      type: z.enum(['capability', 'job', 'technology', 'organization']),
      suggestedName: z.string().min(1),
      reason: z.string().min(1),
      additionalInfo: z.string().optional(),
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

    if (data.type === 'technology') {
      data.type = 'organization'
    }

    const db =  dbClient()
    await db.insert(suggestion).values({
      id: crypto.randomUUID(),
      type: data.type,
      suggestedName: data.suggestedName,
      reason: data.reason,
      additionalInfo: data.additionalInfo,
      userId: userId || null,
      email: data.email,
      status: 'pending',
    })

    return {
      success: true,
    }
  })

// Get suggestions with user info (admin only)
export const getSuggestionsFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      type: z
        .array(
          z.enum([
            'job',
            'capability',
            'capability_subtype',
            'task',
            'organization',
          ]),
        )
        .optional(),
      status: z.array(z.enum(['pending', 'accepted', 'rejected'])).optional(),
      search: z.string().optional(),
      sortBy: z.enum(['recent', 'oldest']).optional().default('recent'),
      limit: z.number().optional().default(50),
      offset: z.number().optional().default(0),
    }),
  )
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })

    if (!session || session.user.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required')
    }

    const conditions = []

    // Filter by type
    if (data.type && data.type.length > 0) {
      conditions.push(eq(suggestion.type, data.type[0]))
    }

    // Filter by status
    if (data.status && data.status.length > 0) {
      conditions.push(eq(suggestion.status, data.status[0]))
    }

    // Search in content
    if (data.search) {
      const searchTerm = `%${data.search}%`
      conditions.push(
        or(
          ilike(suggestion.suggestedName, searchTerm),
          ilike(suggestion.reason, searchTerm),
          ilike(suggestion.additionalInfo, searchTerm),
        ),
      )
    }

    const orderBy =
      data.sortBy === 'recent'
        ? desc(suggestion.createdAt)
        : suggestion.createdAt

    const db =  dbClient()
    const suggestions = await db
      .select({
        id: suggestion.id,
        type: suggestion.type,
        suggestedName: suggestion.suggestedName,
        reason: suggestion.reason,
        additionalInfo: suggestion.additionalInfo,
        status: suggestion.status,
        email: suggestion.email,
        createdAt: suggestion.createdAt,
        updatedAt: suggestion.updatedAt,
        reviewedAt: suggestion.reviewedAt,
        response: suggestion.response,
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
        },
      })
      .from(suggestion)
      .leftJoin(user, eq(suggestion.userId, user.id))
      .where(conditions.length > 0 ? or(...conditions) : undefined)
      .orderBy(orderBy)
      .limit(data.limit)
      .offset(data.offset)

    // Get total count
    const [{ count }] = await db
      .select({ count: suggestion.id })
      .from(suggestion)
      .where(conditions.length > 0 ? or(...conditions) : undefined)

    return {
      suggestions,
      total: Number(count),
    }
  })

// Update suggestion status (admin only)
export const updateSuggestionStatusFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      id: z.string(),
      status: z.enum(['pending', 'accepted', 'rejected']),
      response: z.string().optional(),
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
      .update(suggestion)
      .set({
        status: data.status,
        response: data.response,
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(suggestion.id, data.id))

    return {
      success: true,
    }
  })
