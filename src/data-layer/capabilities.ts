import { asc, desc, eq, ilike } from 'drizzle-orm'
import { nanoid } from 'nanoid'

import { dbClient } from '@/db'
import { capability, capabilitySubtype } from '@/db/schema/capabilities'
import { job, task, taskCapabilitySubtype } from '@/db/schema/jobs'
import { organization } from '@/db/schema/organizations'
import {
  technology,
  technologyCapabilitySubtype,
} from '@/db/schema/technologies'

// ============================================
// CAPABILITY QUERIES
// ============================================

export async function getAllCapabilities() {
  try {
    const db = dbClient()
    const capabilities = await db
      .select({
        id: capability.id,
        slug: capability.slug,
        name: capability.name,
        description: capability.description,
        icon: capability.icon,
        createdAt: capability.createdAt,
      })
      .from(capability)
      .orderBy(asc(capability.name))

    // Get subtype count and average progress for each capability
    const capabilitiesWithStats = await Promise.all(
      capabilities.map(async (cap) => {
        const subtypes = await getSubtypesByCapabilityId(cap.id)
        const avgProgress =
          subtypes.length > 0
            ? Math.round(
                subtypes.reduce((sum, s) => sum + s.progressPercentage, 0) /
                  subtypes.length,
              )
            : 0

        // Determine overall status based on average progress
        let status: 'solved' | 'partial' | 'unsolved' = 'unsolved'
        if (avgProgress >= 80) status = 'solved'
        else if (avgProgress >= 30) status = 'partial'

        return {
          ...cap,
          subtypesCount: subtypes.length,
          progress: avgProgress,
          status,
        }
      }),
    )

    return capabilitiesWithStats
  } catch (error) {
    console.error('Error fetching capabilities:', error)
    return []
  }
}

export async function getCapabilityBySlug(slug: string) {
  try {
    const db = dbClient()
    const result = await db
      .select()
      .from(capability)
      .where(eq(capability.slug, slug))
      .limit(1)

    return result[0] ?? null
  } catch (error) {
    console.error('Error fetching capability by slug:', error)
    return null
  }
}

export async function getCapabilityById(id: string) {
  try {
    const db = dbClient()
    const result = await db
      .select()
      .from(capability)
      .where(eq(capability.id, id))
      .limit(1)

    return result[0] ?? null
  } catch (error) {
    console.error('Error fetching capability by ID:', error)
    return null
  }
}

// ============================================
// CAPABILITY SUBTYPE QUERIES
// ============================================

export async function getAllSubtypes() {
  try {
    const db = dbClient()
    const subtypes = await db
      .select({
        id: capabilitySubtype.id,
        capabilityId: capabilitySubtype.capabilityId,
        slug: capabilitySubtype.slug,
        name: capabilitySubtype.name,
        domain: capabilitySubtype.domain,
        description: capabilitySubtype.description,
        progressPercentage: capabilitySubtype.progressPercentage,
        status: capabilitySubtype.status,
        whatWorks: capabilitySubtype.whatWorks,
        whatStruggles: capabilitySubtype.whatStruggles,
        whatDoesntWork: capabilitySubtype.whatDoesntWork,
        createdAt: capabilitySubtype.createdAt,
        // Capability fields
        capability: {
          id: capability.id,
          slug: capability.slug,
          name: capability.name,
          description: capability.description,
          icon: capability.icon,
        },
      })
      .from(capabilitySubtype)
      .innerJoin(capability, eq(capabilitySubtype.capabilityId, capability.id))
      .orderBy(asc(capabilitySubtype.name))

    return subtypes
  } catch (error) {
    console.error('Error fetching subtypes:', error)
    return []
  }
}

export async function getSubtypeBySlug(slug: string) {
  try {
    const db = dbClient()
    const result = await db
      .select()
      .from(capabilitySubtype)
      .where(eq(capabilitySubtype.slug, slug))
      .limit(1)

    return result[0] ?? null
  } catch (error) {
    console.error('Error fetching subtype by slug:', error)
    return null
  }
}

