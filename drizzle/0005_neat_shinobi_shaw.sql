ALTER TABLE "email_verification_tokens" DROP CONSTRAINT "email_verification_tokens_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "email_verification_tokens" DROP COLUMN "user_id";