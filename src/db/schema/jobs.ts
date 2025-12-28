import { sql } from "drizzle-orm";
import {
  boolean,
  decimal,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { capability } from "./capabilities"; // Import from your existing schema
import { industry } from "./industries";

// ============================================
// ENUMS
// ============================================

export const automationStatusEnum = pgEnum("automation_status", [
  "safe", // 0-25% automated
  "partial", // 26-75% automated
  "high_risk", // 76-99% automated
  "automated", // 100% automated
]);

export const taskAutomationStatusEnum = pgEnum("task_automation_status", [
  "safe", // Cannot be automated yet (capability unsolved)
  "partial", // Can be partially automated (capability partial)
  "replaceable", // Can be fully automated (capability solved)
]);

export const importanceLevelEnum = pgEnum("importance_level", [
  "critical", // Job cannot exist without this capability
  "important", // Significantly impacts job performance
  "minor", // Nice to have, but not essential
]);

export const difficultyLevelEnum = pgEnum("difficulty_level", [
  "trivial", // 1-2: Already solved
  "easy", // 3-4: Solvable within 1-2 years
  "moderate", // 5-6: Solvable within 3-5 years
  "hard", // 7-8: Solvable within 6-10 years
  "very_hard", // 9-10: 10+ years or unsolved
]);

export const growthOutlookEnum = pgEnum("growth_outlook", [
  "growing", // Positive job growth expected
  "stable", // Minimal change expected
  "declining", // Job market shrinking
]);

// Type exports
export type AutomationStatus = "safe" | "partial" | "high_risk" | "automated";
export type TaskAutomationStatus = "safe" | "partial" | "replaceable";
export type ImportanceLevel = "critical" | "important" | "minor";
export type DifficultyLevel =
  | "trivial"
  | "easy"
  | "moderate"
  | "hard"
  | "very_hard";
export type GrowthOutlook = "growing" | "stable" | "declining";

// ============================================
// 1. JOBS TABLE
// ============================================

export const job = pgTable(
  "job",
  {
    // Identity
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(), // "Physical Therapist"
    industryId: text("industry_id")
      .notNull()
      .references(() => industry.id, { onDelete: "restrict" }),
    category: text("category").notNull(), // "Medical & Health"

    // Description
    description: text("description").notNull(), // Rich text (2-3 paragraphs)
    shortDescription: text("short_description").notNull(), // 200 chars for cards
    keyResponsibilities: text("key_responsibilities")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),

    // Automation metrics
    automationPercentage: integer("automation_percentage").notNull().default(0), // 0-100
    automationStatus: automationStatusEnum("automation_status").notNull(),

    // Task metrics (calculated from tasks)
    totalTasks: integer("total_tasks").notNull().default(0),
    tasksReplaceable: integer("tasks_replaceable").notNull().default(0),
    tasksPartial: integer("tasks_partial").notNull().default(0),
    tasksSafe: integer("tasks_safe").notNull().default(0),

    // Labor statistics
    totalWorkersGlobal: integer("total_workers_global"), // Estimated
    totalWorkersUsa: integer("total_workers_usa"), // From BLS
    medianSalaryUsa: decimal("median_salary_usa", { precision: 10, scale: 2 }), // Annual in USD
    growthOutlook: growthOutlookEnum("growth_outlook"),
    growthRate: decimal("growth_rate", { precision: 5, scale: 2 }), // % per year

    // BLS Integration
    blsOccCode: text("bls_occ_code"), // Standard Occupational Classification code
    blsLastUpdated: timestamp("bls_last_updated"),

    // Timeline
    estimatedAutomationYear: integer("estimated_automation_year"), // When job becomes >75% automated
    confidenceLevel: text("confidence_level").notNull().default("medium"), // high/medium/low

    // AI Analysis
    aiSummary: text("ai_summary"), // GPT-generated summary of automation risk
    lastAiAnalysis: timestamp("last_ai_analysis"),

    // SEO
    metaDescription: text("meta_description"),
    metaKeywords: text("meta_keywords").array(),

    // Engagement metrics
    viewCount: integer("view_count").notNull().default(0),
    trackingCount: integer("tracking_count").notNull().default(0), // Users tracking this job
    reportCount: integer("report_count").notNull().default(0), // Deployment reports

    // Quality control
    verified: boolean("verified").notNull().default(false), // Admin reviewed
    dataQuality: integer("data_quality").notNull().default(0), // 0-100 score
    lastReviewed: timestamp("last_reviewed"),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("idx_job_title").on(table.title),
    index("idx_job_industry").on(table.industryId),
  ],
);

// ============================================
// 2. TASKS TABLE (Job Breakdown)
// ============================================

