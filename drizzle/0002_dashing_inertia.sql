ALTER TABLE "log_books" DROP CONSTRAINT "log_books_teacher_id_teacher_profiles_id_fk";
--> statement-breakpoint
DROP INDEX "dynamic_field_config_unique";--> statement-breakpoint
ALTER TABLE "dynamic_field_configs" ADD COLUMN "group_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "dynamic_field_configs" ADD COLUMN "field_label" text;--> statement-breakpoint
ALTER TABLE "dynamic_field_configs" ADD COLUMN "validation_regex" text;--> statement-breakpoint
ALTER TABLE "dynamic_field_configs" ADD COLUMN "default_value" text;--> statement-breakpoint
ALTER TABLE "log_books" ADD COLUMN "dynamic_field_groups" jsonb;--> statement-breakpoint
CREATE UNIQUE INDEX "dynamic_field_config_unique" ON "dynamic_field_configs" USING btree ("group_name","field_name");--> statement-breakpoint
ALTER TABLE "dynamic_field_configs" DROP COLUMN "course_name";--> statement-breakpoint
ALTER TABLE "log_books" DROP COLUMN "teacher_id";--> statement-breakpoint
ALTER TABLE "log_books" DROP COLUMN "competency";--> statement-breakpoint
ALTER TABLE "log_books" DROP COLUMN "skill";--> statement-breakpoint
ALTER TABLE "log_books" DROP COLUMN "portfolio_link";--> statement-breakpoint
ALTER TABLE "log_books" DROP COLUMN "from_date";--> statement-breakpoint
ALTER TABLE "log_books" DROP COLUMN "to_date";--> statement-breakpoint
ALTER TABLE "log_books" DROP COLUMN "procedure_count";--> statement-breakpoint
ALTER TABLE "log_books" DROP COLUMN "dynamic_fields";--> statement-breakpoint
ALTER TABLE "log_books" DROP COLUMN "teacher_remarks";--> statement-breakpoint
ALTER TABLE "log_books" DROP COLUMN "feedback_received";