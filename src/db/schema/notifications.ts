import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core'
import { user } from './auth'

// ============================================
// ENUMS
// ============================================

export const notificationTypeEnum = pgEnum('notification_type', [
  'report_verified', // Report was verified
  'report_approved', // Report was approved
  'report_rejected', // Report was rejected
  'report_changes_requested', // Moderator requested changes
  'comment_reply', // Reply to comment
  'reputation_milestone', // Reached new tier
  'capability_breakthrough', // New capability breakthrough
  'verification_received', // Someone verified your report
  'dispute_received', // Someone disputed your report
  'moderation_assigned', // Assigned to moderate (for moderators)
  'badge_earned', // Badge earned
  'streak_milestone', // Streak milestone reached
  'role_eligible', // Eligible for role promotion
  'application_status', // Expert/Moderator application status update
])

// Type exports
export type NotificationType =
  | 'report_verified'
  | 'report_approved'
  | 'report_rejected'
  | 'report_changes_requested'
  | 'comment_reply'
  | 'reputation_milestone'
  | 'capability_breakthrough'
  | 'verification_received'
  | 'dispute_received'
  | 'moderation_assigned'
  | 'badge_earned'
  | 'streak_milestone'
  | 'role_eligible'
  | 'application_status'

// ============================================
// 1. NOTIFICATION TABLE
// ============================================

export const notification = pgTable('notification', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  type: notificationTypeEnum('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  read: boolean('read').notNull().default(false),
  // Action URL (where to navigate when clicked)
  actionUrl: text('action_url'), // e.g., "/reports/123" or "/dashboard"
  // Related entity (for context)
  relatedEntityType: text('related_entity_type'), // "report", "comment", "verification", etc.
  relatedEntityId: text('related_entity_id'), // ID of related entity
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  readAt: timestamp('read_at'),
})

// ============================================
// 2. NOTIFICATION PREFERENCE TABLE
// ============================================

export const notificationPreference = pgTable(
  'notification_preference',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    notificationType: notificationTypeEnum('notification_type').notNull(),
    enabled: boolean('enabled').notNull().default(true),
    emailEnabled: boolean('email_enabled').notNull().default(true),
    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    // Unique constraint on userId + notificationType
    userIdTypeUnique: unique().on(table.userId, table.notificationType),
  }),
)
