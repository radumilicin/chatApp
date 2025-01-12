CREATE TABLE "contacts" (
	"id" serial NOT NULL,
	"contact_id" integer NOT NULL,
	"message" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
-- CREATE TABLE "images" (
-- 	"id" serial PRIMARY KEY NOT NULL,
-- 	"user_id" integer NOT NULL,
-- 	"image_name" text NOT NULL,
-- 	"data" text NOT NULL
-- );
-- --> statement-breakpoint
-- CREATE TABLE "users" (
-- 	"id" serial PRIMARY KEY NOT NULL,
-- 	"username" varchar(50) NOT NULL,
-- 	"password_hash" text NOT NULL,
-- 	"profile_pic_id" integer,
-- 	CONSTRAINT "users_username_unique" UNIQUE("username")
-- );

--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_contact_id_users_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "images" ADD CONSTRAINT "images_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "users" ADD CONSTRAINT "users_profile_pic_id_images_id_fk" FOREIGN KEY ("profile_pic_id") REFERENCES "public"."images"("id") ON DELETE no action ON UPDATE no action;