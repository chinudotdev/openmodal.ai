CREATE TYPE "public"."age_range" AS ENUM('18-24', '25-34', '35-44', '45-54', '55-64', '65+');--> statement-breakpoint
CREATE TYPE "public"."automation_type" AS ENUM('ai_ml_software', 'rpa', 'physical_robots', 'other');--> statement-breakpoint
CREATE TYPE "public"."company_size" AS ENUM('1-10', '11-50', '51-200', '201-1000', '1000+');--> statement-breakpoint
CREATE TYPE "public"."education_level" AS ENUM('high_school', 'associates', 'bachelors', 'masters', 'phd', 'other');--> statement-breakpoint
CREATE TYPE "public"."employment_status" AS ENUM('full_time', 'part_time', 'self_employed', 'unemployed', 'student', 'retired');--> statement-breakpoint
CREATE TYPE "public"."experience_years" AS ENUM('0-1', '2-5', '6-10', '11-15', '16-20', '20+');--> statement-breakpoint
CREATE TYPE "public"."reputation_tier" AS ENUM('observer', 'contributor', 'trusted', 'expert');--> statement-breakpoint
CREATE TYPE "public"."deployment_status" AS ENUM('fully_deployed', 'pilot', 'announced', 'failed');--> statement-breakpoint
CREATE TYPE "public"."dispute_reason" AS ENUM('factually_inaccurate', 'missing_context', 'exaggerated_claims', 'outdated_information', 'spam_irrelevant', 'other');--> statement-breakpoint
CREATE TYPE "public"."impact_type" AS ENUM('completely_replaced', 'partially_replaced', 'augmented', 'no_job_loss');--> statement-breakpoint
CREATE TYPE "public"."performance_comparison" AS ENUM('better_than_humans', 'about_same', 'worse_improving', 'worse_not_improving');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('draft', 'pending', 'approved', 'rejected', 'changes_requested');--> statement-breakpoint
CREATE TYPE "public"."report_type" AS ENUM('deployment', 'barrier', 'research');--> statement-breakpoint
CREATE TYPE "public"."verification_source" AS ENUM('work_at_company', 'direct_knowledge', 'additional_evidence', 'industry_insider', 'other');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('report_verified', 'report_approved', 'report_rejected', 'report_changes_requested', 'comment_reply', 'reputation_milestone', 'capability_breakthrough', 'verification_received', 'dispute_received', 'moderation_assigned');--> statement-breakpoint
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
CREATE TABLE "onboarding_response" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"step" integer NOT NULL,
	"question_key" text NOT NULL,
	"response_value" text,
	"created_at" timestamp DEFAULT now() NOT NULL
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
CREATE TABLE "report" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" "report_type" NOT NULL,
	"status" "report_status" DEFAULT 'draft' NOT NULL,
	"is_draft" boolean DEFAULT true NOT NULL,
	"job_id" text,
	"job_title" text,
	"capability_id" text,
	"technology" text NOT NULL,
	"company" text,
	"location" text,
	"country" text,
	"state_province" text,
	"city" text,
	"deployment_status" "deployment_status",
	"deployment_date" timestamp,
	"workers_affected" integer,
	"impact_type" "impact_type",
	"automation_percentage" integer,
	"performance_comparison" "performance_comparison",
	"description" text NOT NULL,
	"moderation_notes" text,
	"moderation_reason" text,
	"moderated_by" text,
	"moderated_at" timestamp,
	"upvotes" integer DEFAULT 0 NOT NULL,
	"downvotes" integer DEFAULT 0 NOT NULL,
	"verification_count" integer DEFAULT 0 NOT NULL,
	"comment_count" integer DEFAULT 0 NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"published_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "report_dispute" (
	"id" text PRIMARY KEY NOT NULL,
	"report_id" text NOT NULL,
	"user_id" text NOT NULL,
	"reason" "dispute_reason" NOT NULL,
	"explanation" text NOT NULL,
	"evidence_links" text[],
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_evidence" (
	"id" text PRIMARY KEY NOT NULL,
	"report_id" text NOT NULL,
	"type" text NOT NULL,
	"url" text,
	"file_url" text,
	"file_name" text,
	"file_size" integer,
	"mime_type" text,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_verification" (
	"id" text PRIMARY KEY NOT NULL,
	"report_id" text NOT NULL,
	"user_id" text NOT NULL,
	"can_verify" boolean DEFAULT true NOT NULL,
	"source" "verification_source" NOT NULL,
	"comment" text,
	"evidence_links" text[],
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_vote" (
	"id" text PRIMARY KEY NOT NULL,
	"report_id" text NOT NULL,
	"user_id" text NOT NULL,
	"vote_type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "report_vote_report_id_user_id_unique" UNIQUE("report_id","user_id")
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
CREATE TABLE "report_comment" (
	"id" text PRIMARY KEY NOT NULL,
	"report_id" text NOT NULL,
	"user_id" text NOT NULL,
	"parent_id" text,
	"content" text NOT NULL,
	"upvotes" integer DEFAULT 0 NOT NULL,
	"downvotes" integer DEFAULT 0 NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_comment_vote" (
	"id" text PRIMARY KEY NOT NULL,
	"comment_id" text NOT NULL,
	"user_id" text NOT NULL,
	"vote_type" "comment_vote_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "report_comment_vote_comment_id_user_id_unique" UNIQUE("comment_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "reputation_history" ADD CONSTRAINT "reputation_history_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badge" ADD CONSTRAINT "user_badge_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_reputation" ADD CONSTRAINT "user_reputation_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_response" ADD CONSTRAINT "onboarding_response_session_id_onboarding_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."onboarding_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_session" ADD CONSTRAINT "onboarding_session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_job_id_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_capability_id_capability_id_fk" FOREIGN KEY ("capability_id") REFERENCES "public"."capability"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_moderated_by_user_id_fk" FOREIGN KEY ("moderated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_dispute" ADD CONSTRAINT "report_dispute_report_id_report_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."report"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_dispute" ADD CONSTRAINT "report_dispute_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_evidence" ADD CONSTRAINT "report_evidence_report_id_report_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."report"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_verification" ADD CONSTRAINT "report_verification_report_id_report_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."report"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_verification" ADD CONSTRAINT "report_verification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_vote" ADD CONSTRAINT "report_vote_report_id_report_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."report"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_vote" ADD CONSTRAINT "report_vote_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_preference" ADD CONSTRAINT "notification_preference_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_comment" ADD CONSTRAINT "report_comment_report_id_report_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."report"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_comment" ADD CONSTRAINT "report_comment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_comment" ADD CONSTRAINT "report_comment_parent_id_report_comment_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."report_comment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_comment_vote" ADD CONSTRAINT "report_comment_vote_comment_id_report_comment_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."report_comment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_comment_vote" ADD CONSTRAINT "report_comment_vote_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;