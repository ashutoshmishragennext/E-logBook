ALTER TABLE "log_book_entries" ADD COLUMN "verification_status" "verification_status" DEFAULT 'PENDING';--> statement-breakpoint
ALTER TABLE "student_profiles" ADD COLUMN "verification_status" "verification_status" DEFAULT 'PENDING';--> statement-breakpoint
ALTER TABLE "student_profiles" ADD COLUMN "teacher_id" uuid;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_teacher_id_teacher_profiles_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teacher_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "log_book_entries" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "student_profiles" DROP COLUMN "status";