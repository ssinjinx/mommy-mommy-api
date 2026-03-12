import { pgTable, text, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(), // Clerk user ID
  email: text('email').notNull(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const contacts = pgTable('contacts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  phoneNumber: text('phone_number').notNull(),
  relationship: text('relationship'),
  isDefaultRecipient: boolean('is_default_recipient').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const shoppingLists = pgTable('shopping_lists', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  storeName: text('store_name').notNull(),
  status: text('status').notNull().default('active'), // 'active' | 'completed'
  items: jsonb('items').notNull().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const events = pgTable('events', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  type: text('type').notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  notifyTime: timestamp('notify_time'),
  recurrence: text('recurrence').notNull().default('none'),
  assignedContacts: jsonb('assigned_contacts').notNull().default([]),
  notes: text('notes'),
  twilioScheduledId: text('twilio_scheduled_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Stores incoming SMS replies so they can be added to shopping lists
export const smsReplies = pgTable('sms_replies', {
  id: text('id').primaryKey(),
  fromNumber: text('from_number').notNull(),
  toNumber: text('to_number').notNull(),
  body: text('body').notNull(),
  userId: text('user_id'), // resolved from contact lookup
  shoppingListId: text('shopping_list_id'), // linked list if reply detected
  processed: boolean('processed').default(false).notNull(),
  receivedAt: timestamp('received_at').defaultNow().notNull(),
});
