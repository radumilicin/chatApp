ALTER TABLE "contacts" ALTER COLUMN "last_message_sent_by_sender" SET DEFAULT '1970-01-01 00:00:00.000';--> statement-breakpoint
ALTER TABLE "contacts" ALTER COLUMN "last_message_sent_by_recipient" SET DEFAULT '1970-01-01 00:00:00.000';--> statement-breakpoint
ALTER TABLE "contacts" ALTER COLUMN "last_message_read_by_sender" SET DEFAULT '1970-01-01 00:00:00.000';--> statement-breakpoint
ALTER TABLE "contacts" ALTER COLUMN "last_message_read_by_recipient" SET DEFAULT '1970-01-01 00:00:00.000';