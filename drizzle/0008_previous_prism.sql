CREATE TYPE "public"."industry_status" AS ENUM('active', 'hidden');--> statement-breakpoint
CREATE TABLE "industry" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"icon" text,
	"short_description" text,
	"long_description" text,
	"parent_industry_id" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"status" "industry_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "industry_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "job" RENAME COLUMN "industry" TO "industry_id";--> statement-breakpoint
DROP INDEX "idx_job_industry";--> statement-breakpoint
-- Populate industry table with distinct values from job.industry_id before adding FK constraint
INSERT INTO "industry" ("id", "slug", "name", "display_order", "status", "created_at", "updated_at")
SELECT DISTINCT
	"industry_id" as "id",
	LOWER(REGEXP_REPLACE(REGEXP_REPLACE("industry_id", '^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$', '', 'g'), '[^a-zA-Z0-9]+', '_', 'g')) as "slug",
	"industry_id" as "name",
	0 as "display_order",
	'active'::"industry_status" as "status",
	NOW() as "created_at",
	NOW() as "updated_at"
FROM "job"
WHERE "industry_id" IS NOT NULL AND "industry_id" != ''
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
ALTER TABLE "capability_category" ADD COLUMN "display_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "industry" ADD CONSTRAINT "industry_parent_industry_id_industry_id_fk" FOREIGN KEY ("parent_industry_id") REFERENCES "public"."industry"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_industry_slug" ON "industry" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_industry_name" ON "industry" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_industry_status" ON "industry" USING btree ("status");--> statement-breakpoint
ALTER TABLE "job" ADD CONSTRAINT "job_industry_id_industry_id_fk" FOREIGN KEY ("industry_id") REFERENCES "public"."industry"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_job_industry" ON "job" USING btree ("industry_id");