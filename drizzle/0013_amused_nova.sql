DROP INDEX "branch_college_code_key";--> statement-breakpoint
ALTER TABLE "branches" ALTER COLUMN "college_id" DROP NOT NULL;