CREATE TYPE "public"."field_type" AS ENUM('text', 'number', 'date', 'select', 'textarea', 'file');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'TEACHER', 'STUDENT', 'USER');--> statement-breakpoint
CREATE TYPE "public"."verification_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TABLE "academic_years" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	CONSTRAINT "academic_years_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "email_verification_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"email" text NOT NULL,
	"token" uuid NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "log_book_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"log_book_template_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"teacher_id" uuid,
	"dynamic_fields" jsonb DEFAULT '{}'::jsonb,
	"student_remarks" text,
	"teacher_remarks" text,
	"status" text DEFAULT 'DRAFT',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "log_book_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"academic_year_id" uuid NOT NULL,
	"phase_id" uuid NOT NULL,
	"subject_id" uuid NOT NULL,
	"module_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"dynamic_schema" jsonb DEFAULT '{"groups":[]}'::jsonb,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "modules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"subject_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"token" uuid NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "phase" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"academic_year_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "phone_verification_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone" text NOT NULL,
	"otp" text NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"roll_no" text NOT NULL,
	"mobile_no" text NOT NULL,
	"email" text NOT NULL,
	"profile_photo" text,
	"date_of_birth" text,
	"local_address" text,
	"permanent_address" text,
	"adhar_no" text,
	"previous_institution" text,
	"year_of_passing" text,
	"attempt" text,
	"state" text,
	"date_of_joining" text,
	"perivious_experience" text,
	"merital_status" text,
	"children" text,
	"special_interest" text,
	"date_of_completion" text,
	"name_and_occpation_of_spouse" text,
	"future_plan" text,
	"admission_batch" text,
	"course" text,
	"subject" text,
	"college_id_proof" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"phase_id" uuid NOT NULL,
	CONSTRAINT "subjects_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "teacher_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"mobile_no" text NOT NULL,
	"profile_photo" text,
	"teacher_id_proof" text,
	"location" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" timestamp,
	"password" text NOT NULL,
	"role" "user_role" DEFAULT 'STUDENT' NOT NULL,
	"phone" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "log_book_entries" ADD CONSTRAINT "log_book_entries_log_book_template_id_log_book_templates_id_fk" FOREIGN KEY ("log_book_template_id") REFERENCES "public"."log_book_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "log_book_entries" ADD CONSTRAINT "log_book_entries_student_id_student_profiles_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "log_book_entries" ADD CONSTRAINT "log_book_entries_teacher_id_teacher_profiles_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teacher_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "log_book_templates" ADD CONSTRAINT "log_book_templates_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "log_book_templates" ADD CONSTRAINT "log_book_templates_phase_id_phase_id_fk" FOREIGN KEY ("phase_id") REFERENCES "public"."phase"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "log_book_templates" ADD CONSTRAINT "log_book_templates_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "log_book_templates" ADD CONSTRAINT "log_book_templates_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "log_book_templates" ADD CONSTRAINT "log_book_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modules" ADD CONSTRAINT "modules_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phase" ADD CONSTRAINT "phase_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_phase_id_phase_id_fk" FOREIGN KEY ("phase_id") REFERENCES "public"."phase"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_profiles" ADD CONSTRAINT "teacher_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "email_verification_tokens_email_token_key" ON "email_verification_tokens" USING btree ("email","token");--> statement-breakpoint
CREATE UNIQUE INDEX "password_reset_tokens_email_token_key" ON "password_reset_tokens" USING btree ("email","token");--> statement-breakpoint
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens" USING btree ("token");--> statement-breakpoint
CREATE UNIQUE INDEX "phone_verification_tokens_phone_otp_key" ON "phone_verification_tokens" USING btree ("phone","otp");--> statement-breakpoint
CREATE UNIQUE INDEX "phone_verification_tokens_otp_key" ON "phone_verification_tokens" USING btree ("otp");--> statement-breakpoint
CREATE UNIQUE INDEX "student_profile_user_id_key" ON "student_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "student_profile_roll_no_key" ON "student_profiles" USING btree ("roll_no");--> statement-breakpoint
CREATE UNIQUE INDEX "teacher_profile_user_id_key" ON "teacher_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_key" ON "users" USING btree ("email");