import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

import { user } from './auth'

// ============================================
// ENUMS (from restructure doc)
// ============================================

export const entityTypeEnum = pgEnum('entity_type', [
  'organization',
  'technology',
  'capability',
  'capability_subtype', // NEW v3.0
  'job',
  'impact_report',
])

// Type exports
export type EntityType =
  | 'organization'
  | 'technology'
  | 'capability'
  | 'capability_subtype'
  | 'job'
  | 'impact_report'

// ============================================
// DISCUSSION
// ============================================
// Reddit-style threaded conversations on any entity

export const discussion = pgTable('discussion', {
  // Identity
  id: text('id').primaryKey(),

  // Core Info
  title: text('title'), // For top-level threads only
  body: text('body').notNull(),
  isTopLevel: boolean('is_top_level').notNull().default(true),

  // Attachment (which entity this belongs to)
  entityType: entityTypeEnum('entity_type').notNull(),
  entityId: text('entity_id').notNull(),

  // Threading
  parentId: text('parent_id').references((): any => discussion.id, {
    onDelete: 'cascade',
  }),
  depth: integer('depth').notNull().default(0), // 0, 1, 2 — max 3 levels

  // Author
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  isAnonymous: boolean('is_anonymous').notNull().default(false),

  // Engagement
  upvotes: integer('upvotes').notNull().default(0),
  downvotes: integer('downvotes').notNull().default(0),
  replyCount: integer('reply_count').notNull().default(0),

  // Moderation (post-moderation)
  isDeleted: boolean('is_deleted').notNull().default(false),
  deletedBy: text('deleted_by').references(() => user.id, {
    onDelete: 'set null',
  }),
  deleteReason: text('delete_reason'),

  // Meta
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})
