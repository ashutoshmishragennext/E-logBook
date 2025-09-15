ALTER TABLE "colleges" ADD COLUMN "favicon" text;--> statement-breakpoint
ALTER TABLE "colleges" ADD COLUMN "banner_image" text;--> statement-breakpoint
ALTER TABLE "colleges" ADD COLUMN "primary_color" text DEFAULT '#3B82F6';--> statement-breakpoint
ALTER TABLE "colleges" ADD COLUMN "secondary_color" text DEFAULT '#1E40AF';--> statement-breakpoint
ALTER TABLE "colleges" ADD COLUMN "accent_color" text DEFAULT '#F59E0B';--> statement-breakpoint
ALTER TABLE "colleges" ADD COLUMN "background_color" text DEFAULT '#FFFFFF';--> statement-breakpoint
ALTER TABLE "colleges" ADD COLUMN "surface_color" text DEFAULT '#F9FAFB';--> statement-breakpoint
ALTER TABLE "colleges" ADD COLUMN "text_primary" text DEFAULT '#111827';--> statement-breakpoint
ALTER TABLE "colleges" ADD COLUMN "text_secondary" text DEFAULT '#6B7280';--> statement-breakpoint
ALTER TABLE "colleges" ADD COLUMN "text_muted" text DEFAULT '#9CA3AF';--> statement-breakpoint
ALTER TABLE "colleges" ADD COLUMN "border_color" text DEFAULT '#E5E7EB';--> statement-breakpoint
ALTER TABLE "colleges" ADD COLUMN "success_color" text DEFAULT '#10B981';--> statement-breakpoint
ALTER TABLE "colleges" ADD COLUMN "error_color" text DEFAULT '#EF4444';--> statement-breakpoint
ALTER TABLE "colleges" ADD COLUMN "warning_color" text DEFAULT '#F59E0B';--> statement-breakpoint
ALTER TABLE "colleges" ADD COLUMN "info_color" text DEFAULT '#3B82F6';--> statement-breakpoint
ALTER TABLE "colleges" ADD COLUMN "theme_config" jsonb DEFAULT '{"darkMode":false,"fontFamily":"Inter","borderRadius":"medium","shadows":true,"animations":true,"customCss":null}'::jsonb;--> statement-breakpoint
ALTER TABLE "colleges" ADD COLUMN "is_active" boolean DEFAULT true;