import {
  boolean,
  date,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core'
import { user } from './auth'

// ============================================
// ENUMS
// ============================================

export const reputationTierEnum = pgEnum('reputation_tier', [
  'observer', // 0-199 points
  'contributor', // 200-999 points
  'trusted', // 1000-4999 points
  'expert', // 5000+ points
])

export const ageRangeEnum = pgEnum('age_range', [
  '18-24',
  '25-34',
  '35-44',
  '45-54',
  '55-64',
  '65+',
])

export const employmentStatusEnum = pgEnum('employment_status', [
  'full_time',
  'part_time',
  'self_employed',
  'unemployed',
  'student',
  'retired',
])

export const educationLevelEnum = pgEnum('education_level', [
  'high_school',
  'associates',
  'bachelors',
  'masters',
  'phd',
  'other',
])

export const companySizeEnum = pgEnum('company_size', [
  '1-10',
  '11-50',
  '51-200',
  '201-1000',
  '1000+',
])

export const experienceYearsEnum = pgEnum('experience_years', [
  '0-1',
  '2-5',
  '6-10',
  '11-15',
  '16-20',
  '20+',
])

export const automationTypeEnum = pgEnum('automation_type', [
  'ai_ml_software',
  'rpa',
  'physical_robots',
  'other',
])

export const streakTypeEnum = pgEnum('streak_type', [
  'activity', // General activity streak
  'verification', // Verification streak
])

export const applicationStatusEnum = pgEnum('application_status', [
  'pending',
  'approved',
  'rejected',
  'withdrawn',
])

export const nominationStatusEnum = pgEnum('nomination_status', [
  'pending',
  'approved',
  'rejected',
])

export const strikeTypeEnum = pgEnum('strike_type', ['yellow', 'red'])

export const strikeStatusEnum = pgEnum('strike_status', [
  'active',
  'appealed',
  'overturned',
  'expired',
])

export const activityTypeEnum = pgEnum('activity_type', [
  'login',
  'report_submitted',
  'verification_completed',
  'comment_created',
  'upvote_given',
])

// Type exports
export type ReputationTier = 'observer' | 'contributor' | 'trusted' | 'expert'
export type AgeRange = '18-24' | '25-34' | '35-44' | '45-54' | '55-64' | '65+'
export type EmploymentStatus =
  | 'full_time'
  | 'part_time'
  | 'self_employed'
  | 'unemployed'
  | 'student'
  | 'retired'
export type EducationLevel =
  | 'high_school'
  | 'associates'
  | 'bachelors'
  | 'masters'
  | 'phd'
  | 'other'
export type CompanySize = '1-10' | '11-50' | '51-200' | '201-1000' | '1000+'
export type ExperienceYears = '0-1' | '2-5' | '6-10' | '11-15' | '16-20' | '20+'
export type AutomationType =
  | 'ai_ml_software'
  | 'rpa'
  | 'physical_robots'
  | 'other'
export type StreakType = 'activity' | 'verification'
export type ApplicationStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'withdrawn'
export type NominationStatus = 'pending' | 'approved' | 'rejected'
export type StrikeType = 'yellow' | 'red'
export type StrikeStatus = 'active' | 'appealed' | 'overturned' | 'expired'
export type ActivityType =
  | 'login'
  | 'report_submitted'
  | 'verification_completed'
  | 'comment_created'
  | 'upvote_given'

// ============================================
// 1. USER PROFILE TABLE
// ============================================

export const userProfile = pgTable(
  'user_profile',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    displayName: text('display_name'), // Can be pseudonym
    location: text('location'), // City, State, Country
    country: text('country'),
    stateProvince: text('state_province'),
    city: text('city'),
    ageRange: ageRangeEnum('age_range'),
    employmentStatus: employmentStatusEnum('employment_status'),
    // Professional background
    currentJobTitle: text('current_job_title'),
    industry: text('industry'),
    yearsOfExperience: experienceYearsEnum('years_of_experience'),
    companySize: companySizeEnum('company_size'),
    educationLevel: educationLevelEnum('education_level'),
    // Automation experience
    hasSeenAutomation: boolean('has_seen_automation'),
    automationTypes: text('automation_types').array(), // Array of automationTypeEnum
    automationImpact: text('automation_impact'), // Optional text description
    // Platform intent
    platformIntents: text('platform_intents').array(), // Array of reasons: track_safety, understand_capabilities, find_resistant_careers, etc.
    willingToContribute: boolean('willing_to_contribute'),
    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    userIdUnique: unique().on(table.userId),
  }),
)

