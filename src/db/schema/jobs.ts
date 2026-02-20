import { integer, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

import { capabilitySubtype } from './capabilities'

// ============================================
// ENUMS (from restructure doc)
// ============================================

export const jobCategoryEnum = pgEnum('job_category', [
  'healthcare',
  'technology',
  'trades',
  'service',
  'creative',
  'finance',
  'education',
  'legal',
  'manufacturing',
  'other',
])

export const riskLevelEnum = pgEnum('risk_level', [
  'low', // 0-25%
  'medium', // 26-50%
  'high', // 51-75%
  'critical', // 76-100%
])

export const confidenceEnum = pgEnum('confidence', ['low', 'medium', 'high'])

export const automatableEnum = pgEnum('automatable', ['yes', 'partial', 'no'])

export const importanceLevelEnum = pgEnum('importance_level', [
  'critical',
  'important',
  'minor',
])

// Type exports
export type JobCategory =
  | 'healthcare'
  | 'technology'
  | 'trades'
  | 'service'
  | 'creative'
  | 'finance'
  | 'education'
  | 'legal'
  | 'manufacturing'
  | 'other'
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type Confidence = 'low' | 'medium' | 'high'
export type Automatable = 'yes' | 'partial' | 'no'
export type ImportanceLevel = 'critical' | 'important' | 'minor'

// ============================================
// JOB
// ============================================

export const job = pgTable('job', {
  // Identity
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),

  // Category (enum, not FK)
  category: jobCategoryEnum('category').notNull(),

  // Content
  description: text('description').notNull(), // 2-3 sentences
  icon: text('icon'),

  // Risk Assessment
  automationRiskPercentage: integer('automation_risk_percentage')
    .notNull()
    .default(0),
  riskLevel: riskLevelEnum('risk_level').notNull(),
  timelineEstimate: text('timeline_estimate'), // "5-10 years", "unlikely"
  confidence: confidenceEnum('confidence').notNull().default('medium'),

  // Meta
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

// ============================================
// TASK (Job Breakdown)
// ============================================

export const task = pgTable('task', {
  id: text('id').primaryKey(),
  jobId: text('job_id')
    .notNull()
    .references(() => job.id, { onDelete: 'cascade' }),

  // Task details (simplified per restructure)
  name: text('name').notNull(),
  percentageOfJob: integer('percentage_of_job').notNull(), // 0-100
  automatable: automatableEnum('automatable').notNull(),
  reason: text('reason'), // 1 sentence why

  // Meta
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

// ============================================
// TASK_CAPABILITY_SUBTYPE (Junction - NEW v3.0)
// ============================================
// Links tasks to capability subtypes with importance and minimum level required
// Replaces task_capability - now links to subtypes instead of parent capabilities

export const taskCapabilitySubtype = pgTable('task_capability_subtype', {
  id: text('id').primaryKey(),
  taskId: text('task_id')
    .notNull()
    .references(() => task.id, { onDelete: 'cascade' }),
  capabilitySubtypeId: text('capability_subtype_id')
    .notNull()
    .references(() => capabilitySubtype.id, { onDelete: 'cascade' }),
  importance: importanceLevelEnum('importance').notNull(), // critical, important, minor
  minimumLevelRequired: integer('minimum_level_required').notNull().default(0), // 0-100, what progress % needed for automation
  notes: text('notes'), // why this subtype matters for this task
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ============================================
// REMOVED per restructure doc v3.0:
// - task_capability (replaced with task_capability_subtype)
// - job_capability (now derived from task → capability_subtype chain)
// ============================================
