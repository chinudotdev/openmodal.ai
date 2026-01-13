CREATE TYPE "public"."moderation_action" AS ENUM('approve', 'reject', 'request_changes', 'ban_user', 'unban_user', 'delete_report', 'restore_report');--> statement-breakpoint
CREATE TABLE "moderation_audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"moderator_id" text NOT NULL,
	"action" "moderation_action" NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"reason" text,
	"notes" text,
	"metadata" jsonb,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "report_comment_vote" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "report_evidence" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "report_vote" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "moderation_audit_log" ADD CONSTRAINT "moderation_audit_log_moderator_id_user_id_fk" FOREIGN KEY ("moderator_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;