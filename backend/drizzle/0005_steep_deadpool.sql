ALTER TABLE "ratchetState" RENAME TO "ratchet_state";--> statement-breakpoint
ALTER TABLE "ratchet_state" DROP CONSTRAINT "ratchetState_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "ratchet_state" DROP CONSTRAINT "ratchetState_conversation_id_contacts_id_fk";
--> statement-breakpoint
ALTER TABLE "ratchet_state" ADD CONSTRAINT "ratchet_state_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratchet_state" ADD CONSTRAINT "ratchet_state_conversation_id_contacts_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;