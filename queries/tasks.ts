import { and, desc, eq, gt, like } from 'drizzle-orm';

import { db } from '../db';
import { tasks } from '../db/schema';
import { simulateNetworkLatency } from './utils';

/**
 * Retrieves all tasks from the database
 *
 * @remarks
 * This function returns all tasks without any filtering.
 * Network latency is simulated to emulate real-world API behavior.
 *
 * @returns A promise that resolves to an array of all task objects
 *
 * @example
 * ```typescript
 * const allTasks = await getAllTasks();
 * console.log(allTasks.length); // Total number of tasks
 * ```
 */
export const getAllTasks = async () => {
  await simulateNetworkLatency();
  return db.select().from(tasks).all();
};

/**
 * Retrieves a specific task by its ID
 *
 * @param id - The unique identifier of the task to retrieve
 *
 * @remarks
 * This function performs an exact match on the task ID.
 * Network latency is simulated to emulate real-world API behavior.
 *
 * @returns A promise that resolves to the task object if found, or undefined if not found
 *
 * @example
 * ```typescript
 * const task = await getTaskById(42);
 * if (task) {
 *   console.log(task.name); // "Complete project"
 * } else {
 *   console.log("Task not found");
 * }
 * ```
 */
export const getTaskById = async (id: number) => {
  await simulateNetworkLatency();
  return db.select().from(tasks).where(eq(tasks.id, id)).get();
};

/**
 * Retrieves all tasks associated with a specific list
 *
 * @param listId - The unique identifier of the list to fetch tasks for
 *
 * @remarks
 * This function filters tasks by their list_id field.
 * Network latency is simulated to emulate real-world API behavior.
 *
 * @returns A promise that resolves to an array of task objects belonging to the specified list
 *
 * @example
 * ```typescript
 * const groceryListTasks = await getTasksByListId(5);
 * console.log(`Found ${groceryListTasks.length} tasks in this list`);
 * ```
 */
export const getTasksByListId = async (listId: number) => {
  await simulateNetworkLatency();
  return db.select().from(tasks).where(eq(tasks.list_id, listId)).all();
};

/**
 * Creates a new task with the provided properties
 *
 * @param task - An object containing the task properties
 * @param task.name - The name/title of the task (required)
 * @param task.description - Optional description with details about the task
 * @param task.image - Optional URL to an image associated with the task
 * @param task.status - Optional status of the task (e.g., "not_started", "in_progress", "completed")
 * @param task.priority - Optional priority level (e.g., "low", "medium", "high")
 * @param task.is_completed - Optional boolean indicating if the task is completed
 * @param task.due_date - Optional due date for the task in ISO string format
 * @param task.list_id - The ID of the list this task belongs to (required)
 *
 * @remarks
 * This function inserts a new task record in the tasks table.
 * The created_at and updated_at fields are automatically handled by the database.
 * Network latency is simulated to emulate real-world API behavior.
 *
 * @returns A promise that resolves when the task is created
 *
 * @example
 * ```typescript
 * await createTask({
 *   name: "Buy groceries",
 *   description: "Milk, eggs, bread",
 *   priority: "high",
 *   due_date: new Date(2023, 11, 31).toISOString(),
 *   list_id: 5
 * });
 * ```
 */
export const createTask = async (task: {
  name: string;
  description?: string;
  image?: string;
  status?: string;
  priority?: string;
  is_completed?: boolean;
  due_date?: string;
  list_id: number;
}) => {
  await simulateNetworkLatency();
  return db.insert(tasks).values(task).run();
};

/**
 * Updates an existing task with new properties
 *
 * @param id - The unique identifier of the task to update
 * @param task - An object with task properties to update
 * @param task.name - Optional new name/title for the task
 * @param task.description - Optional new description
 * @param task.image - Optional new image URL
 * @param task.status - Optional new status
 * @param task.priority - Optional new priority level
 * @param task.is_completed - Optional new completion status
 * @param task.due_date - Optional new due date
 * @param task.list_id - Optional new list ID to move the task to another list
 *
 * @remarks
 * This function updates the specified fields of the task and automatically
 * updates the updated_at timestamp.
 * Only the fields included in the task parameter will be modified.
 * Network latency is simulated to emulate real-world API behavior.
 *
 * @returns A promise that resolves when the task is updated
 *
 * @example
 * ```typescript
 * await updateTask(42, {
 *   name: "Buy organic groceries",
 *   priority: "medium",
 *   due_date: new Date(2023, 12, 15).toISOString()
 * });
 * ```
 */
export const updateTask = async (
  id: number,
  task: Partial<{
    name: string;
    description: string;
    image: string;
    status: string;
    priority: string;
    is_completed: boolean;
    due_date: string;
    list_id: number;
  }>,
) => {
  await simulateNetworkLatency();
  return db
    .update(tasks)
    .set({
      ...task,
      updated_at: new Date().toISOString(),
    })
    .where(eq(tasks.id, id))
    .run();
};

/**
 * Deletes a task by its ID
 *
 * @param id - The unique identifier of the task to delete
 *
 * @remarks
 * This function permanently removes the task from the database.
 * Network latency is simulated to emulate real-world API behavior.
 *
 * @returns A promise that resolves when the task is deleted
 *
 * @example
 * ```typescript
 * await deleteTask(42);
 * ```
 */
