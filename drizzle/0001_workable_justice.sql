CREATE TYPE "public"."bottleneck_severity" AS ENUM('critical', 'major', 'minor');--> statement-breakpoint
CREATE TYPE "public"."capability_status" AS ENUM('solved', 'partial', 'unsolved');--> statement-breakpoint
CREATE TYPE "public"."comment_vote_type" AS ENUM('up', 'down');--> statement-breakpoint
CREATE TYPE "public"."confidence_level" AS ENUM('high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "public"."prediction_background" AS ENUM('general', 'professional', 'academic', 'researcher');--> statement-breakpoint
CREATE TYPE "public"."prediction_confidence" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TABLE "bottleneck" (
	"id" text PRIMARY KEY NOT NULL,
	"capability_id" text NOT NULL,
	"types" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"severity" "bottleneck_severity" NOT NULL,
	"estimated_solve_date" text,
	"organizations_working_on_it" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "capability" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"category_id" text NOT NULL,
	"description" text NOT NULL,
	"technical_description" text NOT NULL,
	"why_it_matters" text NOT NULL,
	"progress_percentage" integer DEFAULT 0 NOT NULL,
	"status" "capability_status" NOT NULL,
	"confidence_level" "confidence_level" NOT NULL,
	"what_works" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"what_struggles" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"what_doesnt_work" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"timeline_estimate" text,
	"expert_consensus" text,
	"community_prediction_median" integer,
	"reasoning" text,
	"jobs_protected_count" integer DEFAULT 0 NOT NULL,
	"jobs_protected_examples" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"research_activity_count" integer DEFAULT 0 NOT NULL,
	"recent_breakthrough_date" timestamp,
	"view_count" integer DEFAULT 0 NOT NULL,
	"tracking_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "capability_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "capability_category" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "capability_category_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "capability_comment" (
	"id" text PRIMARY KEY NOT NULL,
	"capability_id" text NOT NULL,
	"user_id" text NOT NULL,
	"parent_id" text,
	"content" text NOT NULL,
	"upvotes" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "capability_comment_vote" (
	"id" text PRIMARY KEY NOT NULL,
	"comment_id" text NOT NULL,
	"user_id" text NOT NULL,
	"vote_type" "comment_vote_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "capability_comment_vote_comment_id_user_id_unique" UNIQUE("comment_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "capability_organization" (
	"id" text PRIMARY KEY NOT NULL,
	"capability_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"focus_area" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "capability_organization_capability_id_organization_id_unique" UNIQUE("capability_id","organization_id")
);
--> statement-breakpoint
CREATE TABLE "capability_prediction" (
	"id" text PRIMARY KEY NOT NULL,
	"capability_id" text NOT NULL,
	"user_id" text NOT NULL,
	"predicted_year" integer NOT NULL,
	"predicted_year_end" integer,
	"confidence" "prediction_confidence" NOT NULL,
	"reasoning" text,
	"background" "prediction_background" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "capability_prediction_capability_id_user_id_unique" UNIQUE("capability_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "capability_tracking" (
	"id" text PRIMARY KEY NOT NULL,
	"capability_id" text NOT NULL,
	"user_id" text NOT NULL,
	"notifications_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "capability_tracking_capability_id_user_id_unique" UNIQUE("capability_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"website_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organization_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "bottleneck" ADD CONSTRAINT "bottleneck_capability_id_capability_id_fk" FOREIGN KEY ("capability_id") REFERENCES "public"."capability"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capability" ADD CONSTRAINT "capability_category_id_capability_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."capability_category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capability_comment" ADD CONSTRAINT "capability_comment_capability_id_capability_id_fk" FOREIGN KEY ("capability_id") REFERENCES "public"."capability"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capability_comment" ADD CONSTRAINT "capability_comment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capability_comment" ADD CONSTRAINT "capability_comment_parent_id_capability_comment_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."capability_comment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capability_comment_vote" ADD CONSTRAINT "capability_comment_vote_comment_id_capability_comment_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."capability_comment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capability_comment_vote" ADD CONSTRAINT "capability_comment_vote_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capability_organization" ADD CONSTRAINT "capability_organization_capability_id_capability_id_fk" FOREIGN KEY ("capability_id") REFERENCES "public"."capability"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capability_organization" ADD CONSTRAINT "capability_organization_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capability_prediction" ADD CONSTRAINT "capability_prediction_capability_id_capability_id_fk" FOREIGN KEY ("capability_id") REFERENCES "public"."capability"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capability_prediction" ADD CONSTRAINT "capability_prediction_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capability_tracking" ADD CONSTRAINT "capability_tracking_capability_id_capability_id_fk" FOREIGN KEY ("capability_id") REFERENCES "public"."capability"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capability_tracking" ADD CONSTRAINT "capability_tracking_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;