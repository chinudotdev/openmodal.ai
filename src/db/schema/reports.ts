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
import { capability } from "./capabilities";
import { job } from "./jobs";

// ============================================
// ENUMS
// ============================================

export const reportTypeEnum = pgEnum("report_type", [
  "deployment", // AI/automation being used in real work
  "barrier", // Obstacles preventing automation
  "research", // New research or development
]);

export const reportStatusEnum = pgEnum("report_status", [
  "draft", // Saved but not submitted
  "pending", // Submitted, awaiting moderation
  "approved", // Approved and published
  "rejected", // Rejected by moderator
  "changes_requested", // Moderator requested changes
]);

export const deploymentStatusEnum = pgEnum("deployment_status", [
  "fully_deployed", // In production
  "pilot", // Pilot/testing phase
  "announced", // Announced but not deployed
  "failed", // Deployment failed/cancelled
]);

export const impactTypeEnum = pgEnum("impact_type", [
  "completely_replaced", // Workers laid off
  "partially_replaced", // Reduced headcount
  "augmented", // Workers still needed but fewer
  "no_job_loss", // No job loss yet
]);

export const performanceComparisonEnum = pgEnum("performance_comparison", [
  "better_than_humans",
  "about_same",
  "worse_improving",
  "worse_not_improving",
]);

export const verificationSourceEnum = pgEnum("verification_source", [
  "work_at_company",
  "direct_knowledge",
  "additional_evidence",
  "industry_insider",
  "other",
]);

export const disputeReasonEnum = pgEnum("dispute_reason", [
  "factually_inaccurate",
  "missing_context",
  "exaggerated_claims",
  "outdated_information",
  "spam_irrelevant",
  "other",
]);

// Type exports
export type ReportType = "deployment" | "barrier" | "research";
export type ReportStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "changes_requested";
export type DeploymentStatus =
  | "fully_deployed"
  | "pilot"
  | "announced"
  | "failed";
export type ImpactType =
  | "completely_replaced"
  | "partially_replaced"
  | "augmented"
  | "no_job_loss";
export type PerformanceComparison =
  | "better_than_humans"
  | "about_same"
  | "worse_improving"
  | "worse_not_improving";
export type VerificationSource =
  | "work_at_company"
  | "direct_knowledge"
  | "additional_evidence"
  | "industry_insider"
  | "other";
export type DisputeReason =
  | "factually_inaccurate"
  | "missing_context"
  | "exaggerated_claims"
  | "outdated_information"
  | "spam_irrelevant"
  | "other";

// ============================================
// 1. REPORT TABLE
// ============================================

export const report = pgTable("report", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: reportTypeEnum("type").notNull(),
  status: reportStatusEnum("status").notNull().default("draft"),
  isDraft: boolean("is_draft").notNull().default(true),
  // Basic information
  jobId: text("job_id").references(() => job.id, { onDelete: "set null" }), // Can be null for research reports
  jobTitle: text("job_title"), // Free text if job doesn't exist yet
  capabilityId: text("capability_id").references(() => capability.id, {
    onDelete: "set null",
  }), // For research reports
  technology: text("technology").notNull(), // AI/automation technology name
  company: text("company"), // Optional company name
  location: text("location"), // City, State, Country
  country: text("country"),
  stateProvince: text("state_province"),
  city: text("city"),
  // Impact data (for deployment/barrier reports)
  deploymentStatus: deploymentStatusEnum("deployment_status"),
  deploymentDate: timestamp("deployment_date"), // Month/Year
  workersAffected: integer("workers_affected"), // Estimate
  impactType: impactTypeEnum("impact_type"),
  automationPercentage: integer("automation_percentage"), // 0-100
  performanceComparison: performanceComparisonEnum("performance_comparison"),
  // Description and evidence
  description: text("description").notNull(), // 500-2000 chars
  // Moderation
  moderationNotes: text("moderation_notes"), // Internal notes from moderators
  moderationReason: text("moderation_reason"), // Public reason for rejection
  moderatedBy: text("moderated_by").references(() => user.id, {
    onDelete: "set null",
  }),
  moderatedAt: timestamp("moderated_at"),
  // Engagement metrics
  upvotes: integer("upvotes").notNull().default(0),
  downvotes: integer("downvotes").notNull().default(0),
  verificationCount: integer("verification_count").notNull().default(0),
  commentCount: integer("comment_count").notNull().default(0),
  // Soft delete
  deletedAt: timestamp("deleted_at"), // Soft delete timestamp
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  publishedAt: timestamp("published_at"), // When approved and published
});

// ============================================
// 2. REPORT EVIDENCE TABLE
// ============================================

export const reportEvidence = pgTable("report_evidence", {
  id: text("id").primaryKey(),
  reportId: text("report_id")
    .notNull()
    .references(() => report.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // "link", "photo", "screenshot"
  url: text("url"), // For links
  fileUrl: text("file_url"), // For uploaded files
  fileName: text("file_name"), // Original filename
  fileSize: integer("file_size"), // Size in bytes
  mimeType: text("mime_type"), // MIME type for files
  description: text("description"), // Optional description
  // Soft delete
  deletedAt: timestamp("deleted_at"),
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// 3. REPORT VOTE TABLE
// ============================================

export const reportVote = pgTable(
  "report_vote",
  {
    id: text("id").primaryKey(),
    reportId: text("report_id")
      .notNull()
      .references(() => report.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    voteType: text("vote_type").notNull(), // "up" or "down"
    // Soft delete
    deletedAt: timestamp("deleted_at"),
    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    reportUserUnique: unique().on(table.reportId, table.userId),
  }),
);

// ============================================
// 4. REPORT VERIFICATION TABLE
// ============================================

export const reportVerification = pgTable("report_verification", {
  id: text("id").primaryKey(),
  reportId: text("report_id")
    .notNull()
    .references(() => report.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  canVerify: boolean("can_verify").notNull().default(true), // true = verify, false = dispute
  source: verificationSourceEnum("source").notNull(),
  comment: text("comment"), // Optional context or evidence
  evidenceLinks: text("evidence_links").array(), // Array of URLs
  // Soft delete
  deletedAt: timestamp("deleted_at"), // Soft delete timestamp
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ============================================
// 5. REPORT DISPUTE TABLE
// ============================================

export const reportDispute = pgTable("report_dispute", {
  id: text("id").primaryKey(),
  reportId: text("report_id")
    .notNull()
    .references(() => report.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  reason: disputeReasonEnum("reason").notNull(),
  explanation: text("explanation").notNull(), // 200+ chars
  evidenceLinks: text("evidence_links").array(), // Array of URLs
  // Soft delete
  deletedAt: timestamp("deleted_at"), // Soft delete timestamp
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
