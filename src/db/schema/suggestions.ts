import { pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

import { user } from './auth'

// ============================================
// ENUMS (from restructure doc)
// ============================================

export const suggestionTypeEnum = pgEnum('suggestion_type', [
  'job',
  'capability',
  'capability_subtype', // NEW v3.0
  'task', // NEW v3.0
  'organization',
])

export const suggestionStatusEnum = pgEnum('suggestion_status', [
  'pending',
  'accepted',
  'rejected',
])

// Type exports
export type SuggestionType =
  | 'job'
  | 'capability'
  | 'capability_subtype'
  | 'task'
  | 'organization'
export type SuggestionStatus = 'pending' | 'accepted' | 'rejected'

// ============================================
// SUGGESTION
// ============================================
// User suggestions for admin-only entities

export const suggestion = pgTable('suggestion', {
  // Identity
  id: text('id').primaryKey(),

  // Core Info
  type: suggestionTypeEnum('type').notNull(),
  suggestedName: text('suggested_name').notNull(),
  reason: text('reason').notNull(), // Why should we add this?
  additionalInfo: text('additional_info'), // Optional extra context

  // Submitter
  userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
  email: text('email'), // Optional, for follow-up if not logged in

  // Status
  status: suggestionStatusEnum('status').notNull().default('pending'),
  reviewedBy: text('reviewed_by').references(() => user.id, {
    onDelete: 'set null',
  }),
  reviewedAt: timestamp('reviewed_at'),
  response: text('response'), // Admin response to user

  // Meta
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})
