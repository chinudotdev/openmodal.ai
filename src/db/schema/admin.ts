import { jsonb, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

// ============================================
// PLATFORM SETTINGS TABLE
// ============================================

export const platformSettings = pgTable("platform_settings", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value"), // JSON value for flexible settings storage
  description: text("description"), // Human-readable description
  category: text("category").notNull(), // "general", "roles", "gamification", "moderation", "email"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Type exports
export type PlatformSettingCategory =
  | "general"
  | "roles"
  | "gamification"
  | "moderation"
  | "email";

// ============================================
// MODERATION AUDIT LOG TABLE
// ============================================

export const moderationActionEnum = pgEnum("moderation_action", [
  "approve",
  "reject",
  "request_changes",
  "ban_user",
  "unban_user",
  "delete_report",
  "restore_report",
]);

export type ModerationAction =
  | "approve"
  | "reject"
  | "request_changes"
  | "ban_user"
  | "unban_user"
  | "delete_report"
  | "restore_report";

export const moderationAuditLog = pgTable("moderation_audit_log", {
  id: text("id").primaryKey(),
  // Who performed the action
  moderatorId: text("moderator_id")
    .notNull()
    .references(() => user.id, { onDelete: "restrict" }),
  // What action was taken
  action: moderationActionEnum("action").notNull(),
  // Target entity
  targetType: text("target_type").notNull(), // "report", "user", "comment", etc.
  targetId: text("target_id").notNull(), // ID of the target entity
  // Details
  reason: text("reason"), // Public reason (for rejections)
  notes: text("notes"), // Internal notes
  metadata: jsonb("metadata"), // Additional data (previous status, changes made, etc.)
  // Security tracking
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
