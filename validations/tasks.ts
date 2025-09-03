import { z } from 'zod';

import { zBoolean, zNullableString, zNumber, zOptionalString, zRequiredString } from './core';

const PrioritySchema = z.enum(['low', 'medium', 'high']);
type Priority = z.infer<typeof PrioritySchema>;

const StatusSchema = z.enum(['not_started', 'in_progress', 'completed']);
type Status = z.infer<typeof StatusSchema>;

const TaskDtoSchema = z.object({
  id: zNumber,
  name: zRequiredString,
  list_id: zNumber,
  description: zOptionalString,
  image: zNullableString,
  status: StatusSchema.optional(),
  priority: PrioritySchema.optional(),
  is_completed: zBoolean,
  due_date: zNullableString,
  updated_at: zOptionalString,
  created_at: zOptionalString,
});
const TaskDtoArraySchema = z.array(TaskDtoSchema);
type TaskDto = z.infer<typeof TaskDtoSchema>;

const TaskCreateSchema = z
  .object({
    name: zRequiredString,
    list_id: zNumber,
    description: zOptionalString,
    status: StatusSchema.optional(),
    priority: PrioritySchema.optional(),
    is_completed: zBoolean,
    due_date: zNullableString,
  })
  .strip();
type TaskCreate = z.infer<typeof TaskCreateSchema>;

const TaskUpdateSchema = z
  .object({
    id: zNumber,
    name: zRequiredString.optional(),
    description: zOptionalString,
    status: StatusSchema.optional(),
    priority: PrioritySchema.optional(),
    is_completed: zBoolean,
    due_date: zNullableString,
    list_id: zNumber.optional(),
  })
  .strip();
type TaskUpdate = z.infer<typeof TaskUpdateSchema>;

const TaskByIdSchema = z.object({ id: zNumber }).strip();
type TaskById = z.infer<typeof TaskByIdSchema>;

const TaskByListIdSchema = z.object({ list_id: zNumber }).strip();
type TaskByListId = z.infer<typeof TaskByListIdSchema>;

const TaskToggleCompletionSchema = z.object({ id: zNumber, is_completed: z.boolean() }).strip();
type TaskToggleCompletion = z.infer<typeof TaskToggleCompletionSchema>;

const TaskSearchSchema = z.object({ term: zRequiredString }).strip();
type TaskSearch = z.infer<typeof TaskSearchSchema>;

const TaskByStatusSchema = z.object({ status: StatusSchema }).strip();
type TaskByStatus = z.infer<typeof TaskByStatusSchema>;

const TaskByPrioritySchema = z.object({ priority: PrioritySchema }).strip();
type TaskByPriority = z.infer<typeof TaskByPrioritySchema>;

export {
  PrioritySchema,
  StatusSchema,
  TaskByIdSchema,
  TaskByListIdSchema,
  TaskByPrioritySchema,
  TaskByStatusSchema,
  TaskCreateSchema,
  TaskDtoArraySchema,
  TaskDtoSchema,
  TaskSearchSchema,
  TaskToggleCompletionSchema,
  TaskUpdateSchema,
};
export type {
  Priority,
  Status,
  TaskById,
  TaskByListId,
  TaskByPriority,
  TaskByStatus,
  TaskCreate,
  TaskDto,
  TaskSearch,
  TaskToggleCompletion,
  TaskUpdate,
};
