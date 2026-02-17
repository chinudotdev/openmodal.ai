import { sql } from 'drizzle-orm'
import { integer, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

// ============================================
// ENUMS (from restructure doc)
// ============================================

export const capabilityCategoryEnum = pgEnum('capability_category', [
  'physical',
  'cognitive',
  'social',
  'meta',
])

export const capabilityStatusEnum = pgEnum('capability_status', [
  'solved',
  'partial',
  'unsolved',
])

// Type exports
export type CapabilityCategory = 'physical' | 'cognitive' | 'social' | 'meta'
export type CapabilityStatus = 'solved' | 'partial' | 'unsolved'

// ============================================
// CAPABILITY (Parent)
// ============================================
// Broad categories of what AI can/can't do
// Progress tracking moved to subtypes - parent shows aggregate/average

export const capability = pgTable('capability', {
  // Identity
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(), // e.g., "Reasoning", "Image Recognition"

  // Category (enum, not FK)
  category: capabilityCategoryEnum('category').notNull(),

  // Content
  description: text('description').notNull(), // 2-3 sentences
  icon: text('icon'),

  // Meta
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

// ============================================
// CAPABILITY SUBTYPE (NEW - v3.0)
// ============================================
// Domain-specific capabilities with individual progress tracking
// e.g., "Medical Reasoning", "Legal Reasoning" under parent "Reasoning"

export const capabilitySubtype = pgTable('capability_subtype', {
  // Identity
  id: text('id').primaryKey(),
  capabilityId: text('capability_id')
    .notNull()
    .references(() => capability.id, { onDelete: 'cascade' }),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(), // e.g., "Medical Reasoning", "Legal Reasoning"
  domain: text('domain').notNull(), // e.g., "healthcare", "legal", "finance", "technology"
  description: text('description').notNull(), // 2-3 sentences

  // Progress Tracking
  progressPercentage: integer('progress_percentage').notNull().default(0), // 0-100
  status: capabilityStatusEnum('status').notNull(),
  whatWorks: text('what_works')
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  whatStruggles: text('what_struggles')
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  whatDoesntWork: text('what_doesnt_work')
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),

  // Meta
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})
