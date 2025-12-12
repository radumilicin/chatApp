ALTER TABLE "ratchet_state" ADD COLUMN "dh_sending_key" text NOT NULL;--> statement-breakpoint
ALTER TABLE "ratchet_state" ADD COLUMN "dh_receiving_key" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "ratchet_state" ADD COLUMN "previous_sending_chain_length" integer DEFAULT 0 NOT NULL;