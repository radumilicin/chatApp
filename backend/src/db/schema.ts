import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  timestamp,
  json,
  jsonb
} from "drizzle-orm/pg-core";


export const images = pgTable("images", {
  id: serial("id").primaryKey(),
  id_user: integer("user_id").notNull().references(() => users.id),
  image_name: text("image_name").notNull(), // To keep track of the image name
  data: text("data").notNull(), // Base64-encoded image data
});

// Define the "users" table with columns "id", "username", and "password_hash"
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  password_hash: text('password_hash').notNull(),
  profile_pic_id: integer("profile_pic_id").references(() => images.id)
});

// Define the "users" table with columns "id", "username", and "password_hash"
export const contacts = pgTable('contacts', {
  id: serial('id'),
  contact_id: integer('contact_id').notNull().references(() => users.id),
  message: jsonb('message').default({})
});