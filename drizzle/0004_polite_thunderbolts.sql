ALTER TABLE "log_book_entries" ALTER COLUMN "verification_status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "log_book_entries" ALTER COLUMN "verification_status" SET DEFAULT 'DRAFT';