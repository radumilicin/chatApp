CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"password_hash" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
