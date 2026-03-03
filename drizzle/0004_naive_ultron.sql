CREATE TYPE "public"."draft_change_operation" AS ENUM('create', 'update', 'delete');--> statement-breakpoint
CREATE TYPE "public"."draft_change_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."draft_change_type" AS ENUM('capability', 'capability_subtype', 'job');--> statement-breakpoint
CREATE TABLE "draft_change" (
	"id" text PRIMARY KEY NOT NULL,
	"entity_type" "draft_change_type" NOT NULL,
	"operation" "draft_change_operation" NOT NULL,
	"entity_id" text,
	"data" jsonb NOT NULL,
	"status" "draft_change_status" DEFAULT 'pending' NOT NULL,
	"submitted_by" text NOT NULL,
	"reviewed_by" text,
	"reviewed_at" timestamp,
	"response" text,
	"reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "draft_change" ADD CONSTRAINT "draft_change_submitted_by_user_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "draft_change" ADD CONSTRAINT "draft_change_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;