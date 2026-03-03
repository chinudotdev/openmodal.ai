import { and, desc, eq, ilike, sql } from 'drizzle-orm'

import type {
  DraftChangeOperation,
  DraftChangeStatus,
  DraftChangeType,
} from '@/db/schema/draft-changes'
import { db } from '@/db'
import { draftChange, user } from '@/db/schema'

export interface GetDraftChangesParams {
  entityType?: DraftChangeType
  status?: DraftChangeStatus
  operation?: DraftChangeOperation
  search?: string
  sortBy?: 'recent' | 'oldest'
  limit?: number
  offset?: number
}

export async function getDraftChanges(params: GetDraftChangesParams = {}) {
  const {
    entityType,
    status,
    operation,
    search,
    sortBy = 'recent',
    limit = 50,
    offset = 0,
  } = params

  const conditions = []

  if (entityType) {
    conditions.push(eq(draftChange.entityType, entityType))
  }

  if (status) {
    conditions.push(eq(draftChange.status, status))
  }

  if (operation) {
    conditions.push(eq(draftChange.operation, operation))
  }

  if (search) {
    const searchTerm = `%${search}%`
    conditions.push(ilike(draftChange.reason, searchTerm))
  }

  const orderBy =
    sortBy === 'recent' ? desc(draftChange.createdAt) : draftChange.createdAt

  // Use window function to get total count in single query with join for user data
  const draftChanges = await db
    .select({
      id: draftChange.id,
      entityType: draftChange.entityType,
      operation: draftChange.operation,
      entityId: draftChange.entityId,
      data: draftChange.data,
      status: draftChange.status,
      reason: draftChange.reason,
      response: draftChange.response,
      createdAt: draftChange.createdAt,
      updatedAt: draftChange.updatedAt,
      reviewedAt: draftChange.reviewedAt,
      submittedBy: draftChange.submittedBy,
      submittedByName: user.name,
      submittedByEmail: user.email,
      submittedByUsername: user.username,
      submittedByImage: user.image,
      totalCount: sql<number>`COUNT(*) OVER()`.as('totalCount'),
    })
    .from(draftChange)
    .leftJoin(user, eq(draftChange.submittedBy, user.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset)

  const total = draftChanges[0]?.totalCount ?? 0

  // Enrich draft changes with user data and remove totalCount from results
  const enrichedDraftChanges = draftChanges.map((dc) => {
    const {
      totalCount,
      submittedByName,
      submittedByEmail,
      submittedByUsername,
      submittedByImage,
      ...rest
    } = dc
    return {
      ...rest,
      data: rest.data as { [x: string]: {} },
      submittedBy: rest.submittedBy
        ? {
            id: rest.submittedBy,
            name: submittedByName,
            email: submittedByEmail,
            username: submittedByUsername,
            image: submittedByImage,
          }
        : null,
    }
  })

  return {
    draftChanges: enrichedDraftChanges,
    total: Number(total),
  }
}

export async function getDraftChangeById(id: string) {
  const [draft] = await db
    .select({
      id: draftChange.id,
      entityType: draftChange.entityType,
      operation: draftChange.operation,
      entityId: draftChange.entityId,
      data: draftChange.data,
      status: draftChange.status,
      reason: draftChange.reason,
      response: draftChange.response,
      createdAt: draftChange.createdAt,
      updatedAt: draftChange.updatedAt,
      reviewedAt: draftChange.reviewedAt,
      submittedBy: draftChange.submittedBy,
      submittedByName: user.name,
      submittedByEmail: user.email,
      submittedByUsername: user.username,
      submittedByImage: user.image,
    })
    .from(draftChange)
    .leftJoin(user, eq(draftChange.submittedBy, user.id))
    .where(eq(draftChange.id, id))
    .limit(1)

  if (!draft) return null // eslint-disable-line @typescript-eslint/no-unnecessary-condition

  const {
    submittedByName,
    submittedByEmail,
    submittedByUsername,
    submittedByImage,
    ...rest
  } = draft

  return {
    ...rest,
    data: rest.data as { [x: string]: {} },
    submittedBy: rest.submittedBy
      ? {
          id: rest.submittedBy,
          name: submittedByName,
          email: submittedByEmail,
          username: submittedByUsername,
          image: submittedByImage,
        }
      : null,
  }
}
