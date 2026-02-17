-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations

CREATE TYPE "public"."activity_type" AS ENUM('login', 'report_submitted', 'verification_completed', 'comment_created', 'upvote_given');--> statement-breakpoint
CREATE TYPE "public"."age_range" AS ENUM('18-24', '25-34', '35-44', '45-54', '55-64', '65+');--> statement-breakpoint
CREATE TYPE "public"."application_status" AS ENUM('pending', 'approved', 'rejected', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."automatable" AS ENUM('yes', 'partial', 'no');--> statement-breakpoint
CREATE TYPE "public"."automation_type" AS ENUM('ai_ml_software', 'rpa', 'physical_robots', 'other');--> statement-breakpoint
CREATE TYPE "public"."capability_category" AS ENUM('physical', 'cognitive', 'social', 'meta');--> statement-breakpoint
CREATE TYPE "public"."capability_status" AS ENUM('solved', 'partial', 'unsolved');--> statement-breakpoint
CREATE TYPE "public"."company_size" AS ENUM('1-10', '11-50', '51-200', '201-1000', '1000+');--> statement-breakpoint
CREATE TYPE "public"."confidence" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."education_level" AS ENUM('high_school', 'associates', 'bachelors', 'masters', 'phd', 'other');--> statement-breakpoint
CREATE TYPE "public"."employment_status" AS ENUM('full_time', 'part_time', 'self_employed', 'unemployed', 'student', 'retired');--> statement-breakpoint
CREATE TYPE "public"."entity_type" AS ENUM('organization', 'technology', 'capability', 'job', 'impact_report');--> statement-breakpoint
CREATE TYPE "public"."experience_years" AS ENUM('0-1', '2-5', '6-10', '11-15', '16-20', '20+');--> statement-breakpoint
CREATE TYPE "public"."importance_level" AS ENUM('critical', 'important', 'minor');--> statement-breakpoint
CREATE TYPE "public"."job_category" AS ENUM('healthcare', 'technology', 'trades', 'service', 'creative', 'finance', 'education', 'legal', 'manufacturing', 'other');--> statement-breakpoint
CREATE TYPE "public"."nomination_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('report_verified', 'report_approved', 'report_rejected', 'report_changes_requested', 'comment_reply', 'reputation_milestone', 'capability_breakthrough', 'verification_received', 'dispute_received', 'moderation_assigned', 'badge_earned', 'streak_milestone', 'role_eligible', 'application_status');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."reputation_tier" AS ENUM('observer', 'contributor', 'trusted', 'expert');--> statement-breakpoint
CREATE TYPE "public"."risk_level" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."sponsor_tier" AS ENUM('none', 'bronze', 'silver', 'gold');--> statement-breakpoint
CREATE TYPE "public"."streak_type" AS ENUM('activity', 'verification');--> statement-breakpoint
CREATE TYPE "public"."strike_status" AS ENUM('active', 'appealed', 'overturned', 'expired');--> statement-breakpoint
CREATE TYPE "public"."strike_type" AS ENUM('yellow', 'red');--> statement-breakpoint
CREATE TYPE "public"."submission_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."suggestion_status" AS ENUM('pending', 'accepted', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."suggestion_type" AS ENUM('job', 'capability', 'organization');--> statement-breakpoint
CREATE TYPE "public"."technology_stage" AS ENUM('research', 'pilot', 'deployed', 'discontinued');--> statement-breakpoint
CREATE TYPE "public"."technology_type" AS ENUM('ai_model', 'robot', 'software', 'hardware', 'api');--> statement-breakpoint
CREATE TYPE "public"."verification_status" AS ENUM('unverified', 'verified', 'disputed');--> statement-breakpoint
CREATE TABLE "platform_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" jsonb,
	"description" text,
	"category" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "platform_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"username" text,
	"display_username" text,
	"role" text,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "discussion" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text,
	"body" text NOT NULL,
	"is_top_level" boolean DEFAULT true NOT NULL,
	"entity_type" "entity_type" NOT NULL,
	"entity_id" text NOT NULL,
	"parent_id" text,
	"depth" integer DEFAULT 0 NOT NULL,
	"user_id" text NOT NULL,
	"is_anonymous" boolean DEFAULT false NOT NULL,
	"upvotes" integer DEFAULT 0 NOT NULL,
	"downvotes" integer DEFAULT 0 NOT NULL,
	"reply_count" integer DEFAULT 0 NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_by" text,
	"delete_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suggestion" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "suggestion_type" NOT NULL,
	"suggested_name" text NOT NULL,
	"reason" text NOT NULL,
	"additional_info" text,
	"user_id" text,
	"email" text,
	"status" "suggestion_status" DEFAULT 'pending' NOT NULL,
	"reviewed_by" text,
	"reviewed_at" timestamp,
	"response" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"types" text[] DEFAULT '{"RAY"}' NOT NULL,
	"description" text NOT NULL,
	"website" text,
	"logo" text,
	"founded_year" integer,
	"is_sponsor" boolean DEFAULT false NOT NULL,
	"sponsor_tier" "sponsor_tier" DEFAULT 'none' NOT NULL,
	"is_claimed" boolean DEFAULT false NOT NULL,
	"verified_badge" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organization_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "technology" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"type" "technology_type" NOT NULL,
	"description" text NOT NULL,
	"image" text,
	"website" text,
	"organization_id" text NOT NULL,
	"stage" "technology_stage" NOT NULL,
	"release_date" timestamp,
	"status" "submission_status" DEFAULT 'pending' NOT NULL,
	"submitted_by" text NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_by" text,
	"reviewed_at" timestamp,
	"rejection_reason" text,
	"aliases" text[] DEFAULT '{"RAY"}' NOT NULL,
	"merged_into_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "technology_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "technology_capability" (
	"id" text PRIMARY KEY NOT NULL,
	"technology_id" text NOT NULL,
	"capability_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "capability" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"category" "capability_category" NOT NULL,
	"description" text NOT NULL,
	"icon" text,
	"progress_percentage" integer DEFAULT 0 NOT NULL,
	"status" "capability_status" NOT NULL,
	"what_works" text[] DEFAULT '{"RAY"}' NOT NULL,
	"what_struggles" text[] DEFAULT '{"RAY"}' NOT NULL,
	"what_doesnt_work" text[] DEFAULT '{"RAY"}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "capability_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "technology_job" (
	"id" text PRIMARY KEY NOT NULL,
	"technology_id" text NOT NULL,
	"job_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"category" "job_category" NOT NULL,
	"description" text NOT NULL,
	"icon" text,
	"automation_risk_percentage" integer DEFAULT 0 NOT NULL,
	"risk_level" "risk_level" NOT NULL,
	"timeline_estimate" text,
	"confidence" "confidence" DEFAULT 'medium' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "job_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "job_capability" (
	"id" text PRIMARY KEY NOT NULL,
	"job_id" text NOT NULL,
	"capability_id" text NOT NULL,
	"importance" "importance_level" NOT NULL,
	"percentage_of_job" integer DEFAULT 0 NOT NULL,
	"blocking_automation" boolean DEFAULT false NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task" (
	"id" text PRIMARY KEY NOT NULL,
	"job_id" text NOT NULL,
	"name" text NOT NULL,
	"percentage_of_job" integer NOT NULL,
	"automatable" "automatable" NOT NULL,
	"reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_capability" (
	"id" text PRIMARY KEY NOT NULL,
	"task_id" text NOT NULL,
	"capability_id" text NOT NULL,
	"importance" "importance_level" NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"action_url" text,
	"related_entity_type" text,
	"related_entity_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"read_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "notification_preference" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"notification_type" "notification_type" NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"email_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "notification_preference_user_id_notification_type_unique" UNIQUE("user_id","notification_type")
);
--> statement-breakpoint
CREATE TABLE "onboarding_session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"current_step" integer DEFAULT 1 NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"skipped" boolean DEFAULT false NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "onboarding_session_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "onboarding_response" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"step" integer NOT NULL,
	"question_key" text NOT NULL,
	"response_value" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "impact_report" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"location" text,
	"event_date" timestamp,
	"source_url" text,
	"technology_id" text NOT NULL,
	"job_id" text,
	"status" "report_status" DEFAULT 'pending' NOT NULL,
	"submitted_by" text NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_by" text,
	"reviewed_at" timestamp,
	"rejection_reason" text,
	"verification_status" "verification_status" DEFAULT 'unverified' NOT NULL,
	"upvotes" integer DEFAULT 0 NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "impact_report_capability" (
	"id" text PRIMARY KEY NOT NULL,
	"impact_report_id" text NOT NULL,
	"capability_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity_log" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"activity_type" "activity_type" NOT NULL,
	"activity_date" date DEFAULT now() NOT NULL,
	"related_entity_type" text,
	"related_entity_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expert_application" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"statement" text NOT NULL,
	"status" "application_status" DEFAULT 'pending' NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"voting_deadline" timestamp,
	"votes" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "expert_application_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "moderator_nomination" (
	"id" text PRIMARY KEY NOT NULL,
	"candidate_id" text NOT NULL,
	"nominated_by" text NOT NULL,
	"statement" text NOT NULL,
	"status" "nomination_status" DEFAULT 'pending' NOT NULL,
	"admin_notes" text,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp,
	"reviewed_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "moderator_strike" (
	"id" text PRIMARY KEY NOT NULL,
	"moderator_id" text NOT NULL,
	"strike_type" "strike_type" NOT NULL,
	"reason" text NOT NULL,
	"evidence" jsonb,
	"issued_by" text NOT NULL,
	"status" "strike_status" DEFAULT 'active' NOT NULL,
	"appeal_deadline" timestamp,
	"appeal_reason" text,
	"appeal_reviewed_at" timestamp,
	"appeal_reviewed_by" text,
	"issued_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reputation_history" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"points_change" integer NOT NULL,
	"reason" text NOT NULL,
	"related_entity_type" text,
	"related_entity_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_badge" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"badge_type" text NOT NULL,
	"badge_name" text NOT NULL,
	"badge_description" text,
	"badge_icon" text,
	"badge_category" text,
	"rarity" text,
	"pinned" boolean DEFAULT false NOT NULL,
	"pinned_order" integer,
	"earned_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profile" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"display_name" text,
	"location" text,
	"country" text,
	"state_province" text,
	"city" text,
	"age_range" "age_range",
	"employment_status" "employment_status",
	"current_job_title" text,
	"industry" text,
	"years_of_experience" "experience_years",
	"company_size" "company_size",
	"education_level" "education_level",
	"has_seen_automation" boolean,
	"automation_types" text[],
	"automation_impact" text,
	"platform_intents" text[],
	"willing_to_contribute" boolean,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_profile_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_reputation" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"reputation_points" integer DEFAULT 0 NOT NULL,
	"tier" "reputation_tier" DEFAULT 'observer' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_reputation_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_streak" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"streak_type" "streak_type" NOT NULL,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"longest_streak" integer DEFAULT 0 NOT NULL,
	"last_activity_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_streak_user_id_streak_type_unique" UNIQUE("user_id","streak_type")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discussion" ADD CONSTRAINT "discussion_parent_id_discussion_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."discussion"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discussion" ADD CONSTRAINT "discussion_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discussion" ADD CONSTRAINT "discussion_deleted_by_user_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suggestion" ADD CONSTRAINT "suggestion_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suggestion" ADD CONSTRAINT "suggestion_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technology" ADD CONSTRAINT "technology_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technology" ADD CONSTRAINT "technology_submitted_by_user_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technology" ADD CONSTRAINT "technology_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technology" ADD CONSTRAINT "technology_merged_into_id_technology_id_fk" FOREIGN KEY ("merged_into_id") REFERENCES "public"."technology"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technology_capability" ADD CONSTRAINT "technology_capability_technology_id_technology_id_fk" FOREIGN KEY ("technology_id") REFERENCES "public"."technology"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technology_capability" ADD CONSTRAINT "technology_capability_capability_id_capability_id_fk" FOREIGN KEY ("capability_id") REFERENCES "public"."capability"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technology_job" ADD CONSTRAINT "technology_job_technology_id_technology_id_fk" FOREIGN KEY ("technology_id") REFERENCES "public"."technology"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technology_job" ADD CONSTRAINT "technology_job_job_id_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_capability" ADD CONSTRAINT "job_capability_job_id_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_capability" ADD CONSTRAINT "job_capability_capability_id_capability_id_fk" FOREIGN KEY ("capability_id") REFERENCES "public"."capability"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_job_id_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_capability" ADD CONSTRAINT "task_capability_task_id_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."task"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_capability" ADD CONSTRAINT "task_capability_capability_id_capability_id_fk" FOREIGN KEY ("capability_id") REFERENCES "public"."capability"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_preference" ADD CONSTRAINT "notification_preference_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_session" ADD CONSTRAINT "onboarding_session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_response" ADD CONSTRAINT "onboarding_response_session_id_onboarding_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."onboarding_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "impact_report" ADD CONSTRAINT "impact_report_technology_id_technology_id_fk" FOREIGN KEY ("technology_id") REFERENCES "public"."technology"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "impact_report" ADD CONSTRAINT "impact_report_job_id_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "impact_report" ADD CONSTRAINT "impact_report_submitted_by_user_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "impact_report" ADD CONSTRAINT "impact_report_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "impact_report_capability" ADD CONSTRAINT "impact_report_capability_impact_report_id_impact_report_id_fk" FOREIGN KEY ("impact_report_id") REFERENCES "public"."impact_report"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "impact_report_capability" ADD CONSTRAINT "impact_report_capability_capability_id_capability_id_fk" FOREIGN KEY ("capability_id") REFERENCES "public"."capability"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expert_application" ADD CONSTRAINT "expert_application_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderator_nomination" ADD CONSTRAINT "moderator_nomination_candidate_id_user_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderator_nomination" ADD CONSTRAINT "moderator_nomination_nominated_by_user_id_fk" FOREIGN KEY ("nominated_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderator_nomination" ADD CONSTRAINT "moderator_nomination_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderator_strike" ADD CONSTRAINT "moderator_strike_moderator_id_user_id_fk" FOREIGN KEY ("moderator_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderator_strike" ADD CONSTRAINT "moderator_strike_issued_by_user_id_fk" FOREIGN KEY ("issued_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderator_strike" ADD CONSTRAINT "moderator_strike_appeal_reviewed_by_user_id_fk" FOREIGN KEY ("appeal_reviewed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reputation_history" ADD CONSTRAINT "reputation_history_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badge" ADD CONSTRAINT "user_badge_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_reputation" ADD CONSTRAINT "user_reputation_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_streak" ADD CONSTRAINT "user_streak_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
