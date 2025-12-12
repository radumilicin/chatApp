CREATE TABLE "ratchetState" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(36),
	"conversation_id" integer,
	"send_message_number" integer DEFAULT 0 NOT NULL,
	"receive_message_number" integer DEFAULT 0 NOT NULL,
	"send_chain_key" text NOT NULL,
	"receive_chain_key" text NOT NULL,
	"root_key" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ratchetState" ADD CONSTRAINT "ratchetState_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratchetState" ADD CONSTRAINT "ratchetState_conversation_id_contacts_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;