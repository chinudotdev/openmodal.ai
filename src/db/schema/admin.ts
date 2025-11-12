import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

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

