CREATE TABLE "student_subjects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"subject_id" uuid NOT NULL,
	"teacher_id" uuid NOT NULL,
	"academic_year_id" uuid NOT NULL,
	"phase_id" uuid NOT NULL,
	"verification_status" "verification_status" DEFAULT 'PENDING',
	"rejection_reason" text,
	"approved_at" timestamp,
	"has_logbook_access" text DEFAULT 'false',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teacher_subjects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teacher_id" uuid NOT NULL,
	"subject_id" uuid NOT NULL,
	"academic_year_id" uuid NOT NULL,
	"phase_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "teacher_profiles" DROP CONSTRAINT "teacher_profiles_subject_id_subjects_id_fk";
--> statement-breakpoint
ALTER TABLE "log_book_entries" ADD COLUMN "student_subject_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "student_subjects" ADD CONSTRAINT "student_subjects_student_id_student_profiles_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_subjects" ADD CONSTRAINT "student_subjects_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_subjects" ADD CONSTRAINT "student_subjects_teacher_id_teacher_profiles_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teacher_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_subjects" ADD CONSTRAINT "student_subjects_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_subjects" ADD CONSTRAINT "student_subjects_phase_id_phase_id_fk" FOREIGN KEY ("phase_id") REFERENCES "public"."phase"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_subjects" ADD CONSTRAINT "teacher_subjects_teacher_id_teacher_profiles_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teacher_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_subjects" ADD CONSTRAINT "teacher_subjects_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_subjects" ADD CONSTRAINT "teacher_subjects_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_subjects" ADD CONSTRAINT "teacher_subjects_phase_id_phase_id_fk" FOREIGN KEY ("phase_id") REFERENCES "public"."phase"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "student_subject_teacher_unique" ON "student_subjects" USING btree ("student_id","subject_id","teacher_id","academic_year_id","phase_id");--> statement-breakpoint
CREATE UNIQUE INDEX "teacher_subject_unique" ON "teacher_subjects" USING btree ("teacher_id","subject_id","academic_year_id","phase_id");--> statement-breakpoint
ALTER TABLE "log_book_entries" ADD CONSTRAINT "log_book_entries_student_subject_id_student_subjects_id_fk" FOREIGN KEY ("student_subject_id") REFERENCES "public"."student_subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_profiles" DROP COLUMN "name_and_occupation_of_spouse";--> statement-breakpoint
ALTER TABLE "teacher_profiles" DROP COLUMN "subject_id";