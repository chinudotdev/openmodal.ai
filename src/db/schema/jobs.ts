import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { capability } from "./capabilities";

// ============================================
// ENUMS (from restructure doc)
// ============================================

export const jobCategoryEnum = pgEnum("job_category", [
  "healthcare",
  "technology",
  "trades",
  "service",
  "creative",
  "finance",
  "education",
  "legal",
  "manufacturing",
  "other",
]);

export const riskLevelEnum = pgEnum("risk_level", [
  "low", // 0-25%
  "medium", // 26-50%
  "high", // 51-75%
  "critical", // 76-100%
]);

export const confidenceEnum = pgEnum("confidence", ["low", "medium", "high"]);

export const automatableEnum = pgEnum("automatable", ["yes", "partial", "no"]);

export const importanceLevelEnum = pgEnum("importance_level", [
  "critical",
  "important",
  "minor",
]);

// Type exports
export type JobCategory =
  | "healthcare"
  | "technology"
  | "trades"
  | "service"
  | "creative"
  | "finance"
  | "education"
  | "legal"
  | "manufacturing"
  | "other";
export type RiskLevel = "low" | "medium" | "high" | "critical";
export type Confidence = "low" | "medium" | "high";
export type Automatable = "yes" | "partial" | "no";
export type ImportanceLevel = "critical" | "important" | "minor";

// ============================================
// JOB
// ============================================

export const job = pgTable("job", {
  // Identity
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),

  // Category (enum, not FK)
  category: jobCategoryEnum("category").notNull(),

  // Content
  description: text("description").notNull(), // 2-3 sentences
  icon: text("icon"),

  // Risk Assessment
  automationRiskPercentage: integer("automation_risk_percentage")
    .notNull()
    .default(0),
  riskLevel: riskLevelEnum("risk_level").notNull(),
  timelineEstimate: text("timeline_estimate"), // "5-10 years", "unlikely"
  confidence: confidenceEnum("confidence").notNull().default("medium"),

  // Meta
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ============================================
// TASK (Job Breakdown)
// ============================================

export const task = pgTable("task", {
  id: text("id").primaryKey(),
  jobId: text("job_id")
    .notNull()
    .references(() => job.id, { onDelete: "cascade" }),

  // Task details (simplified per restructure)
  name: text("name").notNull(),
  percentageOfJob: integer("percentage_of_job").notNull(), // 0-100
  automatable: automatableEnum("automatable").notNull(),
  reason: text("reason"), // 1 sentence why

  // Meta
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ============================================
// TASK_CAPABILITY (Junction - for granular analysis)
// ============================================

export const taskCapability = pgTable("task_capability", {
  id: text("id").primaryKey(),
  taskId: text("task_id")
    .notNull()
    .references(() => task.id, { onDelete: "cascade" }),
  capabilityId: text("capability_id")
    .notNull()
    .references(() => capability.id, { onDelete: "cascade" }),
  importance: importanceLevelEnum("importance").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// JOB_CAPABILITY (Direct mapping for MVP)
// ============================================

export const jobCapability = pgTable("job_capability", {
  id: text("id").primaryKey(),
  jobId: text("job_id")
    .notNull()
    .references(() => job.id, { onDelete: "cascade" }),
  capabilityId: text("capability_id")
    .notNull()
    .references(() => capability.id, { onDelete: "cascade" }),
  importance: importanceLevelEnum("importance").notNull(),
  percentageOfJob: integer("percentage_of_job").notNull().default(0),
  blockingAutomation: boolean("blocking_automation").notNull().default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ============================================
// REMOVED per restructure doc:
// - industry table + FK (now category enum)
// - title (renamed to name)
// - shortDescription
// - keyResponsibilities
// - automationStatus (renamed to riskLevel)
// - totalTasks/tasksReplaceable/tasksPartial/tasksSafe
// - totalWorkersGlobal/totalWorkersUsa
// - medianSalaryUsa
// - growthOutlook/growthRate
// - blsOccCode
// - estimatedAutomationYear
// - metaDescription/metaKeywords
// - viewCount/trackingCount/reportCount
// - verified/lastReviewed
// - jobTracking table
// - relatedJob table
// - task.category
// - task.difficultyToAutomate
// - task.timeSpentHoursPerWeek
// - task.evidenceLinks
// - task.existingAiSolutions
// ============================================
