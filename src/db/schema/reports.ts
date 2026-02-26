import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

import { user } from './auth'
import { technology } from './technologies'
import { companySizeEnum } from './user-profile'

// ============================================
// ENUMS (from restructure doc v3.0)
// ============================================

// Changed from ["pending", "approved", "rejected"] - no approval workflow!
export const reportStatusEnum = pgEnum('report_status', [
  'published', // Instant publish - no moderator approval needed
  'flagged', // Auto-hidden after 3+ flags
  'removed', // Moderator removed after review
])

export const impactTypeEnum = pgEnum('impact_type', [
  'layoffs',
  'reduced_hours',
  'role_change',
  'new_tools', // AI assists but doesn't replace
  'productivity_boost',
  'no_change',
])

export const reporterRelationshipEnum = pgEnum('reporter_relationship', [
  'employee',
  'former_employee',
  'manager',
  'witness',
  'news',
  'researcher',
])

export const enrichmentTypeEnum = pgEnum('enrichment_type', [
  'job_link',
  'technology_link',
  'task_link',
  'capability_subtype_link',
])

export const enrichmentConfidenceEnum = pgEnum('enrichment_confidence', [
  'certain',
  'likely',
  'guess',
])

export const flagReasonEnum = pgEnum('flag_reason', [
  'spam',
  'fake',
  'duplicate',
  'inappropriate',
  'other',
])

// Type exports
export type ReportStatus = 'published' | 'flagged' | 'removed'
export type ImpactType =
  | 'layoffs'
  | 'reduced_hours'
  | 'role_change'
  | 'new_tools'
  | 'productivity_boost'
  | 'no_change'
export type ReporterRelationship =
  | 'employee'
  | 'former_employee'
  | 'manager'
  | 'witness'
  | 'news'
  | 'researcher'
export type EnrichmentType =
  | 'job_link'
  | 'technology_link'
  | 'task_link'
  | 'capability_subtype_link'
export type EnrichmentConfidence = 'certain' | 'likely' | 'guess'
export type FlagReason =
  | 'spam'
  | 'fake'
  | 'duplicate'
  | 'inappropriate'
  | 'other'

// ============================================
// IMPACT REPORT (The Moat - SIMPLIFIED v3.0)
// ============================================
// Philosophy: Low friction for users, instant publish, community enrichment for structure
// Only 3 required fields: job_title, description, impact_type

export const impactReport = pgTable('impact_report', {
  // Identity
  id: text('id').primaryKey(),

  // Required Fields (3 fields minimum!)
  jobTitle: text('job_title').notNull(), // Freetext - what they call their job
  description: text('description').notNull(), // Their story, 100+ chars
  impactType: impactTypeEnum('impact_type').notNull(),

  // Optional Fields (user can skip all)
  title: text('title'), // Optional short summary (story-first approach)
  location: text('location'), // City, state
  country: text('country'),
  companyName: text('company_name'),
  companySize: companySizeEnum('company_size'),
  technologyDescription: text('technology_description'), // Freetext - "some chatbot", "robot arms"
  workersAffectedCount: integer('workers_affected_count'),
  eventDate: timestamp('event_date'), // When it happened
  sourceUrl: text('source_url'), // News link if available

  // Optional connection (technology linked via enrichment is preferred)
  technologyId: text('technology_id').references(() => technology.id, {
    onDelete: 'set null',
  }),

  // Submitter
  submittedBy: text('submitted_by')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  isAnonymous: boolean('is_anonymous').notNull().default(false),
  reporterRelationship: reporterRelationshipEnum('reporter_relationship'),

  // Status (NO PENDING! Instant publish)
  status: reportStatusEnum('status').notNull().default('published'),

  // Engagement
  upvotes: integer('upvotes').notNull().default(0),
  viewCount: integer('view_count').notNull().default(0),
  isFeatured: boolean('is_featured').notNull().default(false),

  // Meta
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

// ============================================
// REPORT ENRICHMENT (NEW v3.0)
// ============================================
// Community-added structured data linking reports to entities
// How it works:
// 1. User submits simple report (3 fields)
// 2. Report publishes immediately
// 3. Community members add enrichments linking to jobs, technologies, tasks, etc.
// 4. Others vote on accuracy
// 5. High-voted enrichments become trusted links

export const reportEnrichment = pgTable('report_enrichment', {
  id: text('id').primaryKey(),
  reportId: text('report_id')
    .notNull()
    .references(() => impactReport.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),

  // Link Type
  enrichmentType: enrichmentTypeEnum('enrichment_type').notNull(),
  linkedEntityId: text('linked_entity_id'), // Optional - if entity exists in system
  suggestedName: text('suggested_name'), // Freetext if entity doesn't exist yet

  // Confidence
  confidence: enrichmentConfidenceEnum('confidence').notNull(),
  notes: text('notes'),

  // Voting
  upvotes: integer('upvotes').notNull().default(0),
  downvotes: integer('downvotes').notNull().default(0),

  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ============================================
// REPORT FLAG (NEW v3.0)
// ============================================
// Community flagging for moderation
// Auto-Moderation: 3+ flags → auto-hide report, notify moderator
// Moderator only handles flagged content (reactive, not proactive)

export const reportFlag = pgTable('report_flag', {
  id: text('id').primaryKey(),
  reportId: text('report_id')
    .notNull()
    .references(() => impactReport.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),

  // Flag Details
  reason: flagReasonEnum('reason').notNull(),
  notes: text('notes'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ============================================
// REMOVED per restructure doc v3.0:
// - impact_report_capability (replaced with report_enrichment)
// - reviewed_by, reviewed_at (no approval workflow)
// - verification_status enum (trust signals instead)
// - rejection_reason (no approval workflow)
// - job_id direct link (use enrichment instead)
// ============================================
