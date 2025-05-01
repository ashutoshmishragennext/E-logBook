ALTER TABLE "log_book_entries" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "student_subjects" ALTER COLUMN "has_logbook_access" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "student_subjects" ALTER COLUMN "has_logbook_access" SET DEFAULT 'false';