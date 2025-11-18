CREATE TABLE "contacts" (
	"id" serial PRIMARY KEY NOT NULL,
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
	"blockedAt" varchar(50),
	"opened_at" jsonb DEFAULT '[]'::jsonb,
	"closed_at" jsonb DEFAULT '[]'::jsonb
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
	"password_hash" text NOT NULL,
	"profile_pic_id" integer,
	"about" varchar(250),
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
ALTER TABLE "user_keys" ADD CONSTRAINT "user_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_profile_pic_id_images_id_fk" FOREIGN KEY ("profile_pic_id") REFERENCES "public"."images"("id") ON DELETE cascade ON UPDATE no action;