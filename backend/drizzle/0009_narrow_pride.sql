ALTER TABLE "ratchet_state" DROP CONSTRAINT "ratchet_state_user_id_conversation_id_unique";--> statement-breakpoint
ALTER TABLE "contacts" ALTER COLUMN "last_message_read_by_recipient" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "contacts" ALTER COLUMN "last_message_read_by_recipient" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "contacts" DROP COLUMN "last_message_sent_by_sender";--> statement-breakpoint
ALTER TABLE "contacts" DROP COLUMN "last_message_sent_by_recipient";--> statement-breakpoint
ALTER TABLE "contacts" DROP COLUMN "last_message_read_by_sender";--> statement-breakpoint
ALTER TABLE "ratchet_state" ADD CONSTRAINT "ratchet_state_user_id_unique" UNIQUE("user_id");--> statement-breakpoint
ALTER TABLE "ratchet_state" ADD CONSTRAINT "ratchet_state_conversation_id_unique" UNIQUE("conversation_id");