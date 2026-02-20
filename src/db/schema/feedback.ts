import { pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

import { user } from './auth'

// ============================================
// ENUMS
// ============================================

export const feedbackTypeEnum = pgEnum('feedback_type', [
  'general',
  'bug',
  'feature',
  'improvement',
])

export const feedbackRatingEnum = pgEnum('feedback_rating', [
  '1',
  '2',
  '3',
  '4',
  '5',
])

// Type exports
export type FeedbackType = 'general' | 'bug' | 'feature' | 'improvement'
export type FeedbackRating = '1' | '2' | '3' | '4' | '5'

// ============================================
// FEEDBACK
// ============================================
// User feedback for the platform

export const feedback = pgTable('feedback', {
  // Identity
  id: text('id').primaryKey(),

  // Core Info
  content: text('content').notNull(),
  type: feedbackTypeEnum('type').notNull().default('general'),
  rating: feedbackRatingEnum('rating'), // Optional 1-5 rating

  // Submitter
  userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
  email: text('email'), // Optional, for follow-up if not logged in

  // Admin fields
  reviewed: text('reviewed').default('false').notNull(), // "true" | "false" as text
  reviewedBy: text('reviewed_by').references(() => user.id, {
    onDelete: 'set null',
  }),
  reviewedAt: timestamp('reviewed_at'),
  adminNotes: text('admin_notes'), // Private admin notes

  // Meta
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})
