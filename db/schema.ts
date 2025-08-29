import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const tasks = sqliteTable('tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  image: text('image'),
  status: text('status').default('pending'),
  priority: text('priority').default('medium'),
  is_completed: integer('is_completed', { mode: 'boolean' }).default(false),
  due_date: text('due_date'),
  created_at: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updated_at: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  list_id: integer('list_id')
    .notNull()
    .references(() => lists.id),
});

export const lists = sqliteTable('lists', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  created_at: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updated_at: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});
