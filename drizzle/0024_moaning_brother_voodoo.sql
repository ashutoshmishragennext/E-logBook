CREATE TABLE "locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"country" text NOT NULL,
	"type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "student_subjects" ADD COLUMN "college_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "teacher_subjects" ADD COLUMN "college_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "student_subjects" ADD CONSTRAINT "student_subjects_college_id_colleges_id_fk" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_subjects" ADD CONSTRAINT "teacher_subjects_college_id_colleges_id_fk" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("id") ON DELETE no action ON UPDATE no action;