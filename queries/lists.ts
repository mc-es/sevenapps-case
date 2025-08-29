import { desc, eq, like } from 'drizzle-orm';

import { db } from '../db';
import { lists } from '../db/schema';
import { simulateNetworkLatency } from './utils';

/**
 * Retrieves all lists from the database
 *
 * @remarks
 * This function queries the entire lists table without filtering.
 * Network latency is simulated to emulate real-world API behavior.
 *
 * @returns A promise that resolves to an array of list objects
 *
 * @example
 * ```typescript
 * const allLists = await getAllLists();
 * console.log(allLists); // [{id: 1, name: 'Shopping', ...}, ...]
 * ```
 */
export const getAllLists = async () => {
  await simulateNetworkLatency();
  return db.select().from(lists).all();
};

/**
 * Retrieves a specific list by its ID
 *
 * @param id - The unique identifier of the list to retrieve
 *
 * @remarks
 * This function performs an exact match on the list ID.
 * Network latency is simulated to emulate real-world API behavior.
 *
 * @returns A promise that resolves to the list object if found, or undefined if not found
 *
 * @example
 * ```typescript
 * const list = await getListById(5);
 * if (list) {
 *   console.log(list.name); // "Shopping"
 * } else {
 *   console.log("List not found");
 * }
 * ```
 */
export const getListById = async (id: number) => {
  await simulateNetworkLatency();
  return db.select().from(lists).where(eq(lists.id, id)).get();
};

/**
 * Creates a new list with the specified name
 *
 * @param name - The name of the list to create
 *
 * @remarks
 * This function inserts a new record in the lists table.
 * The created_at and updated_at fields are automatically handled by the database.
 * Network latency is simulated to emulate real-world API behavior.
 *
 * @returns A promise that resolves when the list is created
 *
 * @example
 * ```typescript
 * await createList("Grocery Shopping");
 * ```
 */
export const createList = async (name: string) => {
  await simulateNetworkLatency();
  return db
    .insert(lists)
    .values({
      name,
    })
    .run();
};

/**
 * Updates an existing list with a new name
 *
 * @param id - The unique identifier of the list to update
 * @param name - The new name for the list
 *
 * @remarks
 * This function updates the name and updated_at fields of the specified list.
 * Network latency is simulated to emulate real-world API behavior.
 *
 * @returns A promise that resolves when the list is updated
 *
 * @example
 * ```typescript
 * await updateList(5, "Grocery List");
 * ```
 */
export const updateList = async (id: number, name: string) => {
  await simulateNetworkLatency();
  return db
    .update(lists)
    .set({
      name,
      updated_at: new Date().toISOString(),
    })
    .where(eq(lists.id, id))
    .run();
};

/**
 * Deletes a list by its ID
 *
 * @param id - The unique identifier of the list to delete
 *
 * @remarks
 * This function removes the list from the database permanently.
 * Note: This operation might cascade to related tasks depending on database constraints.
 * Network latency is simulated to emulate real-world API behavior.
 *
 * @returns A promise that resolves when the list is deleted
 *
 * @example
 * ```typescript
 * await deleteList(5);
 * ```
 */
export const deleteList = async (id: number) => {
  await simulateNetworkLatency();
  return db.delete(lists).where(eq(lists.id, id)).run();
};

/**
 * Searches for lists by name with partial matching
 *
 * @param searchTerm - The string to search for in list names
 *
 * @remarks
 * This function performs a case-sensitive partial match using SQL LIKE operator.
 * The search pattern is %searchTerm%, which means it will match if the search term
 * appears anywhere in the list name.
 * Network latency is simulated to emulate real-world API behavior.
 *
 * @returns A promise that resolves to an array of matching list objects
 *
 * @example
 * ```typescript
 * const results = await searchListsByName("grocery");
 * // Will match lists with names like "Grocery List", "My Grocery Items", etc.
 * ```
 */
export const searchListsByName = async (searchTerm: string) => {
  await simulateNetworkLatency();
  return db
    .select()
    .from(lists)
    .where(like(lists.name, `%${searchTerm}%`))
    .all();
};

/**
 * Retrieves the most recently created lists
 *
 * @param limit - The maximum number of lists to retrieve (defaults to 5)
 *
 * @remarks
 * This function sorts the lists by creation date in descending order (newest first)
 * and limits the results to the specified number.
 * Network latency is simulated to emulate real-world API behavior.
 *
 * @returns A promise that resolves to an array of the most recent list objects
 *
 * @example
 * ```typescript
 * // Get the 3 most recently created lists
 * const recentLists = await getRecentLists(3);
 * ```
 */
export const getRecentLists = async (limit = 5) => {
  await simulateNetworkLatency();
  return db.select().from(lists).orderBy(desc(lists.created_at)).limit(limit).all();
};
