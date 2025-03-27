CREATE TABLE "academic_years" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	CONSTRAINT "academic_years_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "batches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"academic_year_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "log_book_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"log_book_template_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
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
	"batch_id" uuid NOT NULL,
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
CREATE TABLE "subjects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	CONSTRAINT "subjects_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "cities" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "countries" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "courses" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "log_books" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "states" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "cities" CASCADE;--> statement-breakpoint
DROP TABLE "countries" CASCADE;--> statement-breakpoint
DROP TABLE "courses" CASCADE;--> statement-breakpoint
DROP TABLE "log_books" CASCADE;--> statement-breakpoint
DROP TABLE "states" CASCADE;--> statement-breakpoint
ALTER TABLE "student_profiles" DROP CONSTRAINT "student_profiles_country_id_countries_id_fk";
--> statement-breakpoint
ALTER TABLE "student_profiles" DROP CONSTRAINT "student_profiles_state_id_states_id_fk";
--> statement-breakpoint
ALTER TABLE "student_profiles" DROP CONSTRAINT "student_profiles_city_id_cities_id_fk";
--> statement-breakpoint
ALTER TABLE "teacher_profiles" DROP CONSTRAINT "teacher_profiles_country_id_countries_id_fk";
--> statement-breakpoint
ALTER TABLE "teacher_profiles" DROP CONSTRAINT "teacher_profiles_state_id_states_id_fk";
--> statement-breakpoint
ALTER TABLE "student_profiles" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "teacher_profiles" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "batches" ADD CONSTRAINT "batches_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "log_book_entries" ADD CONSTRAINT "log_book_entries_log_book_template_id_log_book_templates_id_fk" FOREIGN KEY ("log_book_template_id") REFERENCES "public"."log_book_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "log_book_entries" ADD CONSTRAINT "log_book_entries_student_id_student_profiles_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "log_book_templates" ADD CONSTRAINT "log_book_templates_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "log_book_templates" ADD CONSTRAINT "log_book_templates_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "log_book_templates" ADD CONSTRAINT "log_book_templates_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "log_book_templates" ADD CONSTRAINT "log_book_templates_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "log_book_templates" ADD CONSTRAINT "log_book_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modules" ADD CONSTRAINT "modules_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_profiles" DROP COLUMN "country_id";--> statement-breakpoint
ALTER TABLE "student_profiles" DROP COLUMN "state_id";--> statement-breakpoint
ALTER TABLE "student_profiles" DROP COLUMN "city_id";--> statement-breakpoint
ALTER TABLE "teacher_profiles" DROP COLUMN "country_id";--> statement-breakpoint
ALTER TABLE "teacher_profiles" DROP COLUMN "state_id";