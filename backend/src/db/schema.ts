import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

// Define the "users" table with columns "id", "username", and "password_hash"
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  password_hash: text('password_hash').notNull(),
});



