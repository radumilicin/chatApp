import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  timestamp,
  json,
  boolean,
  jsonb,
  unique,
} from "drizzle-orm/pg-core";


export const images = pgTable("images", {
  id: serial("id").primaryKey(),
  id_user: varchar("user_id", {length: 36}).references(() => users.id, {onDelete: "cascade"}),
  contact_id: varchar("contact_id", {length: 36}).references(() => users.id, {onDelete: "cascade"}),
  // group_id: integer("group_id").references(() => contacts.id),
  image_name: text("image_name").notNull(), // To keep track of the image name
  data: text("data").notNull(), // Base64-encoded image data
});

// Define the "users" table with columns "id", "username", and "password_hash"
export const users = pgTable('users', {
  id: varchar('id', {length : 36}).primaryKey(), // convert to varchar and change code to reflect change
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', {length: 100}).notNull().unique(),
  password_hash: text('password_hash').notNull(),
  profile_pic_id: integer("profile_pic_id").references(() => images.id, {onDelete: "cascade"}),
  about: varchar('about', {length : 250}),
  incoming_sounds: boolean().default(false),
  outgoing_sounds: boolean().default(false),
  notifications_enabled: boolean().default(false),
  theme: varchar('theme', {length: 250}).default('Dark'),
  font: varchar('font', {length: 250}).default('Sans'),
  profile_pic_visibility: varchar('profile_pic_visibility', {length: 250}).default('Everyone'),
  status_visibility: varchar('status_visibility', {length: 250}).default('Everyone'),
  disappearing_message_period: varchar('disappearing_message_period', {length: 250}).default('Off')
});

// Define the "users" table with columns "id", "username", and "password_hash"
export const contacts = pgTable('contacts', {
  id: varchar('id', {length : 36}).primaryKey(), // convert to varchar and change code to reflect change
  sender_id: varchar('sender_id', {length: 36}).references(() => users.id, {onDelete: "cascade"}), // this and contact_id are empty if group is true
  group: boolean('is_group'),                          // assign true to this if the contact is a group 
  group_members: jsonb('members').default([]),                // this and sender_id are empty if group is true
  contact_id: varchar('contact_id', {length: 36}).references(() => users.id, {onDelete: "cascade"}),
  message: jsonb('message').default([]),
  group_name: varchar('group_name', {length : 50}).default(''),
  group_pic_id: integer('group_pic_id').references(() => images.id),
  group_description: varchar('group_description', {length:100}).default(''),
  group_admins: jsonb('admins').default([]),
  blocked: boolean('blocked').default(false),
  blockedAt: varchar('blocked_at', {length: 50}),
  opened_at: jsonb('opened_at').default([]),                // array with [{id_user1: {}}, {id_user2: {}}]
  closed_at: jsonb('closed_at').default([]),                // array with [{id_user1: 1, closedAt: 25.01.2025T23:22:15}, {id_user2: {}}]]
  last_message_sent_by_sender: timestamp('last_message_sent_by_sender', {withTimezone: true}),
  last_message_sent_by_recipient: timestamp('last_message_sent_by_recipient', {withTimezone: true}),
  last_message_read_by_sender:timestamp('last_message_read_by_sender', {withTimezone: true}),
  last_message_read_by_recipient: timestamp('last_message_read_by_recipient', {withTimezone: true}),
});

export const user_keys = pgTable('user_keys', {
  id: serial('id').primaryKey(),
  user_id: varchar('user_id', {length: 36}).notNull().references(() => users.id, {onDelete: "cascade"}),
  identity_key_public: varchar('identity_key_public', {length: 100}),
  signed_prekey_public: varchar('signed_prekey_public', {length: 100}),
  signed_prekey_signature:  varchar('signed_prekey_signature', {length: 100}),
  signed_prekey_id: varchar('signed_prekey_id', {length: 100}),
});

export const one_time_prekeys = pgTable('one_time_prekeys', {
  id: serial('id').primaryKey(),
  user_id: varchar('user_id', {length: 36}).notNull().references(() => users.id, {onDelete: "cascade"}),
  key_id: varchar('key_id', {length: 100}).notNull(),
  public_key: varchar('public_key', {length: 100}).notNull()
});

export const ratchetState = pgTable('ratchet_state', {
  id: serial('id').primaryKey(),
  user: varchar('user_id', {length: 36}).references(() => users.id, {onDelete: "cascade"}),
  conversation_id: varchar('conversation_id', {length: 36}).references(() => contacts.id, {onDelete: "cascade"}),
  send_message_number: integer('send_message_number').notNull().default(0),
  receive_message_number: integer('receive_message_number').notNull().default(0),
  send_chain_key: text('send_chain_key').notNull(),
  receive_chain_key: text('receive_chain_key').notNull(),
  root_key: text('root_key').notNull(),
  dh_sending_key: text('dh_sending_key').notNull(),
  dh_receiving_key: text('dh_receiving_key').notNull().default(''),
  previous_sending_chain_length: integer('previous_sending_chain_length').notNull().default(0)
}, (table) => ({
  // ✅ Composite unique constraint on BOTH columns
  uniqueUserConversation: unique().on(table.user, table.conversation_id)
}));