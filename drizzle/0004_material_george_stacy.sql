ALTER TABLE "modules" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "modules" CASCADE;--> statement-breakpoint
ALTER TABLE "log_book_templates" RENAME COLUMN "module_id" TO "teacher_subject_id";--> statement-breakpoint
ALTER TABLE "subjects" DROP CONSTRAINT "subjects_code_unique";--> statement-breakpoint
ALTER TABLE "log_book_templates" DROP CONSTRAINT "log_book_templates_module_id_modules_id_fk";
--> statement-breakpoint
ALTER TABLE "subjects" DROP CONSTRAINT "subjects_phase_id_phase_id_fk";
--> statement-breakpoint
ALTER TABLE "teacher_profiles" DROP CONSTRAINT "teacher_profiles_branch_id_branches_id_fk";
--> statement-breakpoint
ALTER TABLE "teacher_profiles" DROP CONSTRAINT "teacher_profiles_course_id_courses_id_fk";
--> statement-breakpoint
ALTER TABLE "teacher_profiles" DROP CONSTRAINT "teacher_profiles_academic_year_id_academic_years_id_fk";
--> statement-breakpoint
ALTER TABLE "teacher_profiles" DROP CONSTRAINT "teacher_profiles_phase_id_phase_id_fk";
--> statement-breakpoint
DROP INDEX "student_enrollment_no_key";--> statement-breakpoint
DROP INDEX "course_branch_code_key";--> statement-breakpoint
ALTER TABLE "teacher_subjects" ALTER COLUMN "academic_year_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "teacher_subjects" ALTER COLUMN "phase_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "colleges" ADD COLUMN "country" text;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD COLUMN "country" text;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "student_subjects" ADD COLUMN "teacher_subject_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "subjects" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "subjects" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "log_book_templates" ADD CONSTRAINT "log_book_templates_teacher_subject_id_teacher_subjects_id_fk" FOREIGN KEY ("teacher_subject_id") REFERENCES "public"."teacher_subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_subjects" ADD CONSTRAINT "student_subjects_teacher_subject_id_teacher_subjects_id_fk" FOREIGN KEY ("teacher_subject_id") REFERENCES "public"."teacher_subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "subject_course_code_key" ON "subjects" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "course_branch_code_key" ON "courses" USING btree ("branch_id");--> statement-breakpoint
ALTER TABLE "courses" DROP COLUMN "code";--> statement-breakpoint
ALTER TABLE "courses" DROP COLUMN "level";--> statement-breakpoint
ALTER TABLE "student_profiles" DROP COLUMN "permanent_address";--> statement-breakpoint
ALTER TABLE "student_profiles" DROP COLUMN "previous_institution";--> statement-breakpoint
ALTER TABLE "student_profiles" DROP COLUMN "attempt";--> statement-breakpoint
ALTER TABLE "student_profiles" DROP COLUMN "children";--> statement-breakpoint
ALTER TABLE "student_profiles" DROP COLUMN "special_interest";--> statement-breakpoint
ALTER TABLE "student_profiles" DROP COLUMN "future_plan";--> statement-breakpoint
ALTER TABLE "student_profiles" DROP COLUMN "previous_experience";--> statement-breakpoint
ALTER TABLE "student_profiles" DROP COLUMN "enrollment_no";--> statement-breakpoint
ALTER TABLE "student_profiles" DROP COLUMN "current_semester";--> statement-breakpoint
ALTER TABLE "student_profiles" DROP COLUMN "enrollment_status";--> statement-breakpoint
ALTER TABLE "student_profiles" DROP COLUMN "date_of_joining";--> statement-breakpoint
ALTER TABLE "student_profiles" DROP COLUMN "date_of_completion";--> statement-breakpoint
ALTER TABLE "student_profiles" DROP COLUMN "graduation_date";--> statement-breakpoint
ALTER TABLE "student_profiles" DROP COLUMN "admission_batch";--> statement-breakpoint
ALTER TABLE "student_profiles" DROP COLUMN "is_active";--> statement-breakpoint
ALTER TABLE "subjects" DROP COLUMN "phase_id";--> statement-breakpoint
ALTER TABLE "teacher_profiles" DROP COLUMN "branch_id";--> statement-breakpoint
ALTER TABLE "teacher_profiles" DROP COLUMN "course_id";--> statement-breakpoint
ALTER TABLE "teacher_profiles" DROP COLUMN "academic_year_id";--> statement-breakpoint
ALTER TABLE "teacher_profiles" DROP COLUMN "phase_id";--> statement-breakpoint
ALTER TABLE "teacher_profiles" DROP COLUMN "joining_date";--> statement-breakpoint
ALTER TABLE "teacher_profiles" DROP COLUMN "is_active";