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

// ============================================
// ENUMS
// ============================================

export const reputationTierEnum = pgEnum("reputation_tier", [
  "observer", // 0-199 points
  "contributor", // 200-999 points
  "trusted", // 1000-4999 points
  "expert", // 5000+ points
]);

export const ageRangeEnum = pgEnum("age_range", [
  "18-24",
  "25-34",
  "35-44",
  "45-54",
  "55-64",
  "65+",
]);

export const employmentStatusEnum = pgEnum("employment_status", [
  "full_time",
  "part_time",
  "self_employed",
  "unemployed",
  "student",
  "retired",
]);

export const educationLevelEnum = pgEnum("education_level", [
  "high_school",
  "associates",
  "bachelors",
  "masters",
  "phd",
  "other",
]);

export const companySizeEnum = pgEnum("company_size", [
  "1-10",
  "11-50",
  "51-200",
  "201-1000",
  "1000+",
]);

export const experienceYearsEnum = pgEnum("experience_years", [
  "0-1",
  "2-5",
  "6-10",
  "11-15",
  "16-20",
  "20+",
]);

export const automationTypeEnum = pgEnum("automation_type", [
  "ai_ml_software",
  "rpa",
  "physical_robots",
  "other",
]);

// Type exports
export type ReputationTier = "observer" | "contributor" | "trusted" | "expert";
export type AgeRange = "18-24" | "25-34" | "35-44" | "45-54" | "55-64" | "65+";
export type EmploymentStatus =
  | "full_time"
  | "part_time"
  | "self_employed"
  | "unemployed"
  | "student"
  | "retired";
export type EducationLevel =
  | "high_school"
  | "associates"
  | "bachelors"
  | "masters"
  | "phd"
  | "other";
export type CompanySize = "1-10" | "11-50" | "51-200" | "201-1000" | "1000+";
export type ExperienceYears =
  | "0-1"
  | "2-5"
  | "6-10"
  | "11-15"
  | "16-20"
  | "20+";
export type AutomationType =
  | "ai_ml_software"
  | "rpa"
  | "physical_robots"
  | "other";

// ============================================
// 1. USER PROFILE TABLE
// ============================================

export const userProfile = pgTable(
  "user_profile",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    displayName: text("display_name"), // Can be pseudonym
    location: text("location"), // City, State, Country
    country: text("country"),
    stateProvince: text("state_province"),
    city: text("city"),
    ageRange: ageRangeEnum("age_range"),
    employmentStatus: employmentStatusEnum("employment_status"),
    // Professional background
    currentJobTitle: text("current_job_title"),
    industry: text("industry"),
    yearsOfExperience: experienceYearsEnum("years_of_experience"),
    companySize: companySizeEnum("company_size"),
    educationLevel: educationLevelEnum("education_level"),
    // Automation experience
    hasSeenAutomation: boolean("has_seen_automation"),
    automationTypes: text("automation_types").array(), // Array of automationTypeEnum
    automationImpact: text("automation_impact"), // Optional text description
    // Platform intent
    platformIntents: text("platform_intents").array(), // Array of reasons: track_safety, understand_capabilities, find_resistant_careers, etc.
    willingToContribute: boolean("willing_to_contribute"),
    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
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
// 2. USER REPUTATION TABLE
// ============================================

export const userReputation = pgTable(
  "user_reputation",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    reputationPoints: integer("reputation_points").notNull().default(0),
    tier: reputationTierEnum("tier").notNull().default("observer"),
    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
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
// 3. USER BADGE TABLE
// ============================================

export const userBadge = pgTable("user_badge", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  badgeType: text("badge_type").notNull(), // "early_adopter", "industry_insider", "researcher", "verified_contributor", etc.
  badgeName: text("badge_name").notNull(), // Display name
  badgeDescription: text("badge_description"),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

// ============================================
// 4. REPUTATION HISTORY TABLE
// ============================================

export const reputationHistory = pgTable("reputation_history", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  pointsChange: integer("points_change").notNull(), // Can be positive or negative
  reason: text("reason").notNull(), // "onboarding_complete", "report_approved", "verification", etc.
  relatedEntityType: text("related_entity_type"), // "report", "verification", "comment", etc.
  relatedEntityId: text("related_entity_id"), // ID of related entity
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
