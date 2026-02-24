CREATE TABLE "contacts" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"sender_id" varchar(36),
	"is_group" boolean,
	"members" jsonb DEFAULT '[]'::jsonb,
	"contact_id" varchar(36),
	"message" jsonb DEFAULT '[]'::jsonb,
	"group_name" varchar(50) DEFAULT '',
	"group_pic_id" integer,
	"group_description" varchar(100) DEFAULT '',
	"admins" jsonb DEFAULT '[]'::jsonb,
	"blocked" boolean DEFAULT false,
	"blocked_by_sender" boolean DEFAULT false,
	"blocked_by_receiver" boolean DEFAULT false,
	"blocked_by_sender_at" varchar(50),
	"blocked_by_receiver_at" varchar(50),
	"blocked_at" varchar(50),
	"opened_at" jsonb DEFAULT '[]'::jsonb,
	"closed_at" jsonb DEFAULT '[]'::jsonb,
	"last_message_sent_by_sender" timestamp with time zone,
	"last_message_sent_by_recipient" timestamp with time zone,
	"last_message_read_by_sender" timestamp with time zone,
	"last_message_read_by_recipient" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "email_verification_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(100) NOT NULL,
	"code" varchar(6) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "images" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(36),
	"contact_id" varchar(36),
	"image_name" text NOT NULL,
	"data" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "one_time_prekeys" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"key_id" varchar(100) NOT NULL,
	"public_key" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ratchet_state" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(36),
	"conversation_id" varchar(36),
	"send_message_number" integer DEFAULT 0 NOT NULL,
	"receive_message_number" integer DEFAULT 0 NOT NULL,
	"send_chain_key" text NOT NULL,
	"receive_chain_key" text NOT NULL,
	"root_key" text NOT NULL,
	"dh_sending_key" text NOT NULL,
	"dh_receiving_key" text DEFAULT '' NOT NULL,
	"previous_sending_chain_length" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "ratchet_state_user_id_conversation_id_unique" UNIQUE("user_id","conversation_id")
);
--> statement-breakpoint
CREATE TABLE "user_keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"identity_key_public" varchar(100),
	"signed_prekey_public" varchar(100),
	"signed_prekey_signature" varchar(100),
	"signed_prekey_id" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"email" varchar(100) NOT NULL,
	"password_hash" text,
	"google_id" varchar(100),
	"profile_pic_id" integer,
	"about" varchar(250),
	"email_verified" boolean DEFAULT false,
	"incoming_sounds" boolean DEFAULT false,
	"outgoing_sounds" boolean DEFAULT false,
	"notifications_enabled" boolean DEFAULT false,
	"theme" varchar(250) DEFAULT 'Dark',
	"font" varchar(250) DEFAULT 'Sans',
	"profile_pic_visibility" varchar(250) DEFAULT 'Everyone',
	"status_visibility" varchar(250) DEFAULT 'Everyone',
	"disappearing_message_period" varchar(250) DEFAULT 'Off',
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_contact_id_users_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_group_pic_id_images_id_fk" FOREIGN KEY ("group_pic_id") REFERENCES "public"."images"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_contact_id_users_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "one_time_prekeys" ADD CONSTRAINT "one_time_prekeys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratchet_state" ADD CONSTRAINT "ratchet_state_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratchet_state" ADD CONSTRAINT "ratchet_state_conversation_id_contacts_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_keys" ADD CONSTRAINT "user_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_profile_pic_id_images_id_fk" FOREIGN KEY ("profile_pic_id") REFERENCES "public"."images"("id") ON DELETE cascade ON UPDATE no action;