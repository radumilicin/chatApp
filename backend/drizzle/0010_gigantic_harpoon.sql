ALTER TABLE "contacts" ADD COLUMN "last_message_sent_by_sender" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "last_message_sent_by_recipient" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "last_message_read_by_sender" timestamp with time zone;