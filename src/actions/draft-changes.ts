import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'

import { and, eq, sql } from 'drizzle-orm'
import z from 'zod'

import { getDraftChangeById, getDraftChanges } from '@/data-layer/draft-changes'
import { dbClient } from '@/db'
import {
  capability,
  capabilitySubtype,
  draftChange,
  job,
  organization,
  task,
  taskCapabilitySubtype,
  technology,
} from '@/db/schema'
import { getAuth } from '@/lib/auth'
import { adminMiddleware } from '@/middleware/server'

// Get draft changes (admin only)
export const getDraftChangesFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      entityType: z
        .enum([
          'capability',
          'capability_subtype',
          'job',
          'organization',
          'technology',
        ])
        .optional(),
      status: z.enum(['pending', 'approved', 'rejected']).optional(),
      operation: z.enum(['create', 'update', 'delete']).optional(),
      search: z.string().optional(),
      sortBy: z.enum(['recent', 'oldest']).optional().default('recent'),
      limit: z.number().optional().default(50),
      offset: z.number().optional().default(0),
    }),
  )
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    return getDraftChanges(data)
  })

// Get single draft change by ID (admin only)
export const getDraftChangeByIdFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      id: z.string(),
    }),
  )
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    return getDraftChangeById(data.id)
  })

