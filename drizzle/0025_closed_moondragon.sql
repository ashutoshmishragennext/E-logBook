ALTER TABLE "log_book_entries" ALTER COLUMN "status" SET DEFAULT 'SUBMITTED';--> statement-breakpoint
DROP TYPE "public"."logbook_entry_status";--> statement-breakpoint
CREATE TYPE "public"."logbook_entry_status" AS ENUM('SUBMITTED', 'REVIEWED', 'APPROVED', 'REJECTED');