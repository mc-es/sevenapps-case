export const listsKeys = {
  all: ['lists'] as const,
  detail: (id: number) => [...listsKeys.all, id] as const,
};

export const tasksKeys = {
  byList: (listId: number) => ['tasks', 'byList', listId] as const,
};