export const task = pgTable("task", {
  // Identity
  id: text("id").primaryKey(),
  jobId: text("job_id")
    .notNull()
    .references(() => job.id, { onDelete: "cascade" }),

  // Task details
  description: text("description").notNull(), // "Perform manual dexterity tests"
  category: text("category"), // "Assessment", "Treatment", "Documentation"

  // Automation assessment
  automationStatus: taskAutomationStatusEnum("automation_status").notNull(),
  difficultyToAutomate: difficultyLevelEnum("difficulty_to_automate").notNull(),

  // Importance within job
  percentageOfJob: integer("percentage_of_job").notNull(), // 0-100, total should = 100 per job
  timeSpentHoursPerWeek: decimal("time_spent_hours_per_week", {
    precision: 5,
    scale: 2,
  }),

  // Why can/can't it be automated
  reasoningNotes: text("reasoning_notes"), // Why this assessment
  evidenceLinks: text("evidence_links").array(), // Links to papers, demos, etc

  // Current AI solutions
  existingAiSolutions: text("existing_ai_solutions").array(), // Names of models/tools

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ============================================
// 3. TASK_CAPABILITIES (Junction Table)
// ============================================

export const taskCapability = pgTable("task_capability", {
  id: text("id").primaryKey(),

  // Relationships
  taskId: text("task_id")
    .notNull()
    .references(() => task.id, { onDelete: "cascade" }),
  capabilityId: text("capability_id")
    .notNull()
    .references(() => capability.id, { onDelete: "cascade" }),

  // Relationship metadata
  importance: importanceLevelEnum("importance").notNull(),
  notes: text("notes"), // Why this capability is needed

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// 4. JOB_CAPABILITIES (Rollup Junction)
// ============================================
// This is a materialized rollup from task_capabilities
// Makes queries faster for "what capabilities does this job need?"

export const jobCapability = pgTable("job_capability", {
  id: text("id").primaryKey(),

  // Relationships
  jobId: text("job_id")
    .notNull()
    .references(() => job.id, { onDelete: "cascade" }),
  capabilityId: text("capability_id")
    .notNull()
    .references(() => capability.id, { onDelete: "cascade" }),

  // Aggregated metadata
  importance: importanceLevelEnum("importance").notNull(), // Highest importance from tasks
  taskCount: integer("task_count").notNull().default(0), // How many tasks need this
  percentageOfJob: integer("percentage_of_job").notNull().default(0), // Sum of task percentages

  // Analysis
  blockingAutomation: boolean("blocking_automation").notNull().default(false), // Is this preventing full automation?
  notes: text("notes"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ============================================
// 5. JOB_TRACKING (User Follows Job)
// ============================================

export const jobTracking = pgTable("job_tracking", {
  id: text("id").primaryKey(),

  // Relationships
  jobId: text("job_id")
    .notNull()
    .references(() => job.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(), // FK to auth.users

  // Tracking settings
  emailNotifications: boolean("email_notifications").notNull().default(true),
  reason: text("reason"), // Why tracking? "my_job", "career_switch", "research", etc

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// 6. JOB_GEOGRAPHIC_DATA
// ============================================

export const jobGeographicData = pgTable("job_geographic_data", {
  id: text("id").primaryKey(),

  // Relationships
  jobId: text("job_id")
    .notNull()
    .references(() => job.id, { onDelete: "cascade" }),

  // Location
  country: text("country").notNull(),
  stateProvince: text("state_province"),
  city: text("city"),

  // Metrics
  workersCount: integer("workers_count"),
  medianSalary: decimal("median_salary", { precision: 10, scale: 2 }),
  automationStatus: automationStatusEnum("automation_status"),
  deploymentCount: integer("deployment_count").notNull().default(0), // Reports in this region

  // Data source
  sourceType: text("source_type"), // "bls", "user_report", "estimated"
  sourceDate: timestamp("source_date"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ============================================
// 7. JOB_COMMENTS
// ============================================

export const jobComment = pgTable("job_comment", {
  id: text("id").primaryKey(),

  // Relationships
  jobId: text("job_id")
    .notNull()
    .references(() => job.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  parentId: text("parent_id").references(
    // biome-ignore lint/suspicious/noExplicitAny: self-reference for threading
    (): any => jobComment.id,
    { onDelete: "cascade" },
  ),

  // Content
  content: text("content").notNull(),
  upvotes: integer("upvotes").notNull().default(0),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ============================================
// 8. RELATED_JOBS (Similar Jobs)
// ============================================

export const relatedJob = pgTable("related_job", {
  id: text("id").primaryKey(),

  // Relationships
  jobId: text("job_id")
    .notNull()
    .references(() => job.id, { onDelete: "cascade" }),
  relatedJobId: text("related_job_id")
    .notNull()
    .references(() => job.id, { onDelete: "cascade" }),

  // Relationship metadata
  similarityScore: integer("similarity_score").notNull(), // 0-100
  relationshipType: text("relationship_type").notNull(), // "similar", "career_path", "alternative"

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
