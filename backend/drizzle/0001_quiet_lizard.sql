ALTER TABLE "contacts" ADD COLUMN "blocked_by_sender" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "blocked_by_receiver" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "blocked_by_sender_at" varchar(50);--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "blocked_by_receiver_at" varchar(50);