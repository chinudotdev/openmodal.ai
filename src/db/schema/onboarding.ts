import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

// ============================================
// 1. ONBOARDING SESSION TABLE
// ============================================

export const onboardingSession = pgTable(
  "onboarding_session",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    currentStep: integer("current_step").notNull().default(1), // 1-4
    completed: boolean("completed").notNull().default(false),
    skipped: boolean("skipped").notNull().default(false),
    // Timestamps
    startedAt: timestamp("started_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    userIdUnique: unique().on(table.userId),
  }),
);

// ============================================
// 2. ONBOARDING RESPONSE TABLE
// ============================================

export const onboardingResponse = pgTable("onboarding_response", {
  id: text("id").primaryKey(),
  sessionId: text("session_id")
    .notNull()
    .references(() => onboardingSession.id, { onDelete: "cascade" }),
  step: integer("step").notNull(), // 1-4
  questionKey: text("question_key").notNull(), // e.g., "displayName", "location", "currentJobTitle"
  responseValue: text("response_value"), // JSON string or text value
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
