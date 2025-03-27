CREATE TYPE "public"."field_type" AS ENUM('text', 'number', 'date', 'select', 'textarea', 'file');--> statement-breakpoint
ALTER TABLE "dynamic_field_configs" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "dynamic_field_configs" CASCADE;--> statement-breakpoint
ALTER TABLE "log_books" ADD COLUMN "teacher_id" uuid;--> statement-breakpoint
ALTER TABLE "log_books" ADD COLUMN "competency" text;--> statement-breakpoint
ALTER TABLE "log_books" ADD COLUMN "skill" text;--> statement-breakpoint
ALTER TABLE "log_books" ADD COLUMN "portfolio_link" text;--> statement-breakpoint
ALTER TABLE "log_books" ADD COLUMN "from_date" timestamp;--> statement-breakpoint
ALTER TABLE "log_books" ADD COLUMN "to_date" timestamp;--> statement-breakpoint
ALTER TABLE "log_books" ADD COLUMN "procedure_count" text;--> statement-breakpoint
ALTER TABLE "log_books" ADD COLUMN "dynamic_schema" jsonb DEFAULT '{"groups":[]}'::jsonb;--> statement-breakpoint
ALTER TABLE "log_books" ADD COLUMN "dynamic_fields" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "log_books" ADD COLUMN "teacher_remarks" text;--> statement-breakpoint
ALTER TABLE "log_books" ADD COLUMN "feedback_received" numeric(3, 2);--> statement-breakpoint
ALTER TABLE "log_books" ADD CONSTRAINT "log_books_teacher_id_teacher_profiles_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teacher_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "log_books" DROP COLUMN "dynamic_field_groups";