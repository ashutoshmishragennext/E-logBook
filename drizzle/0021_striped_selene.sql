ALTER TABLE "student_profiles" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD COLUMN "clg_admin" uuid;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_clg_admin_users_id_fk" FOREIGN KEY ("clg_admin") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;