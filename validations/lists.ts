import { z } from 'zod';

import { zDate, zId, zName, zPositiveInt } from './core';

const ListDtoSchema = z.object({ id: zId, name: zName, created_at: zDate, updated_at: zDate });
const ListDtoArraySchema = z.array(ListDtoSchema);
type ListDto = z.infer<typeof ListDtoSchema>;

const ListCreateSchema = z.object({ name: zName }).strip();
type ListCreate = z.infer<typeof ListCreateSchema>;

const ListUpdateSchema = z.object({ id: zId, name: zName }).strip();
type ListUpdate = z.infer<typeof ListUpdateSchema>;

const ListDeleteSchema = z.object({ id: zId }).strip();
type ListDelete = z.infer<typeof ListDeleteSchema>;

const ListGetByIdSchema = z.object({ id: zId }).strip();
type ListGetById = z.infer<typeof ListGetByIdSchema>;

const ListSearchSchema = z.object({ term: z.string().trim().min(1).max(100) }).strip();
type ListSearch = z.infer<typeof ListSearchSchema>;

const RecentLimitSchema = z.object({ limit: zPositiveInt.max(50) }).strip();
type RecentLimit = z.infer<typeof RecentLimitSchema>;

export {
  ListCreateSchema,
  ListDeleteSchema,
  ListDtoArraySchema,
  ListDtoSchema,
  ListGetByIdSchema,
  ListSearchSchema,
  ListUpdateSchema,
  RecentLimitSchema,
};
export type { ListCreate, ListDelete, ListDto, ListGetById, ListSearch, ListUpdate, RecentLimit };
