CREATE TYPE "public"."enrichment_confidence" AS ENUM('certain', 'likely', 'guess');--> statement-breakpoint
CREATE TYPE "public"."enrichment_type" AS ENUM('job_link', 'technology_link', 'task_link', 'capability_subtype_link');--> statement-breakpoint
CREATE TYPE "public"."flag_reason" AS ENUM('spam', 'fake', 'duplicate', 'inappropriate', 'other');--> statement-breakpoint
CREATE TYPE "public"."impact_type" AS ENUM('layoffs', 'reduced_hours', 'role_change', 'new_tools', 'productivity_boost', 'no_change');--> statement-breakpoint
CREATE TYPE "public"."reporter_relationship" AS ENUM('employee', 'former_employee', 'manager', 'witness', 'news', 'researcher');--> statement-breakpoint
ALTER TYPE "public"."entity_type" ADD VALUE 'capability_subtype' BEFORE 'job';--> statement-breakpoint
ALTER TYPE "public"."suggestion_type" ADD VALUE 'capability_subtype' BEFORE 'organization';--> statement-breakpoint
ALTER TYPE "public"."suggestion_type" ADD VALUE 'task' BEFORE 'organization';--> statement-breakpoint
CREATE TABLE "capability_subtype" (
	"id" text PRIMARY KEY NOT NULL,
	"capability_id" text NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"domain" text NOT NULL,
	"description" text NOT NULL,
	"progress_percentage" integer DEFAULT 0 NOT NULL,
	"status" "capability_status" NOT NULL,
	"what_works" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"what_struggles" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"what_doesnt_work" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "capability_subtype_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "task_capability_subtype" (
	"id" text PRIMARY KEY NOT NULL,
	"task_id" text NOT NULL,
	"capability_subtype_id" text NOT NULL,
	"importance" "importance_level" NOT NULL,
	"minimum_level_required" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_enrichment" (
	"id" text PRIMARY KEY NOT NULL,
	"report_id" text NOT NULL,
	"user_id" text NOT NULL,
	"enrichment_type" "enrichment_type" NOT NULL,
	"linked_entity_id" text,
	"suggested_name" text,
	"confidence" "enrichment_confidence" NOT NULL,
	"notes" text,
	"upvotes" integer DEFAULT 0 NOT NULL,
	"downvotes" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_flag" (
	"id" text PRIMARY KEY NOT NULL,
	"report_id" text NOT NULL,
	"user_id" text NOT NULL,
	"reason" "flag_reason" NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "technology_capability_subtype" (
	"id" text PRIMARY KEY NOT NULL,
	"technology_id" text NOT NULL,
	"capability_subtype_id" text NOT NULL,
	"performance_score" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "technology_capability" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "technology_job" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "job_capability" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "task_capability" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "onboarding_session" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "onboarding_response" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "impact_report_capability" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "technology_capability" CASCADE;--> statement-breakpoint
DROP TABLE "technology_job" CASCADE;--> statement-breakpoint
DROP TABLE "job_capability" CASCADE;--> statement-breakpoint
DROP TABLE "task_capability" CASCADE;--> statement-breakpoint
DROP TABLE "onboarding_session" CASCADE;--> statement-breakpoint
DROP TABLE "onboarding_response" CASCADE;--> statement-breakpoint
DROP TABLE "impact_report_capability" CASCADE;--> statement-breakpoint
ALTER TABLE "impact_report" DROP CONSTRAINT "impact_report_job_id_job_id_fk";
--> statement-breakpoint
ALTER TABLE "impact_report" DROP CONSTRAINT "impact_report_reviewed_by_user_id_fk";
--> statement-breakpoint
ALTER TABLE "impact_report" DROP CONSTRAINT "impact_report_technology_id_technology_id_fk";
--> statement-breakpoint
ALTER TABLE "impact_report" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "impact_report" ALTER COLUMN "status" SET DEFAULT 'published'::text;--> statement-breakpoint
DROP TYPE "public"."report_status";--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('published', 'flagged', 'removed');--> statement-breakpoint
ALTER TABLE "impact_report" ALTER COLUMN "status" SET DEFAULT 'published'::"public"."report_status";--> statement-breakpoint
ALTER TABLE "impact_report" ALTER COLUMN "status" SET DATA TYPE "public"."report_status" USING "status"::"public"."report_status";--> statement-breakpoint
ALTER TABLE "organization" ALTER COLUMN "types" SET DEFAULT ARRAY[]::text[];--> statement-breakpoint
ALTER TABLE "technology" ALTER COLUMN "aliases" SET DEFAULT ARRAY[]::text[];--> statement-breakpoint
ALTER TABLE "impact_report" ALTER COLUMN "title" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "impact_report" ALTER COLUMN "technology_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "onboarding_completed" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "impact_report" ADD COLUMN "job_title" text NOT NULL;--> statement-breakpoint
ALTER TABLE "impact_report" ADD COLUMN "impact_type" "impact_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "impact_report" ADD COLUMN "country" text;--> statement-breakpoint
ALTER TABLE "impact_report" ADD COLUMN "company_name" text;--> statement-breakpoint
ALTER TABLE "impact_report" ADD COLUMN "company_size" "company_size";--> statement-breakpoint
ALTER TABLE "impact_report" ADD COLUMN "technology_description" text;--> statement-breakpoint
ALTER TABLE "impact_report" ADD COLUMN "workers_affected_count" integer;--> statement-breakpoint
ALTER TABLE "impact_report" ADD COLUMN "is_anonymous" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "impact_report" ADD COLUMN "reporter_relationship" "reporter_relationship";--> statement-breakpoint
ALTER TABLE "impact_report" ADD COLUMN "view_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "capability_subtype" ADD CONSTRAINT "capability_subtype_capability_id_capability_id_fk" FOREIGN KEY ("capability_id") REFERENCES "public"."capability"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_capability_subtype" ADD CONSTRAINT "task_capability_subtype_task_id_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."task"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_capability_subtype" ADD CONSTRAINT "task_capability_subtype_capability_subtype_id_capability_subtype_id_fk" FOREIGN KEY ("capability_subtype_id") REFERENCES "public"."capability_subtype"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_enrichment" ADD CONSTRAINT "report_enrichment_report_id_impact_report_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."impact_report"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_enrichment" ADD CONSTRAINT "report_enrichment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_flag" ADD CONSTRAINT "report_flag_report_id_impact_report_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."impact_report"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_flag" ADD CONSTRAINT "report_flag_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technology_capability_subtype" ADD CONSTRAINT "technology_capability_subtype_technology_id_technology_id_fk" FOREIGN KEY ("technology_id") REFERENCES "public"."technology"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technology_capability_subtype" ADD CONSTRAINT "technology_capability_subtype_capability_subtype_id_capability_subtype_id_fk" FOREIGN KEY ("capability_subtype_id") REFERENCES "public"."capability_subtype"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "impact_report" ADD CONSTRAINT "impact_report_technology_id_technology_id_fk" FOREIGN KEY ("technology_id") REFERENCES "public"."technology"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "capability" DROP COLUMN "progress_percentage";--> statement-breakpoint
ALTER TABLE "capability" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "capability" DROP COLUMN "what_works";--> statement-breakpoint
ALTER TABLE "capability" DROP COLUMN "what_struggles";--> statement-breakpoint
ALTER TABLE "capability" DROP COLUMN "what_doesnt_work";--> statement-breakpoint
ALTER TABLE "impact_report" DROP COLUMN "job_id";--> statement-breakpoint
ALTER TABLE "impact_report" DROP COLUMN "submitted_at";--> statement-breakpoint
ALTER TABLE "impact_report" DROP COLUMN "reviewed_by";--> statement-breakpoint
ALTER TABLE "impact_report" DROP COLUMN "reviewed_at";--> statement-breakpoint
ALTER TABLE "impact_report" DROP COLUMN "rejection_reason";--> statement-breakpoint
ALTER TABLE "impact_report" DROP COLUMN "verification_status";--> statement-breakpoint
DROP TYPE "public"."verification_status";