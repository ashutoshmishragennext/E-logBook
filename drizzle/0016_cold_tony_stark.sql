ALTER TABLE "colleges" ADD COLUMN "college_admin_id" uuid;--> statement-breakpoint
ALTER TABLE "colleges" ADD CONSTRAINT "colleges_college_admin_id_users_id_fk" FOREIGN KEY ("college_admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "college_Admin_key" ON "colleges" USING btree ("college_admin_id");