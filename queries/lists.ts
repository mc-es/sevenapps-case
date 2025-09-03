import { desc, eq, like } from 'drizzle-orm';

import {
  ListByIdSchema,
  ListCreateSchema,
  ListDtoArraySchema,
  ListDtoSchema,
  ListSearchSchema,
  ListUpdateSchema,
  RecentLimitSchema,
  validateInput,
  validateOutput,
  type ListById,
  type ListCreate,
  type ListSearch,
  type ListUpdate,
  type RecentLimit,
} from '@/validations';

import { db } from '../db';
import { lists } from '../db/schema';
import { simulateNetworkLatency } from './utils';

const inCreate = validateInput(ListCreateSchema);
const inUpdate = validateInput(ListUpdateSchema);
const inDelete = validateInput(ListByIdSchema);
const inGetById = validateInput(ListByIdSchema);
const inSearch = validateInput(ListSearchSchema);
const inRecent = validateInput(RecentLimitSchema);

const outList = validateOutput(ListDtoSchema);
const outListArray = validateOutput(ListDtoArraySchema);

const getAllLists = async () => {
  await simulateNetworkLatency();
  const rows = db.select().from(lists).all();
  return outListArray(rows);
};

const getListById = async (args: ListById) => {
  await simulateNetworkLatency();
  const { id } = inGetById(args);
  const row = db.select().from(lists).where(eq(lists.id, id)).get();
  return row ? outList(row) : undefined;
};

const createList = async (args: ListCreate) => {
  await simulateNetworkLatency();
  const { name } = inCreate(args);
  return db.insert(lists).values({ name }).run();
};

const updateList = async (args: ListUpdate) => {
  await simulateNetworkLatency();
  const { id, name } = inUpdate(args);
  return db
    .update(lists)
    .set({ name, updated_at: new Date().toISOString() })
    .where(eq(lists.id, id))
    .run();
};

const deleteList = async (args: ListById) => {
  await simulateNetworkLatency();
  const { id } = inDelete(args);
  return db.delete(lists).where(eq(lists.id, id)).run();
};

const searchListsByName = async (args: ListSearch) => {
  await simulateNetworkLatency();
  const { term } = inSearch(args);
  const rows = db
    .select()
    .from(lists)
    .where(like(lists.name, `%${term}%`))
    .all();
  return outListArray(rows);
};

const getRecentLists = async (args: RecentLimit = { limit: 5 }) => {
  await simulateNetworkLatency();
  const { limit } = inRecent(args);
  const rows = db.select().from(lists).orderBy(desc(lists.created_at)).limit(limit).all();
  return outListArray(rows);
};

export {
  createList,
  deleteList,
  getAllLists,
  getListById,
  getRecentLists,
  searchListsByName,
  updateList,
};
