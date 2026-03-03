import { jsonb, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

import { user } from './auth'

// ============================================
// ENUMS
// ============================================

export const draftChangeTypeEnum = pgEnum('draft_change_type', [
  'capability',
  'capability_subtype',
  'job',
  'organization',
  'technology',
])

export const draftChangeStatusEnum = pgEnum('draft_change_status', [
  'pending',
  'approved',
  'rejected',
])

export const draftChangeOperationEnum = pgEnum('draft_change_operation', [
  'create',
  'update',
  'delete',
])

// Type exports
export type DraftChangeType =
  | 'capability'
  | 'capability_subtype'
  | 'job'
  | 'organization'
  | 'technology'
export type DraftChangeStatus = 'pending' | 'approved' | 'rejected'
export type DraftChangeOperation = 'create' | 'update' | 'delete'

// ============================================
// DRAFT CHANGE
// ============================================

export const draftChange = pgTable('draft_change', {
  // Identity
  id: text('id').primaryKey(),

  // Type and Operation
  entityType: draftChangeTypeEnum('entity_type').notNull(),
  operation: draftChangeOperationEnum('operation').notNull(), // create, update, delete

  // Entity Reference (for updates/deletes)
  entityId: text('entity_id'), // References capability.id, capability_subtype.id, or job.id (job includes tasks and task_capability_subtype)

  // Proposed Data (JSONB for flexibility)
  data: jsonb('data').notNull(), // Contains the full proposed entity data

  // Status and Review
  status: draftChangeStatusEnum('status').notNull().default('pending'),
  submittedBy: text('submitted_by')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  reviewedBy: text('reviewed_by').references(() => user.id, {
    onDelete: 'set null',
  }),
  reviewedAt: timestamp('reviewed_at'),
  response: text('response'), // Admin response to submitter

  // Reason/Comment for the change
  reason: text('reason'), // Why this change is being proposed

  // Meta
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})
