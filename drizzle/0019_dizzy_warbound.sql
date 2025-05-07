ALTER TABLE "log_book_templates" ALTER COLUMN "academic_year_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "log_book_templates" ALTER COLUMN "phase_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "log_book_templates" ALTER COLUMN "subject_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "log_book_templates" ADD COLUMN "template_type" text;