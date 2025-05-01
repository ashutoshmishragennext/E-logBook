CREATE TYPE "public"."logbook_entry_status" AS ENUM('DRAFT', 'SUBMITTED', 'REVIEWED', 'APPROVED', 'REJECTED');--> statement-breakpoint
ALTER TABLE "log_book_entries" RENAME COLUMN "verification_status" TO "status";--> statement-breakpoint
ALTER TABLE "student_subjects" DROP CONSTRAINT "student_subjects_teacher_id_teacher_profiles_id_fk";
--> statement-breakpoint
DROP INDEX "student_subject_teacher_unique";--> statement-breakpoint
ALTER TABLE "log_book_templates" ALTER COLUMN "teacher_subject_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "student_profiles" ALTER COLUMN "date_of_birth" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "student_profiles" ALTER COLUMN "year_of_passing" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "student_subjects" ALTER COLUMN "has_logbook_access" SET DATA TYPE boolean;--> statement-breakpoint
ALTER TABLE "student_subjects" ALTER COLUMN "has_logbook_access" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "colleges" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "colleges" ADD CONSTRAINT "colleges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "college_user_id_key" ON "colleges" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "student_subject_teacher_unique" ON "student_subjects" USING btree ("student_id","subject_id","teacher_subject_id","academic_year_id","phase_id");--> statement-breakpoint
ALTER TABLE "student_subjects" DROP COLUMN "teacher_id";