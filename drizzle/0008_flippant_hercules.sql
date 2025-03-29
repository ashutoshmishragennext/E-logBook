ALTER TABLE "log_book_entries" ADD COLUMN "teacher_id" uuid;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD COLUMN "date_of_birth" text;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD COLUMN "local_address" text;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD COLUMN "permanent_address" text;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD COLUMN "adhar_no" text;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD COLUMN "previous_institution" text;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD COLUMN "year_of_passing" text;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD COLUMN "attempt" text;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD COLUMN "state" text;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD COLUMN "date_of_joining" text;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD COLUMN "perivious_experience" text;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD COLUMN "merital_status" text;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD COLUMN "children" text;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD COLUMN "special_interest" text;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD COLUMN "date_of_completion" text;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD COLUMN "name_and_occpation_of_spouse" text;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD COLUMN "future_plan" text;--> statement-breakpoint
ALTER TABLE "log_book_entries" ADD CONSTRAINT "log_book_entries_teacher_id_teacher_profiles_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teacher_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_profiles" DROP COLUMN "location";