// ============================================
// 2. USER REPUTATION TABLE
// ============================================

export const userReputation = pgTable(
  'user_reputation',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    reputationPoints: integer('reputation_points').notNull().default(0),
    tier: reputationTierEnum('tier').notNull().default('observer'),
    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    userIdUnique: unique().on(table.userId),
  }),
)

// ============================================
// 3. USER BADGE TABLE
// ============================================

export const userBadge = pgTable('user_badge', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  badgeType: text('badge_type').notNull(), // "early_adopter", "industry_insider", "researcher", "verified_contributor", etc.
  badgeName: text('badge_name').notNull(), // Display name
  badgeDescription: text('badge_description'),
  badgeIcon: text('badge_icon'), // Emoji or icon identifier
  badgeCategory: text('badge_category'), // "contribution", "verification", "engagement", "specialty", "social"
  rarity: text('rarity'), // Percentage of users who have this badge
  pinned: boolean('pinned').default(false).notNull(),
  pinnedOrder: integer('pinned_order'), // For reordering pinned badges (1-5)
  earnedAt: timestamp('earned_at').defaultNow().notNull(),
})

// ============================================
// 4. REPUTATION HISTORY TABLE
// ============================================

export const reputationHistory = pgTable('reputation_history', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  pointsChange: integer('points_change').notNull(), // Can be positive or negative
  reason: text('reason').notNull(), // "onboarding_complete", "report_approved", "verification", etc.
  relatedEntityType: text('related_entity_type'), // "report", "verification", "comment", etc.
  relatedEntityId: text('related_entity_id'), // ID of related entity
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ============================================
// 5. USER STREAK TABLE
// ============================================

export const userStreak = pgTable(
  'user_streak',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    streakType: streakTypeEnum('streak_type').notNull(),
    currentStreak: integer('current_streak').notNull().default(0),
    longestStreak: integer('longest_streak').notNull().default(0),
    lastActivityDate: date('last_activity_date'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    userIdStreakTypeUnique: unique().on(table.userId, table.streakType),
  }),
)

// ============================================
// 6. EXPERT APPLICATION TABLE
// ============================================

export const expertApplication = pgTable(
  'expert_application',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    statement: text('statement').notNull(), // 150-500 characters
    status: applicationStatusEnum('status').notNull().default('pending'),
    submittedAt: timestamp('submitted_at').defaultNow().notNull(),
    votingDeadline: timestamp('voting_deadline'), // 7 days from submission
    votes: jsonb('votes'), // Array of {moderatorId, vote: "approve"|"reject"|"abstain", votedAt}
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    userIdUnique: unique().on(table.userId),
  }),
)

// ============================================
// 7. MODERATOR NOMINATION TABLE
// ============================================

export const moderatorNomination = pgTable('moderator_nomination', {
  id: text('id').primaryKey(),
  candidateId: text('candidate_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  nominatedBy: text('nominated_by')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  statement: text('statement').notNull(), // 300-1000 characters
  status: nominationStatusEnum('status').notNull().default('pending'),
  adminNotes: text('admin_notes'), // Admin's notes when reviewing
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  reviewedAt: timestamp('reviewed_at'),
  reviewedBy: text('reviewed_by').references(() => user.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

// ============================================
// 8. MODERATOR STRIKE TABLE
// ============================================

export const moderatorStrike = pgTable('moderator_strike', {
  id: text('id').primaryKey(),
  moderatorId: text('moderator_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  strikeType: strikeTypeEnum('strike_type').notNull(),
  reason: text('reason').notNull(),
  evidence: jsonb('evidence'), // Array of case objects with report IDs and details
  issuedBy: text('issued_by')
    .notNull()
    .references(() => user.id, { onDelete: 'restrict' }),
  status: strikeStatusEnum('status').notNull().default('active'),
  appealDeadline: timestamp('appeal_deadline'), // 14 days from issuance
  appealReason: text('appeal_reason'), // User's appeal statement
  appealReviewedAt: timestamp('appeal_reviewed_at'),
  appealReviewedBy: text('appeal_reviewed_by').references(() => user.id, {
    onDelete: 'set null',
  }),
  issuedAt: timestamp('issued_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'), // When monitoring period ends
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

// ============================================
// 9. ACTIVITY LOG TABLE
// ============================================

export const activityLog = pgTable('activity_log', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  activityType: activityTypeEnum('activity_type').notNull(),
  activityDate: date('activity_date').notNull().defaultNow(),
  relatedEntityType: text('related_entity_type'), // "report", "verification", "comment", etc.
  relatedEntityId: text('related_entity_id'), // ID of related entity
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
