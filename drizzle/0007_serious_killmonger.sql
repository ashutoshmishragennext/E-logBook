CREATE TABLE "phase" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"academic_year_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "batches" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "batches" CASCADE;--> statement-breakpoint
ALTER TABLE "log_book_templates" DROP CONSTRAINT "log_book_templates_batch_id_batches_id_fk";
--> statement-breakpoint
ALTER TABLE "log_book_templates" ADD COLUMN "phase_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "subjects" ADD COLUMN "phase_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "phase" ADD CONSTRAINT "phase_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "log_book_templates" ADD CONSTRAINT "log_book_templates_phase_id_phase_id_fk" FOREIGN KEY ("phase_id") REFERENCES "public"."phase"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_phase_id_phase_id_fk" FOREIGN KEY ("phase_id") REFERENCES "public"."phase"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "log_book_templates" DROP COLUMN "batch_id";