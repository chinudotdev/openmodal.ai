import { sql } from 'drizzle-orm'
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

export const sponsorTierEnum = pgEnum('sponsor_tier', [
  'none',
  'bronze',
  'silver',
  'gold',
])

// Type exports
export type OrganizationType =
  | 'ai_lab'
  | 'robotics'
  | 'enterprise_software'
  | 'startup'
  | 'research_institution'
export type SponsorTier = 'none' | 'bronze' | 'silver' | 'gold'

// ============================================
// ORGANIZATION
// ============================================

export const organization = pgTable('organization', {
  // Identity
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),

  // Types (can have multiple - e.g., "ai_lab" + "robotics")
  types: text('types')
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),

  // Content
  description: text('description').notNull(), // 2-3 sentences
  website: text('website'),
  logo: text('logo'), // image_url
  foundedYear: integer('founded_year'),

  // Sponsorship
  isSponsor: boolean('is_sponsor').notNull().default(false),
  sponsorTier: sponsorTierEnum('sponsor_tier').notNull().default('none'),
  isClaimed: boolean('is_claimed').notNull().default(false),
  verifiedBadge: boolean('verified_badge').notNull().default(false),

  // Meta
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})
