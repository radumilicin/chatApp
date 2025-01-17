import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  timestamp,
  json,
  boolean,
  jsonb
} from "drizzle-orm/pg-core";


export const images = pgTable("images", {
  id: serial("id").primaryKey(),
  id_user: integer("user_id").notNull().references(() => users.id),
  contact_id: integer("contact_id").references(() => users.id),
  image_name: text("image_name").notNull(), // To keep track of the image name
  data: text("data").notNull(), // Base64-encoded image data
});

// Define the "users" table with columns "id", "username", and "password_hash"
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  password_hash: text('password_hash').notNull(),
  profile_pic_id: integer("profile_pic_id").references(() => images.id),
  about: varchar('about', {length : 250})
});

// Define the "users" table with columns "id", "username", and "password_hash"
export const contacts = pgTable('contacts', {
  id: serial('id').primaryKey(),
  sender_id: integer('sender_id').references(() => users.id), // this and contact_id are empty if group is true
  group: boolean('is_group'),                          // assign true to this if the contact is a group 
  group_members: jsonb('members').default([]),                // this and sender_id are empty if group is true
  contact_id: integer('contact_id').references(() => users.id),
  message: jsonb('message').default([])
});