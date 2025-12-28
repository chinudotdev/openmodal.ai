import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

// Enums
export const capabilityStatusEnum = pgEnum("capability_status", [
  "solved",
  "partial",
  "unsolved",
]);

export const confidenceLevelEnum = pgEnum("confidence_level", [
  "high",
  "medium",
  "low",
]);

export const bottleneckSeverityEnum = pgEnum("bottleneck_severity", [
  "critical",
  "major",
  "minor",
]);

export const predictionConfidenceEnum = pgEnum("prediction_confidence", [
  "low",
  "medium",
  "high",
]);

export const predictionBackgroundEnum = pgEnum("prediction_background", [
  "general",
  "professional",
  "academic",
  "researcher",
]);

export const commentVoteTypeEnum = pgEnum("comment_vote_type", ["up", "down"]);

// Type exports
export type CapabilityStatus = "solved" | "partial" | "unsolved";
export type ConfidenceLevel = "high" | "medium" | "low";
export type BottleneckSeverity = "critical" | "major" | "minor";
export type PredictionConfidence = "low" | "medium" | "high";
export type PredictionBackground =
  | "general"
  | "professional"
  | "academic"
  | "researcher";
export type CommentVoteType = "up" | "down";

// 1. Capability Category
export const capabilityCategory = pgTable("capability_category", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// 2. Capability
export const capability = pgTable("capability", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  categoryId: text("category_id")
    .notNull()
    .references(() => capabilityCategory.id, { onDelete: "cascade" }),
  description: text("description").notNull(), // 200 chars
  technicalDescription: text("technical_description").notNull(), // 500+ chars
  whyItMatters: text("why_it_matters").notNull(),
  progressPercentage: integer("progress_percentage").notNull().default(0),
  status: capabilityStatusEnum("status").notNull(),
  confidenceLevel: confidenceLevelEnum("confidence_level").notNull(),
  whatWorks: text("what_works").array().notNull().default(sql`ARRAY[]::text[]`),
  whatStruggles: text("what_struggles")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  whatDoesntWork: text("what_doesnt_work")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  timelineEstimate: text("timeline_estimate"), // "10-20 years"
  expertConsensus: text("expert_consensus"),
  communityPredictionMedian: integer("community_prediction_median"), // year
  reasoning: text("reasoning"),
  jobsProtectedCount: integer("jobs_protected_count").notNull().default(0),
  jobsProtectedExamples: text("jobs_protected_examples")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  researchActivityCount: integer("research_activity_count")
    .notNull()
    .default(0),
  recentBreakthroughDate: timestamp("recent_breakthrough_date"),
  viewCount: integer("view_count").notNull().default(0),
  trackingCount: integer("tracking_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// 3. Bottleneck
export const bottleneck = pgTable("bottleneck", {
  id: text("id").primaryKey(),
  capabilityId: text("capability_id")
    .notNull()
    .references(() => capability.id, { onDelete: "cascade" }),
  types: text("types").array().notNull().default(sql`ARRAY[]::text[]`), // Array of 'hardware' | 'software' | 'data' | 'theory' | 'cost' | 'safety'
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: bottleneckSeverityEnum("severity").notNull(),
  estimatedSolveDate: text("estimated_solve_date"), // "2030-2035" or "Unknown"
  organizationsWorkingOnIt: integer("organizations_working_on_it")
    .notNull()
    .default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// 4. Capability Prediction
export const capabilityPrediction = pgTable(
  "capability_prediction",
  {
    id: text("id").primaryKey(),
    capabilityId: text("capability_id")
      .notNull()
      .references(() => capability.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    predictedYear: integer("predicted_year").notNull(), // or range start
    predictedYearEnd: integer("predicted_year_end"), // for ranges
    confidence: predictionConfidenceEnum("confidence").notNull(),
    reasoning: text("reasoning"),
    background: predictionBackgroundEnum("background").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    capabilityUserUnique: unique().on(table.capabilityId, table.userId),
  }),
);

// 5. Capability Tracking
export const capabilityTracking = pgTable(
  "capability_tracking",
  {
    id: text("id").primaryKey(),
    capabilityId: text("capability_id")
      .notNull()
      .references(() => capability.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    notificationsEnabled: boolean("notifications_enabled")
      .notNull()
      .default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    capabilityUserUnique: unique().on(table.capabilityId, table.userId),
  }),
);

// 6. Capability Comment
export const capabilityComment = pgTable("capability_comment", {
  id: text("id").primaryKey(),
  capabilityId: text("capability_id")
    .notNull()
    .references(() => capability.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  parentId: text("parent_id").references(
    // biome-ignore lint/suspicious/noExplicitAny: comment id
    (): any => capabilityComment.id,
    { onDelete: "cascade" },
  ), // for threading
  content: text("content").notNull(),
  upvotes: integer("upvotes").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// 7. Capability Comment Vote
export const capabilityCommentVote = pgTable(
  "capability_comment_vote",
  {
    id: text("id").primaryKey(),
    commentId: text("comment_id")
      .notNull()
      .references(() => capabilityComment.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    voteType: commentVoteTypeEnum("vote_type").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    commentUserUnique: unique().on(table.commentId, table.userId),
  }),
);

// 8. Organization
export const organization = pgTable("organization", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  websiteUrl: text("website_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// 9. Capability Organization (junction)
export const capabilityOrganization = pgTable(
  "capability_organization",
  {
    id: text("id").primaryKey(),
    capabilityId: text("capability_id")
      .notNull()
      .references(() => capability.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    focusArea: text("focus_area"), // what they're working on
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    capabilityOrgUnique: unique().on(table.capabilityId, table.organizationId),
  }),
);

// Export schema object
export const capabilitySchema = {
  capabilityCategory,
  capability,
  bottleneck,
  capabilityPrediction,
  capabilityTracking,
  capabilityComment,
  capabilityCommentVote,
  organization,
  capabilityOrganization,
};
