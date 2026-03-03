ALTER TABLE "draft_change" ALTER COLUMN "entity_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."draft_change_type";--> statement-breakpoint
CREATE TYPE "public"."draft_change_type" AS ENUM('capability', 'capability_subtype', 'job');--> statement-breakpoint
ALTER TABLE "draft_change" ALTER COLUMN "entity_type" SET DATA TYPE "public"."draft_change_type" USING "entity_type"::"public"."draft_change_type";