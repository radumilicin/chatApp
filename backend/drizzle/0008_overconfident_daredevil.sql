ALTER TABLE "users" ADD COLUMN "profile_pic_visibility" varchar(250) DEFAULT 'Everyone';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "status_visibility" varchar(250) DEFAULT 'Everyone';