import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  timestamp,
  json
} from "drizzle-orm/pg-core";

// Define the "users" table with columns "id", "username", and "password_hash"
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  password_hash: text('password_hash').notNull(),
});

// Define the "users" table with columns "id", "username", and "password_hash"
export const contacts = pgTable('contacts', {
  id: serial('id'),
  contact_id: integer('contact_id').notNull().references(() => users.id),
  message: json('message')
});