ALTER TABLE "log_book_entries" ALTER COLUMN "status" SET DATA TYPE verification_status;--> statement-breakpoint
ALTER TABLE "log_book_entries" ALTER COLUMN "status" SET DEFAULT 'PENDING';--> statement-breakpoint
ALTER TABLE "student_profiles" ADD COLUMN "status" "verification_status" DEFAULT 'PENDING';