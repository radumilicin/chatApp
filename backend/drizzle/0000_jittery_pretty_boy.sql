CREATE TABLE "contacts" (
	"id" serial NOT NULL,
	"contact_id" integer NOT NULL,
	"message" json
);
--> statement-breakpoint
-- CREATE TABLE "users" (
-- 	"id" serial PRIMARY KEY NOT NULL,
-- 	"username" varchar(50) NOT NULL,
-- 	"password_hash" text NOT NULL,
-- 	CONSTRAINT "users_username_unique" UNIQUE("username")
-- );
--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_contact_id_users_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;