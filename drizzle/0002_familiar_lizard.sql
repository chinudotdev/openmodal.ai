CREATE TYPE "public"."automation_status" AS ENUM('safe', 'partial', 'high_risk', 'automated');--> statement-breakpoint
CREATE TYPE "public"."difficulty_level" AS ENUM('trivial', 'easy', 'moderate', 'hard', 'very_hard');--> statement-breakpoint
CREATE TYPE "public"."growth_outlook" AS ENUM('growing', 'stable', 'declining');--> statement-breakpoint
CREATE TYPE "public"."importance_level" AS ENUM('critical', 'important', 'minor');--> statement-breakpoint
CREATE TYPE "public"."task_automation_status" AS ENUM('safe', 'partial', 'replaceable');--> statement-breakpoint
CREATE TABLE "job" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"industry" text NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"short_description" text NOT NULL,
	"key_responsibilities" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"automation_percentage" integer DEFAULT 0 NOT NULL,
	"automation_status" "automation_status" NOT NULL,
	"total_tasks" integer DEFAULT 0 NOT NULL,
	"tasks_replaceable" integer DEFAULT 0 NOT NULL,
	"tasks_partial" integer DEFAULT 0 NOT NULL,
	"tasks_safe" integer DEFAULT 0 NOT NULL,
	"total_workers_global" integer,
	"total_workers_usa" integer,
	"median_salary_usa" numeric(10, 2),
	"growth_outlook" "growth_outlook",
	"growth_rate" numeric(5, 2),
	"bls_occ_code" text,
	"bls_last_updated" timestamp,
	"estimated_automation_year" integer,
	"confidence_level" text DEFAULT 'medium' NOT NULL,
	"ai_summary" text,
	"last_ai_analysis" timestamp,
	"meta_description" text,
	"meta_keywords" text[],
	"view_count" integer DEFAULT 0 NOT NULL,
	"tracking_count" integer DEFAULT 0 NOT NULL,
	"report_count" integer DEFAULT 0 NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"data_quality" integer DEFAULT 0 NOT NULL,
	"last_reviewed" timestamp,
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
	"task_count" integer DEFAULT 0 NOT NULL,
	"percentage_of_job" integer DEFAULT 0 NOT NULL,
	"blocking_automation" boolean DEFAULT false NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_comment" (
	"id" text PRIMARY KEY NOT NULL,
	"job_id" text NOT NULL,
	"user_id" text NOT NULL,
	"parent_id" text,
	"content" text NOT NULL,
	"upvotes" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_geographic_data" (
	"id" text PRIMARY KEY NOT NULL,
	"job_id" text NOT NULL,
	"country" text NOT NULL,
	"state_province" text,
	"city" text,
	"workers_count" integer,
	"median_salary" numeric(10, 2),
	"automation_status" "automation_status",
	"deployment_count" integer DEFAULT 0 NOT NULL,
	"source_type" text,
	"source_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_tracking" (
	"id" text PRIMARY KEY NOT NULL,
	"job_id" text NOT NULL,
	"user_id" text NOT NULL,
	"email_notifications" boolean DEFAULT true NOT NULL,
	"reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "related_job" (
	"id" text PRIMARY KEY NOT NULL,
	"job_id" text NOT NULL,
	"related_job_id" text NOT NULL,
	"similarity_score" integer NOT NULL,
	"relationship_type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task" (
	"id" text PRIMARY KEY NOT NULL,
	"job_id" text NOT NULL,
	"description" text NOT NULL,
	"category" text,
	"automation_status" "task_automation_status" NOT NULL,
	"difficulty_to_automate" "difficulty_level" NOT NULL,
	"percentage_of_job" integer NOT NULL,
	"time_spent_hours_per_week" numeric(5, 2),
	"reasoning_notes" text,
	"evidence_links" text[],
	"existing_ai_solutions" text[],
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
ALTER TABLE "job_capability" ADD CONSTRAINT "job_capability_job_id_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_capability" ADD CONSTRAINT "job_capability_capability_id_capability_id_fk" FOREIGN KEY ("capability_id") REFERENCES "public"."capability"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_comment" ADD CONSTRAINT "job_comment_job_id_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_comment" ADD CONSTRAINT "job_comment_parent_id_job_comment_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."job_comment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_geographic_data" ADD CONSTRAINT "job_geographic_data_job_id_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_tracking" ADD CONSTRAINT "job_tracking_job_id_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "related_job" ADD CONSTRAINT "related_job_job_id_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "related_job" ADD CONSTRAINT "related_job_related_job_id_job_id_fk" FOREIGN KEY ("related_job_id") REFERENCES "public"."job"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_job_id_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_capability" ADD CONSTRAINT "task_capability_task_id_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."task"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_capability" ADD CONSTRAINT "task_capability_capability_id_capability_id_fk" FOREIGN KEY ("capability_id") REFERENCES "public"."capability"("id") ON DELETE cascade ON UPDATE no action;