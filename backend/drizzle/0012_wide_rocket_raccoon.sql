ALTER TABLE "contacts" ADD COLUMN "opened_at" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "closed_at" jsonb DEFAULT '[]'::jsonb;