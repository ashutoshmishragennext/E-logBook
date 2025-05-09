ALTER TABLE "student_profiles" DROP CONSTRAINT "student_profiles_teacher_id_teacher_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "student_profiles" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "student_profiles" DROP COLUMN "teacher_id";