export async function getSubtypesByCapabilityId(capabilityId: string) {
  try {
    const db = dbClient()
    const subtypes = await db
      .select({
        id: capabilitySubtype.id,
        capabilityId: capabilitySubtype.capabilityId,
        slug: capabilitySubtype.slug,
        name: capabilitySubtype.name,
        domain: capabilitySubtype.domain,
        description: capabilitySubtype.description,
        progressPercentage: capabilitySubtype.progressPercentage,
        status: capabilitySubtype.status,
        whatWorks: capabilitySubtype.whatWorks,
        whatStruggles: capabilitySubtype.whatStruggles,
        whatDoesntWork: capabilitySubtype.whatDoesntWork,
        createdAt: capabilitySubtype.createdAt,
      })
      .from(capabilitySubtype)
      .where(eq(capabilitySubtype.capabilityId, capabilityId))
      .orderBy(desc(capabilitySubtype.progressPercentage))

    return subtypes
  } catch (error) {
    console.error('Error fetching subtypes by capability ID:', error)
    return []
  }
}

export async function getSubtypesByDomain(domain: string) {
  try {
    const db = dbClient()
    const subtypes = await db
      .select()
      .from(capabilitySubtype)
      .where(ilike(capabilitySubtype.domain, `%${domain}%`))
      .orderBy(desc(capabilitySubtype.progressPercentage))

    return subtypes
  } catch (error) {
    console.error('Error fetching subtypes by domain:', error)
    return []
  }
}

// ============================================
// TECHNOLOGY QUERIES (for subtypes)
// ============================================

export async function getTechnologiesBySubtypeId(subtypeId: string) {
  try {
    const db = dbClient()
    const technologies = await db
      .select({
        id: technology.id,
        slug: technology.slug,
        name: technology.name,
        type: technology.type,
        description: technology.description,
        image: technology.image,
        website: technology.website,
        stage: technology.stage,
        organizationId: technology.organizationId,
        performanceScore: technologyCapabilitySubtype.performanceScore,
      })
      .from(technologyCapabilitySubtype)
      .innerJoin(
        technology,
        eq(technologyCapabilitySubtype.technologyId, technology.id),
      )
      .where(eq(technologyCapabilitySubtype.capabilitySubtypeId, subtypeId))
      .orderBy(desc(technologyCapabilitySubtype.performanceScore))

    return technologies
  } catch (error) {
    console.error('Error fetching technologies by subtype ID:', error)
    return []
  }
}

export function getReportCountForTechnology(_technologyId: string): number {
  // TODO: Implement when reports schema is ready
  // For now, return a mock count
  return 0
}

// ============================================
// JOB QUERIES (for subtypes)
// ============================================

export async function getJobsBySubtypeId(subtypeId: string) {
  try {
    const db = dbClient()
    // Get jobs through the task → task_capability_subtype relationship
    const jobs = await db
      .select({
        id: job.id,
        slug: job.slug,
        name: job.name,
        category: job.category,
        description: job.description,
        icon: job.icon,
        automationRiskPercentage: job.automationRiskPercentage,
        riskLevel: job.riskLevel,
        timelineEstimate: job.timelineEstimate,
        confidence: job.confidence,
        importance: taskCapabilitySubtype.importance,
        minimumLevelRequired: taskCapabilitySubtype.minimumLevelRequired,
      })
      .from(taskCapabilitySubtype)
      .innerJoin(task, eq(taskCapabilitySubtype.taskId, task.id))
      .innerJoin(job, eq(task.jobId, job.id))
      .where(eq(taskCapabilitySubtype.capabilitySubtypeId, subtypeId))
      .orderBy(desc(taskCapabilitySubtype.minimumLevelRequired))

    return jobs
  } catch (error) {
    console.error('Error fetching jobs by subtype ID:', error)
    return []
  }
}

// ============================================
// ORGANIZATION QUERIES (for capabilities)
// ============================================

export async function getOrganizationsBySubtypeId(subtypeId: string) {
  try {
    const db = dbClient()
    // Get organizations through technology → technology_capability_subtype
    const organizations = await db
      .select({
        id: organization.id,
        slug: organization.slug,
        name: organization.name,
        types: organization.types,
        description: organization.description,
        website: organization.website,
        logo: organization.logo,
        foundedYear: organization.foundedYear,
        isSponsor: organization.isSponsor,
        sponsorTier: organization.sponsorTier,
        productName: technology.name,
      })
      .from(technologyCapabilitySubtype)
      .innerJoin(
        technology,
        eq(technologyCapabilitySubtype.technologyId, technology.id),
      )
      .innerJoin(organization, eq(technology.organizationId, organization.id))
      .where(eq(technologyCapabilitySubtype.capabilitySubtypeId, subtypeId))
      .orderBy(desc(organization.sponsorTier), asc(organization.name))

    return organizations
  } catch (error) {
    console.error('Error fetching organizations by subtype ID:', error)
    return []
  }
}

