import { sql } from "drizzle-orm";
import { integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// ============================================
// ENUMS (from restructure doc)
// ============================================

export const capabilityCategoryEnum = pgEnum("capability_category", [
  "physical",
  "cognitive",
  "social",
  "meta",
]);

export const capabilityStatusEnum = pgEnum("capability_status", [
  "solved",
  "partial",
  "unsolved",
]);

// Type exports
export type CapabilityCategory = "physical" | "cognitive" | "social" | "meta";
export type CapabilityStatus = "solved" | "partial" | "unsolved";

// ============================================
// CAPABILITY
// ============================================

export const capability = pgTable("capability", {
  // Identity
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),

  // Category (enum, not FK)
  category: capabilityCategoryEnum("category").notNull(),

  // Content
  description: text("description").notNull(), // 2-3 sentences
  icon: text("icon"),

  // Status
  progressPercentage: integer("progress_percentage").notNull().default(0),
  status: capabilityStatusEnum("status").notNull(),

  // Analysis
  whatWorks: text("what_works").array().notNull().default(sql`ARRAY[]::text[]`),
  whatStruggles: text("what_struggles")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  whatDoesntWork: text("what_doesnt_work")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),

  // Meta
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ============================================
// REMOVED per restructure doc:
// - capabilityCategory table (now enum)
// - capabilityTracking table
// - technicalDescription
// - whyItMatters
// - confidenceLevel
// - timelineEstimate
// - expertConsensus
// - communityPredictionMedian
// - reasoning
// - jobsProtectedCount
// - jobsProtectedExamples
// - researchActivityCount
// - recentBreakthroughDate
// - viewCount
// - trackingCount
// ============================================
