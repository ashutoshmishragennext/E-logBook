DROP INDEX "course_branch_code_key";--> statement-breakpoint
CREATE UNIQUE INDEX "course_branch_code_key" ON "courses" USING btree ("branch_id","name");