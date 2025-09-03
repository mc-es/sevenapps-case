import type { lists, tasks } from '@/db/schema';

export type Task = typeof tasks.$inferSelect;
export type List = typeof lists.$inferSelect;
