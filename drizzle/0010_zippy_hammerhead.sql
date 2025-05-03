DROP INDEX "teacher_subject_unique";--> statement-breakpoint
ALTER TABLE "student_profiles" ALTER COLUMN "year_of_passing" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "teacher_subjects" ADD COLUMN "branch_id" uuid;--> statement-breakpoint
ALTER TABLE "teacher_subjects" ADD COLUMN "course_id" uuid;--> statement-breakpoint
ALTER TABLE "teacher_subjects" ADD CONSTRAINT "teacher_subjects_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_subjects" ADD CONSTRAINT "teacher_subjects_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "teacher_subject_unique" ON "teacher_subjects" USING btree ("teacher_id","subject_id","academic_year_id","phase_id","branch_id","course_id");