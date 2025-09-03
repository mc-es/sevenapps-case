import { and, desc, eq, gt, like } from 'drizzle-orm';

import {
  TaskByIdSchema,
  TaskByListIdSchema,
  TaskByPriority,
  TaskByPrioritySchema,
  TaskByStatus,
  TaskByStatusSchema,
  TaskCreateSchema,
  TaskDtoArraySchema,
  TaskDtoSchema,
  TaskSearch,
  TaskSearchSchema,
  TaskToggleCompletionSchema,
  TaskUpdateSchema,
  validateInput,
  validateOutput,
  type TaskById,
  type TaskByListId,
  type TaskCreate,
  type TaskToggleCompletion,
  type TaskUpdate,
} from '@/validations';

import { db } from '../db';
import { tasks } from '../db/schema';
import { simulateNetworkLatency } from './utils';

const inCreate = validateInput(TaskCreateSchema);
const inUpdate = validateInput(TaskUpdateSchema);
const inDelete = validateInput(TaskByIdSchema);
const inGetById = validateInput(TaskByIdSchema);
const inByListId = validateInput(TaskByListIdSchema);
const inToggle = validateInput(TaskToggleCompletionSchema);
const inSearch = validateInput(TaskSearchSchema);
const inByStatus = validateInput(TaskByStatusSchema);
const inByPriority = validateInput(TaskByPrioritySchema);

const outTask = validateOutput(TaskDtoSchema);
const outTaskArray = validateOutput(TaskDtoArraySchema);

const getAllTasks = async () => {
  await simulateNetworkLatency();
  const rows = db.select().from(tasks).all();
  return outTaskArray(rows);
};

const getTaskById = async (args: TaskById) => {
  await simulateNetworkLatency();
  const { id } = inGetById(args);
  const row = db.select().from(tasks).where(eq(tasks.id, id)).get();
  return row ? outTask(row) : undefined;
};

const getTasksByListId = async (args: TaskByListId) => {
  await simulateNetworkLatency();
  const { list_id } = inByListId(args);
  const rows = db.select().from(tasks).where(eq(tasks.list_id, list_id)).all();
  return outTaskArray(rows);
};

const createTask = async (args: TaskCreate) => {
  await simulateNetworkLatency();
  const valid = inCreate(args);
  return db.insert(tasks).values(valid).run();
};

const updateTask = async (args: TaskUpdate) => {
  await simulateNetworkLatency();
  const { id, ...patch } = inUpdate(args);
  return db
    .update(tasks)
    .set({ ...patch, updated_at: new Date().toISOString() })
    .where(eq(tasks.id, id))
    .run();
};

const deleteTask = async (args: TaskById) => {
  await simulateNetworkLatency();
  const { id } = inDelete(args);
  return db.delete(tasks).where(eq(tasks.id, id)).run();
};

const toggleTaskCompletion = async (args: TaskToggleCompletion) => {
  await simulateNetworkLatency();
  const { id, is_completed } = inToggle(args);
  const nextStatus = is_completed ? 'completed' : 'not_started';
  return db
    .update(tasks)
    .set({ is_completed, status: nextStatus, updated_at: new Date().toISOString() })
    .where(eq(tasks.id, id))
    .run();
};

const searchTasksByName = async (args: TaskSearch) => {
  await simulateNetworkLatency();
  const { term } = inSearch(args);
  const rows = db
    .select()
    .from(tasks)
    .where(like(tasks.name, `%${term}%`))
    .all();
  return outTaskArray(rows);
};

const getTasksByStatus = async (args: TaskByStatus) => {
  await simulateNetworkLatency();
  const { status } = inByStatus(args);
  const rows = db.select().from(tasks).where(eq(tasks.status, status)).all();
  return outTaskArray(rows);
};

const getTasksByPriority = async (args: TaskByPriority) => {
  await simulateNetworkLatency();
  const { priority } = inByPriority(args);
  const rows = db.select().from(tasks).where(eq(tasks.priority, priority)).all();
  return outTaskArray(rows);
};

const getUpcomingTasks = async () => {
  await simulateNetworkLatency();
  const today = new Date().toISOString();
  const rows = db
    .select()
    .from(tasks)
    .where(and(gt(tasks.due_date, today), eq(tasks.is_completed, false)))
    .orderBy(desc(tasks.due_date))
    .all();
  return outTaskArray(rows);
};

const getCompletedTasks = async () => {
  await simulateNetworkLatency();
  const rows = db
    .select()
    .from(tasks)
    .where(eq(tasks.is_completed, true))
    .orderBy(desc(tasks.updated_at))
    .all();
  return outTaskArray(rows);
};

export {
  createTask,
  deleteTask,
  getAllTasks,
  getCompletedTasks,
  getTaskById,
  getTasksByListId,
  getTasksByPriority,
  getTasksByStatus,
  getUpcomingTasks,
  searchTasksByName,
  toggleTaskCompletion,
  updateTask,
};
