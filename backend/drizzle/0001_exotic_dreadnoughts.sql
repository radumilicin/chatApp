CREATE TABLE "contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"contact_id" integer NOT NULL,
	"message" json,
	CONSTRAINT "contacts_contact_id_unique" UNIQUE("contact_id")
);
