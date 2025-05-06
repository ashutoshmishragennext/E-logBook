ALTER TABLE "branches" ADD COLUMN "approved" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "approved" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "subjects" ADD COLUMN "approved" boolean DEFAULT false;