// ============================================
// AGGREGATE QUERIES
// ============================================

export async function getOverallProgress() {
  try {
    const allSubtypes = await getAllSubtypes()
    if (allSubtypes.length === 0) return 0

    const totalProgress = allSubtypes.reduce(
      (sum, s) => sum + s.progressPercentage,
      0,
    )
    return Math.round(totalProgress / allSubtypes.length)
  } catch (error) {
    console.error('Error calculating overall progress:', error)
    return 0
  }
}

// ============================================
// ADMIN CAPABILITY OPERATIONS
// ============================================

export interface CreateCapabilityInput {
  name: string
  slug: string
  description: string
  icon?: string
}

export async function createCapability(input: CreateCapabilityInput) {
  try {
    const id = nanoid()
    const db = dbClient()
    const [newCapability] = await db
      .insert(capability)
      .values({
        id,
        slug: input.slug,
        name: input.name,
        description: input.description,
        icon: input.icon,
      })
      .returning()

    return newCapability
  } catch (error) {
    console.error('Error creating capability:', error)
    throw error
  }
}

export interface UpdateCapabilityInput {
  id: string
  name?: string
  slug?: string
  description?: string
  icon?: string
}

export async function updateCapability(input: UpdateCapabilityInput) {
  try {
    const { id, ...updates } = input
    const db = dbClient()
    const [updatedCapability] = await db
      .update(capability)
      .set(updates)
      .where(eq(capability.id, id))
      .returning()

    return updatedCapability
  } catch (error) {
    console.error('Error updating capability:', error)
    throw error
  }
}

export async function deleteCapability(id: string) {
  try {
    const db = dbClient()
    await db.delete(capability).where(eq(capability.id, id))
    return { success: true }
  } catch (error) {
    console.error('Error deleting capability:', error)
    throw error
  }
}

// ============================================
// ADMIN CAPABILITY SUBTYPE OPERATIONS
// ============================================

export interface CreateCapabilitySubtypeInput {
  capabilityId: string
  name: string
  slug: string
  domain: string
  description: string
  progressPercentage?: number
  status?: 'solved' | 'partial' | 'unsolved'
  whatWorks?: Array<string>
  whatStruggles?: Array<string>
  whatDoesntWork?: Array<string>
}

export async function createCapabilitySubtype(
  input: CreateCapabilitySubtypeInput,
) {
  try {
    const id = nanoid()
    const db = dbClient()
    const [newSubtype] = await db
      .insert(capabilitySubtype)
      .values({
        id,
        capabilityId: input.capabilityId,
        slug: input.slug,
        name: input.name,
        domain: input.domain,
        description: input.description,
        progressPercentage: input.progressPercentage ?? 0,
        status: input.status ?? 'unsolved',
        whatWorks: input.whatWorks ?? [],
        whatStruggles: input.whatStruggles ?? [],
        whatDoesntWork: input.whatDoesntWork ?? [],
      })
      .returning()

    return newSubtype
  } catch (error) {
    console.error('Error creating capability subtype:', error)
    throw error
  }
}

export interface UpdateCapabilitySubtypeInput {
  id: string
  name?: string
  slug?: string
  domain?: string
  description?: string
  progressPercentage?: number
  status?: 'solved' | 'partial' | 'unsolved'
  whatWorks?: Array<string>
  whatStruggles?: Array<string>
  whatDoesntWork?: Array<string>
}

export async function updateCapabilitySubtype(
  input: UpdateCapabilitySubtypeInput,
) {
  try {
    const { id, ...updates } = input
    const db = dbClient()
    const [updatedSubtype] = await db
      .update(capabilitySubtype)
      .set(updates)
      .where(eq(capabilitySubtype.id, id))
      .returning()

    return updatedSubtype
  } catch (error) {
    console.error('Error updating capability subtype:', error)
    throw error
  }
}

export async function deleteCapabilitySubtype(id: string) {
  try {
    const db = dbClient()
    await db.delete(capabilitySubtype).where(eq(capabilitySubtype.id, id))
    return { success: true }
  } catch (error) {
    console.error('Error deleting capability subtype:', error)
    throw error
  }
}