// Update draft change status (admin only)
export const updateDraftChangeStatusFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      id: z.string(),
      status: z.enum(['pending', 'approved', 'rejected']),
      response: z.string().optional(),
    }),
  )
  .middleware([adminMiddleware])
  .handler(async ({ data, context }) => {
    // Fetch the draft first to get the operation type
    const draft = await getDraftChangeById(data.id)
    if (!draft) {
      return {
        success: false,
        error: 'Draft not found',
      }
    }

    // Wrap both the entity change (if approved) and draft status update in a single transaction
    const db = dbClient()
    await db.transaction(async (tx) => {
      // If approving a create or update, apply the change to the target entity
      if (
        data.status === 'approved' &&
        (draft.operation === 'create' || draft.operation === 'update')
      ) {
        switch (draft.entityType) {
          case 'capability':
            await applyCapabilityChange(draft, tx)
            break
          case 'capability_subtype':
            await applyCapabilitySubtypeChange(draft, tx)
            break
          case 'job':
            await applyJobChange(draft, tx)
            break
          case 'organization':
            await applyOrganizationChange(draft, tx)
            break
          case 'technology':
            await applyTechnologyChange(draft, tx)
            break
        }
      }

      // Update draft status after entity change succeeds
      await tx
        .update(draftChange)
        .set({
          status: data.status,
          response: data.response,
          reviewedBy: context.user.id,
          reviewedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(draftChange.id, data.id))
    })

    return {
      success: true,
    }
  })

// Helper function to apply capability changes
async function applyCapabilityChange(draft: any, tx: any = dbClient()) {
  const data = draft.data as {
    slug: string
    name: string
    description: string
    icon?: string
  }

  if (draft.operation === 'create') {
    // Check if slug already exists
    const existing = await tx
      .select({ id: capability.id })
      .from(capability)
      .where(eq(capability.slug, data.slug))
      .limit(1)

    if (existing.length > 0) {
      throw new Error(
        `A capability with slug "${data.slug}" already exists. Use a unique slug or update the existing one instead.`,
      )
    }

    const id = crypto.randomUUID()
    await tx.insert(capability).values({
      id,
      slug: data.slug,
      name: data.name,
      description: data.description,
      icon: data.icon || null,
    })
  } else if (draft.operation === 'update' && draft.entityId) {
    // Check if slug changed and conflicts with existing (not self)
    const existingSlugCheck = await tx
      .select({ id: capability.id })
      .from(capability)
      .where(
        and(
          eq(capability.slug, data.slug),
          sql`${capability.id} != ${draft.entityId}`,
        ),
      )
      .limit(1)

    if (existingSlugCheck.length > 0) {
      throw new Error(
        `A capability with slug "${data.slug}" already exists. Use a different slug.`,
      )
    }

    await tx
      .update(capability)
      .set({
        slug: data.slug,
        name: data.name,
        description: data.description,
        icon: data.icon || null,
      })
      .where(eq(capability.id, draft.entityId))
  }
}

// Helper function to apply capability subtype changes
async function applyCapabilitySubtypeChange(draft: any, tx: any = dbClient()) {
  const rawData = draft.data

  // Handle both camelCase and snake_case field names from drafts
  const capabilityId =
    rawData.capabilityId || rawData.capability_id || rawData['capabilityId']
  const whatWorks = rawData.whatWorks || []
  const whatStruggles = rawData.whatStruggles || []
  const whatDoesntWork = rawData.whatDoesntWork || []
  const progressPercentage = rawData.progressPercentage || 0
  const status = rawData.status || 'unsolved'

  if (!capabilityId) {
    throw new Error('capabilityId is required')
  }

  const values = {
    capabilityId,
    slug: rawData.slug,
    name: rawData.name,
    domain: rawData.domain,
    description: rawData.description,
    progressPercentage,
    status,
    whatWorks,
    whatStruggles,
    whatDoesntWork,
  }

  if (draft.operation === 'create') {
    // Check if slug already exists
    const existing = await tx
      .select({ id: capabilitySubtype.id })
      .from(capabilitySubtype)
      .where(eq(capabilitySubtype.slug, rawData.slug))
      .limit(1)

    if (existing.length > 0) {
      throw new Error(
        `A capability subtype with slug "${rawData.slug}" already exists. Use a unique slug or update the existing one instead.`,
      )
    }

    const id = crypto.randomUUID()
    await tx.insert(capabilitySubtype).values({
      id,
      ...values,
    })
  } else if (draft.operation === 'update' && draft.entityId) {
    // If slug changed and conflicts with existing (not self), throw error
    const existingSlugCheck = await tx
      .select({ id: capabilitySubtype.id })
      .from(capabilitySubtype)
      .where(
        and(
          eq(capabilitySubtype.slug, rawData.slug),
          sql`${capabilitySubtype.id} != ${draft.entityId}`,
        ),
      )
      .limit(1)

    if (existingSlugCheck.length > 0) {
      throw new Error(
        `A capability subtype with slug "${rawData.slug}" already exists. Use a different slug.`,
      )
    }

    await tx
      .update(capabilitySubtype)
      .set(values)
      .where(eq(capabilitySubtype.id, draft.entityId))
  }
}

// Helper function to apply job changes
async function applyJobChange(draft: any, tx: any = dbClient()) {
  const data = draft.data as {
    slug: string
    name: string
    category: string
    description: string
    icon?: string
    automationRiskPercentage?: number
    riskLevel?: string
    timelineEstimate?: string
    confidence?: string
    tasks?: Array<{
      id?: string
      name: string
      percentageOfJob: number
      automatable: string
      reason?: string
      capabilityMappings?: Array<{
        id?: string
        capabilitySubtypeId: string
        importance: string
        minimumLevelRequired: number
        notes?: string
      }>
    }>
  }

  let jobId: string

  if (draft.operation === 'create') {
    const id = crypto.randomUUID()
    jobId = id
    await tx.insert(job).values({
      id,
      slug: data.slug,
      name: data.name,
      category: data.category as any,
      description: data.description,
      icon: data.icon || null,
      automationRiskPercentage: data.automationRiskPercentage || 0,
      riskLevel: (data.riskLevel as any) || 'low',
      timelineEstimate: data.timelineEstimate || null,
      confidence: (data.confidence as any) || 'medium',
    })
  } else if (draft.operation === 'update' && draft.entityId) {
    jobId = draft.entityId
    await tx
      .update(job)
      .set({
        slug: data.slug,
        name: data.name,
        category: data.category as any,
        description: data.description,
        icon: data.icon || null,
        automationRiskPercentage: data.automationRiskPercentage || 0,
        riskLevel: (data.riskLevel as any) || 'low',
        timelineEstimate: data.timelineEstimate || null,
        confidence: (data.confidence as any) || 'medium',
      })
      .where(eq(job.id, draft.entityId))
  } else {
    return
  }

  // Handle tasks if provided
  if (data.tasks && data.tasks.length > 0) {
    for (const taskData of data.tasks) {
      let taskId: string

      // Handle task creation or update
      if (taskData.id) {
        // Update existing task
        taskId = taskData.id
        await tx
          .update(task)
          .set({
            name: taskData.name,
            percentageOfJob: taskData.percentageOfJob,
            automatable: taskData.automatable as any,
            reason: taskData.reason || null,
          })
          .where(eq(task.id, taskData.id))
      } else {
        // Create new task
        taskId = crypto.randomUUID()
        await tx.insert(task).values({
          id: taskId,
          jobId,
          name: taskData.name,
          percentageOfJob: taskData.percentageOfJob,
          automatable: taskData.automatable as any,
          reason: taskData.reason || null,
        })
      }

      // Handle capability mappings for the task
      if (
        taskData.capabilityMappings &&
        taskData.capabilityMappings.length > 0
      ) {
        for (const mappingData of taskData.capabilityMappings) {
          if (mappingData.id) {
            // Update existing mapping
            await tx
              .update(taskCapabilitySubtype)
              .set({
                capabilitySubtypeId: mappingData.capabilitySubtypeId,
                importance: mappingData.importance as any,
                minimumLevelRequired: mappingData.minimumLevelRequired,
                notes: mappingData.notes || null,
              })
              .where(eq(taskCapabilitySubtype.id, mappingData.id))
          } else {
            // Create new mapping
            await tx.insert(taskCapabilitySubtype).values({
              id: crypto.randomUUID(),
              taskId,
              capabilitySubtypeId: mappingData.capabilitySubtypeId,
              importance: mappingData.importance as any,
              minimumLevelRequired: mappingData.minimumLevelRequired,
              notes: mappingData.notes || null,
            })
          }
        }
      }
    }
  }
}

// Helper function to apply organization changes
async function applyOrganizationChange(draft: any, tx: any = dbClient()) {
  const rawData = draft.data

  // Handle both camelCase and snake_case field names from drafts
  const types = rawData.types || []
  const foundedYear = rawData.foundedYear || null

  const values = {
    slug: rawData.slug,
    name: rawData.name,
    description: rawData.description,
    website: rawData.website || null,
    logo: rawData.logo || null,
    types,
    foundedYear,
  }

  if (draft.operation === 'create') {
    // Check if slug already exists
    const existing = await tx
      .select({ id: organization.id })
      .from(organization)
      .where(eq(organization.slug, rawData.slug))
      .limit(1)

    if (existing.length > 0) {
      throw new Error(
        `An organization with slug "${rawData.slug}" already exists. Use a unique slug or update the existing one instead.`,
      )
    }

    const id = crypto.randomUUID()
    await tx.insert(organization).values({
      id,
      ...values,
      // Set defaults for non-submitted fields
      isSponsor: false,
      sponsorTier: 'none',
      isClaimed: false,
      verifiedBadge: false,
    })
  } else if (draft.operation === 'update' && draft.entityId) {
    // Check if slug conflicts with another existing organization
    const existingSlugCheck = await tx
      .select({ id: organization.id })
      .from(organization)
      .where(
        and(
          eq(organization.slug, rawData.slug),
          sql`${organization.id} != ${draft.entityId}`,
        ),
      )
      .limit(1)

    if (existingSlugCheck.length > 0) {
      throw new Error(
        `An organization with slug "${rawData.slug}" already exists. Use a different slug.`,
      )
    }

    await tx
      .update(organization)
      .set(values)
      .where(eq(organization.id, draft.entityId))
  }
}

// Helper function to apply technology changes
async function applyTechnologyChange(draft: any, tx: any = dbClient()) {
  const rawData = draft.data

  // Handle both camelCase and snake_case field names from drafts
  const organizationId = rawData.organizationId || rawData.organization_id
  const stage = rawData.stage || 'research'

  if (!organizationId) {
    throw new Error('organizationId is required')
  }

  if (draft.operation === 'create') {
    // Check if slug already exists
    const existing = await tx
      .select({ id: technology.id })
      .from(technology)
      .where(eq(technology.slug, rawData.slug))
      .limit(1)

    if (existing.length > 0) {
      throw new Error(
        `A technology with slug "${rawData.slug}" already exists. Use a unique slug or update the existing one instead.`,
      )
    }

    const id = crypto.randomUUID()
    await tx.insert(technology).values({
      id,
      slug: rawData.slug,
      name: rawData.name,
      type: rawData.type,
      description: rawData.description,
      image: rawData.image || null,
      website: rawData.website || null,
      organizationId,
      stage: stage || 'research',
      releaseDate: rawData.releaseDate || null,
      status: 'approved' as const,
      submittedBy: draft.submittedBy?.id as string,
      aliases: rawData.aliases || [],
    })
  } else if (draft.operation === 'update' && draft.entityId) {
    // Check if slug conflicts with another existing technology
    const existingSlugCheck = await tx
      .select({ id: technology.id })
      .from(technology)
      .where(
        and(
          eq(technology.slug, rawData.slug),
          sql`${technology.id} != ${draft.entityId}`,
        ),
      )
      .limit(1)

    if (existingSlugCheck.length > 0) {
      throw new Error(
        `A technology with slug "${rawData.slug}" already exists. Use a different slug.`,
      )
    }

    await tx
      .update(technology)
      .set({
        slug: rawData.slug,
        name: rawData.name,
        type: rawData.type,
        description: rawData.description,
        image: rawData.image || null,
        website: rawData.website || null,
        organizationId,
        stage: stage || 'research',
        releaseDate: rawData.releaseDate || null,
        aliases: rawData.aliases || [],
      })
      .where(eq(technology.id, draft.entityId))
  }
}

// Create draft change
export const createDraftChangeFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      entityType: z.enum([
        'capability',
        'capability_subtype',
        'job',
        'organization',
        'technology',
      ]),
      operation: z.enum(['create', 'update', 'delete']),
      entityId: z.string().optional(),
      data: z.record(z.string(), z.any()),
      reason: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    const auth = getAuth()
    const session = await auth.api.getSession({ headers })

    if (!session) {
      return {
        success: false,
        error: 'Authentication required',
      }
    }

    const id = crypto.randomUUID()
    const db = dbClient()
    await db.insert(draftChange).values({
      id,
      entityType: data.entityType,
      operation: data.operation,
      entityId: data.entityId || null,
      data: data.data,
      reason: data.reason || null,
      status: 'pending',
      submittedBy: session.user.id,
    })

    return {
      success: true,
      id,
    }
  })
