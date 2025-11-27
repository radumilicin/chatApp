ALTER TABLE "contacts" ADD COLUMN "last_message_read_by_sender" timestamp;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "last_message_read_by_recipient" timestamp;