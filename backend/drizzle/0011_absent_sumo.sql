ALTER TABLE "ratchet_state" DROP CONSTRAINT "ratchet_state_user_id_unique";--> statement-breakpoint
ALTER TABLE "ratchet_state" DROP CONSTRAINT "ratchet_state_conversation_id_unique";--> statement-breakpoint
ALTER TABLE "ratchet_state" ADD CONSTRAINT "ratchet_state_user_id_conversation_id_unique" UNIQUE("user_id","conversation_id");