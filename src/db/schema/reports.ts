import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { job } from "./jobs";
import { technology } from "./technologies";

// ============================================
// ENUMS (from restructure doc)
// ============================================

export const reportStatusEnum = pgEnum("report_status", [
  "pending",
  "approved",
  "rejected",
]);

export const verificationStatusEnum = pgEnum("verification_status", [
  "unverified",
  "verified",
  "disputed",
]);

// Type exports
export type ReportStatus = "pending" | "approved" | "rejected";
export type VerificationStatus = "unverified" | "verified" | "disputed";

// ============================================
// IMPACT REPORT (The Moat)
// ============================================

export const impactReport = pgTable("impact_report", {
  // Identity
  id: text("id").primaryKey(),

  // Core Info
  title: text("title").notNull(), // Short summary
  description: text("description").notNull(), // 2-5 sentences of what happened
  location: text("location"), // Optional - city/country
  eventDate: timestamp("event_date"), // When it happened
  sourceUrl: text("source_url"), // News article, proof

  // Connections
  technologyId: text("technology_id")
    .notNull()
    .references(() => technology.id, { onDelete: "cascade" }),
  jobId: text("job_id").references(() => job.id, { onDelete: "set null" }),
  // capabilities_demonstrated handled via junction table below

  // Submission
  status: reportStatusEnum("status").notNull().default("pending"),
  submittedBy: text("submitted_by")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  reviewedBy: text("reviewed_by").references(() => user.id, {
    onDelete: "set null",
  }),
  reviewedAt: timestamp("reviewed_at"),
  rejectionReason: text("rejection_reason"),
  verificationStatus: verificationStatusEnum("verification_status")
    .notNull()
    .default("unverified"),

  // Engagement
  upvotes: integer("upvotes").notNull().default(0),
  isFeatured: boolean("is_featured").notNull().default(false),

  // Meta
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ============================================
// IMPACT REPORT CAPABILITIES (Junction)
// ============================================
// For capabilities_demonstrated: Capability[]

import { capability } from "./capabilities";

export const impactReportCapability = pgTable("impact_report_capability", {
  id: text("id").primaryKey(),
  impactReportId: text("impact_report_id")
    .notNull()
    .references(() => impactReport.id, { onDelete: "cascade" }),
  capabilityId: text("capability_id")
    .notNull()
    .references(() => capability.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// REMOVED per restructure doc:
// - reportEvidence table (just use sourceUrl)
// - reportVote table (just store upvotes count)
// - reportVerification table (just use verificationStatus enum)
// - reportDispute table (merged into verificationStatus)
// - isDraft / draft status
// - reportType enum
// - company field
// - country/stateProvince/city (single location string)
// - deploymentStatus
// - deploymentDate (renamed to eventDate)
// - workersAffected
// - impactType
// - automationPercentage
// - performanceComparison
// - moderationNotes
// - moderationReason (renamed to rejectionReason)
// - downvotes (only upvotes)
// - verificationCount
// - commentCount
// - deletedAt
// - publishedAt
// ============================================
