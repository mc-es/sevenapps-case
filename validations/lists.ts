import { z } from 'zod';

import { zNumber, zOptionalString, zRequiredString } from './core';

const ListDtoSchema = z.object({
  id: zNumber,
  name: zRequiredString,
  created_at: zOptionalString,
  updated_at: zOptionalString,
});
const ListDtoArraySchema = z.array(ListDtoSchema);
type ListDto = z.infer<typeof ListDtoSchema>;

const ListCreateSchema = z.object({ name: zRequiredString }).strip();
type ListCreate = z.infer<typeof ListCreateSchema>;

const ListUpdateSchema = z.object({ id: zNumber, name: zRequiredString }).strip();
type ListUpdate = z.infer<typeof ListUpdateSchema>;

const ListByIdSchema = z.object({ id: zNumber }).strip();
type ListById = z.infer<typeof ListByIdSchema>;

const ListSearchSchema = z.object({ term: zRequiredString }).strip();
type ListSearch = z.infer<typeof ListSearchSchema>;

const RecentLimitSchema = z.object({ limit: zNumber.max(20) }).strip();
type RecentLimit = z.infer<typeof RecentLimitSchema>;

export {
  ListByIdSchema,
  ListCreateSchema,
  ListDtoArraySchema,
  ListDtoSchema,
  ListSearchSchema,
  ListUpdateSchema,
  RecentLimitSchema,
};
export type { ListById, ListCreate, ListDto, ListSearch, ListUpdate, RecentLimit };
