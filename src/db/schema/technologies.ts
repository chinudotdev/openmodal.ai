import { sql } from 'drizzle-orm'
import { integer, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

import { user } from './auth'
import { capabilitySubtype } from './capabilities'
import { organization } from './organizations'

// ============================================
// ENUMS (from restructure doc)
// ============================================

export const technologyTypeEnum = pgEnum('technology_type', [
  'ai_model',
  'robot',
  'software',
  'hardware',
  'api',
])

export const technologyStageEnum = pgEnum('technology_stage', [
  'research',
  'pilot',
  'deployed',
  'discontinued',
])

export const submissionStatusEnum = pgEnum('submission_status', [
  'pending',
  'approved',
  'rejected',
])

// Type exports
export type TechnologyType =
  | 'ai_model'
  | 'robot'
  | 'software'
  | 'hardware'
  | 'api'
export type TechnologyStage = 'research' | 'pilot' | 'deployed' | 'discontinued'
export type SubmissionStatus = 'pending' | 'approved' | 'rejected'

// ============================================
// TECHNOLOGY
// ============================================

export const technology = pgTable('technology', {
  // Identity
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),

  // Type
  type: technologyTypeEnum('type').notNull(),

  // Content
  description: text('description').notNull(), // 2-3 sentences
  image: text('image'), // image_url
  website: text('website'),

  // Organization
  organizationId: text('organization_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),

  // Status
  stage: technologyStageEnum('stage').notNull(),
  releaseDate: timestamp('release_date'),

  // Submission (user-submitted, requires approval)
  status: submissionStatusEnum('status').notNull().default('pending'),
  submittedBy: text('submitted_by')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  reviewedBy: text('reviewed_by').references(() => user.id, {
    onDelete: 'set null',
  }),
  reviewedAt: timestamp('reviewed_at'),
  rejectionReason: text('rejection_reason'),

  // Duplicate Prevention
  aliases: text('aliases')
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  mergedIntoId: text('merged_into_id').references((): any => technology.id, {
    onDelete: 'set null',
  }),

  // Meta
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

// ============================================
// TECHNOLOGY_CAPABILITY_SUBTYPE (Junction - NEW v3.0)
// ============================================
// Links technologies to capability subtypes (replaces technology_capability)
// Jobs are now derived via: technology → capability_subtype → task → job

export const technologyCapabilitySubtype = pgTable(
  'technology_capability_subtype',
  {
    id: text('id').primaryKey(),
    technologyId: text('technology_id')
      .notNull()
      .references(() => technology.id, { onDelete: 'cascade' }),
    capabilitySubtypeId: text('capability_subtype_id')
      .notNull()
      .references(() => capabilitySubtype.id, { onDelete: 'cascade' }),
    performanceScore: integer('performance_score'), // 0-100, how well the technology performs this capability
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
)

// ============================================
// REMOVED per restructure doc v3.0:
// - technology_capability (replaced with technology_capability_subtype)
// - technology_job (now derived from capability chain)
// ============================================
