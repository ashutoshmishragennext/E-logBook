CREATE TABLE "cities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"state_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "countries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "countries_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"subject" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dynamic_field_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_name" text NOT NULL,
	"field_name" text NOT NULL,
	"field_type" text NOT NULL,
	"is_required" boolean DEFAULT false NOT NULL,
	"options" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "log_books" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"teacher_id" uuid,
	"course_name" text,
	"competency" text,
	"skill" text,
	"activity_name" text,
	"activity_link" text,
	"portfolio_link" text,
	"from_date" timestamp,
	"to_date" timestamp,
	"procedure_count" text,
	"dynamic_fields" jsonb,
	"student_remarks" text,
	"teacher_remarks" text,
	"feedback_received" numeric(3, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "states" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"country_id" uuid NOT NULL
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
	"country_id" uuid,
	"state_id" uuid,
	"city_id" uuid,
	"admission_batch" text,
	"course" text,
	"subject" text,
	"college_id_proof" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
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
	"country_id" uuid,
	"state_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "document_search_keywords" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "document_tags" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "document_type_metadata" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "document_types" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "documents" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "folder_tags" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "folders" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "organizations" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "phone_verification_tokens" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "search_history" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "students" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "tags" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "verification_history" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "document_search_keywords" CASCADE;--> statement-breakpoint
DROP TABLE "document_tags" CASCADE;--> statement-breakpoint
DROP TABLE "document_type_metadata" CASCADE;--> statement-breakpoint
DROP TABLE "document_types" CASCADE;--> statement-breakpoint
DROP TABLE "documents" CASCADE;--> statement-breakpoint
DROP TABLE "folder_tags" CASCADE;--> statement-breakpoint
DROP TABLE "folders" CASCADE;--> statement-breakpoint
DROP TABLE "organizations" CASCADE;--> statement-breakpoint
DROP TABLE "password_reset_tokens" CASCADE;--> statement-breakpoint
DROP TABLE "phone_verification_tokens" CASCADE;--> statement-breakpoint
DROP TABLE "search_history" CASCADE;--> statement-breakpoint
DROP TABLE "students" CASCADE;--> statement-breakpoint
DROP TABLE "tags" CASCADE;--> statement-breakpoint
DROP TABLE "verification_history" CASCADE;--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_organization_id_organizations_id_fk";
--> statement-breakpoint
DROP INDEX "email_verification_tokens_token_key";--> statement-breakpoint
DROP INDEX "users_name_email_phone_idx";--> statement-breakpoint
DROP INDEX "users_organization_idx";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'STUDENT';--> statement-breakpoint
ALTER TABLE "email_verification_tokens" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "cities" ADD CONSTRAINT "cities_state_id_states_id_fk" FOREIGN KEY ("state_id") REFERENCES "public"."states"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "log_books" ADD CONSTRAINT "log_books_student_id_student_profiles_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "log_books" ADD CONSTRAINT "log_books_teacher_id_teacher_profiles_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teacher_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "states" ADD CONSTRAINT "states_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_state_id_states_id_fk" FOREIGN KEY ("state_id") REFERENCES "public"."states"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_profiles" ADD CONSTRAINT "teacher_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_profiles" ADD CONSTRAINT "teacher_profiles_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_profiles" ADD CONSTRAINT "teacher_profiles_state_id_states_id_fk" FOREIGN KEY ("state_id") REFERENCES "public"."states"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "dynamic_field_config_unique" ON "dynamic_field_configs" USING btree ("course_name","field_name");--> statement-breakpoint
CREATE UNIQUE INDEX "student_profile_user_id_key" ON "student_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "student_profile_roll_no_key" ON "student_profiles" USING btree ("roll_no");--> statement-breakpoint
CREATE UNIQUE INDEX "teacher_profile_user_id_key" ON "teacher_profiles" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "phone";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "phone_verified";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "organization_id";--> statement-breakpoint
ALTER TABLE "public"."users" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."user_role";--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'TEACHER', 'STUDENT');--> statement-breakpoint
ALTER TABLE "public"."users" ALTER COLUMN "role" SET DATA TYPE "public"."user_role" USING "role"::"public"."user_role";