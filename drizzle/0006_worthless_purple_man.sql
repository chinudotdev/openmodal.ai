CREATE TYPE "public"."activity_type" AS ENUM('login', 'report_submitted', 'verification_completed', 'comment_created', 'upvote_given');--> statement-breakpoint
CREATE TYPE "public"."application_status" AS ENUM('pending', 'approved', 'rejected', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."nomination_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."streak_type" AS ENUM('activity', 'verification');--> statement-breakpoint
CREATE TYPE "public"."strike_status" AS ENUM('active', 'appealed', 'overturned', 'expired');--> statement-breakpoint
CREATE TYPE "public"."strike_type" AS ENUM('yellow', 'red');--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'badge_earned';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'streak_milestone';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'role_eligible';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'application_status';--> statement-breakpoint
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
ALTER TABLE "user_badge" ADD COLUMN "badge_icon" text;--> statement-breakpoint
ALTER TABLE "user_badge" ADD COLUMN "badge_category" text;--> statement-breakpoint
ALTER TABLE "user_badge" ADD COLUMN "rarity" text;--> statement-breakpoint
ALTER TABLE "user_badge" ADD COLUMN "pinned" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user_badge" ADD COLUMN "pinned_order" integer;--> statement-breakpoint
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expert_application" ADD CONSTRAINT "expert_application_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderator_nomination" ADD CONSTRAINT "moderator_nomination_candidate_id_user_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderator_nomination" ADD CONSTRAINT "moderator_nomination_nominated_by_user_id_fk" FOREIGN KEY ("nominated_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderator_nomination" ADD CONSTRAINT "moderator_nomination_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderator_strike" ADD CONSTRAINT "moderator_strike_moderator_id_user_id_fk" FOREIGN KEY ("moderator_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderator_strike" ADD CONSTRAINT "moderator_strike_issued_by_user_id_fk" FOREIGN KEY ("issued_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderator_strike" ADD CONSTRAINT "moderator_strike_appeal_reviewed_by_user_id_fk" FOREIGN KEY ("appeal_reviewed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_streak" ADD CONSTRAINT "user_streak_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_job_title" ON "job" USING btree ("title");--> statement-breakpoint
CREATE INDEX "idx_job_industry" ON "job" USING btree ("industry");