export const deleteTask = async (id: number) => {
  await simulateNetworkLatency();
  return db.delete(tasks).where(eq(tasks.id, id)).run();
};

/**
 * Toggles the completion status of a task
 *
 * @param id - The unique identifier of the task to update
 * @param isCompleted - The new completion status to set
 *
 * @remarks
 * This function provides a convenient way to mark tasks as completed or not completed.
 * It updates the is_completed field and the updated_at timestamp.
 * Network latency is simulated to emulate real-world API behavior.
 *
 * @returns A promise that resolves when the task completion status is updated
 *
 * @example
 * ```typescript
 * // Mark a task as completed
 * await toggleTaskCompletion(42, true);
 *
 * // Mark a task as not completed
 * await toggleTaskCompletion(42, false);
 * ```
 */
export const toggleTaskCompletion = async (id: number, isCompleted: boolean) => {
  await simulateNetworkLatency();
  const nextStatus = isCompleted ? 'completed' : 'not_started';
  return db
    .update(tasks)
    .set({
      is_completed: isCompleted,
      status: nextStatus,
      updated_at: new Date().toISOString(),
    })
    .where(eq(tasks.id, id))
    .run();
};

/**
 * Searches for tasks by name with partial matching
 *
 * @param searchTerm - The string to search for in task names
 *
 * @remarks
 * This function performs a case-sensitive partial match using SQL LIKE operator.
 * The search pattern is %searchTerm%, which means it will match if the search term
 * appears anywhere in the task name.
 * Network latency is simulated to emulate real-world API behavior.
 *
 * @returns A promise that resolves to an array of matching task objects
 *
 * @example
 * ```typescript
 * const results = await searchTasksByName("groceries");
 * // Will match tasks with names like "Buy groceries", "Groceries for party", etc.
 * ```
 */
export const searchTasksByName = async (searchTerm: string) => {
  await simulateNetworkLatency();
  return db
    .select()
    .from(tasks)
    .where(like(tasks.name, `%${searchTerm}%`))
    .all();
};

/**
 * Retrieves tasks filtered by their status
 *
 * @param status - The status value to filter by (e.g., "not_started", "in_progress", "completed")
 *
 * @remarks
 * This function performs an exact match on the status field.
 * Network latency is simulated to emulate real-world API behavior.
 *
 * @returns A promise that resolves to an array of tasks with the specified status
 *
 * @example
 * ```typescript
 * const inProgressTasks = await getTasksByStatus("in_progress");
 * console.log(`You have ${inProgressTasks.length} tasks in progress`);
 * ```
 */
export const getTasksByStatus = async (status: string) => {
  await simulateNetworkLatency();
  return db.select().from(tasks).where(eq(tasks.status, status)).all();
};

/**
 * Retrieves tasks filtered by their priority level
 *
 * @param priority - The priority value to filter by (e.g., "low", "medium", "high")
 *
 * @remarks
 * This function performs an exact match on the priority field.
 * Network latency is simulated to emulate real-world API behavior.
 *
 * @returns A promise that resolves to an array of tasks with the specified priority
 *
 * @example
 * ```typescript
 * const highPriorityTasks = await getTasksByPriority("high");
 * console.log(`You have ${highPriorityTasks.length} high priority tasks`);
 * ```
 */
export const getTasksByPriority = async (priority: string) => {
  await simulateNetworkLatency();
  return db.select().from(tasks).where(eq(tasks.priority, priority)).all();
};

/**
 * Retrieves upcoming tasks with due dates in the future that are not completed
 *
 * @remarks
 * This function finds all tasks that:
 * 1. Have a due date later than the current date/time
 * 2. Are not marked as completed
 *
 * The results are ordered by due date in descending order (furthest in the future first).
 * Network latency is simulated to emulate real-world API behavior.
 *
 * @returns A promise that resolves to an array of upcoming task objects
 *
 * @example
 * ```typescript
 * const upcomingTasks = await getUpcomingTasks();
 * if (upcomingTasks.length > 0) {
 *   console.log(`Your next task is: ${upcomingTasks[upcomingTasks.length-1].name}`);
 * }
 * ```
 */
export const getUpcomingTasks = async () => {
  await simulateNetworkLatency();
  const today = new Date().toISOString();
  return db
    .select()
    .from(tasks)
    .where(and(gt(tasks.due_date, today), eq(tasks.is_completed, false)))
    .orderBy(desc(tasks.due_date))
    .all();
};

/**
 * Retrieves all completed tasks
 *
 * @remarks
 * This function returns all tasks that are marked as completed.
 * Results are ordered by updated_at timestamp in descending order (most recently completed first).
 * Network latency is simulated to emulate real-world API behavior.
 *
 * @returns A promise that resolves to an array of completed task objects
 *
 * @example
 * ```typescript
 * const completedTasks = await getCompletedTasks();
 * console.log(`You have completed ${completedTasks.length} tasks`);
 * ```
 */
export const getCompletedTasks = async () => {
  await simulateNetworkLatency();
  return db
    .select()
    .from(tasks)
    .where(eq(tasks.is_completed, true))
    .orderBy(desc(tasks.updated_at))
    .all();
};
