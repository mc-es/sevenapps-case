import type { UseMutationResult } from '@tanstack/react-query';
import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';

import { createTask, deleteTask, toggleTaskCompletion, updateTask } from '@/queries';
import type { TaskItem } from '@/types/tasks';

type ToggleVars = Pick<TaskItem, 'id'> & { next: boolean };
type CreateVars = Pick<TaskItem, 'name' | 'priority'> &
  Partial<Pick<TaskItem, 'description' | 'due_date'>>;
type EditVars = Omit<TaskItem, 'list_id'>;
type DeleteVars = number;
type SetStatusVars = Pick<TaskItem, 'id' | 'status'>;
type Ctx = { prev: TaskItem[] };

interface Response {
  toggle: UseMutationResult<unknown, unknown, ToggleVars, Ctx | undefined>;
  create: UseMutationResult<unknown, unknown, CreateVars, Ctx | undefined>;
  edit: UseMutationResult<unknown, unknown, EditVars, Ctx | undefined>;
  remove: UseMutationResult<unknown, unknown, DeleteVars, Ctx | undefined>;
  setStatus: UseMutationResult<unknown, unknown, SetStatusVars, Ctx | undefined>;
}

const useTaskMutations = (listId: number, key: QueryKey): Response => {
  const qc = useQueryClient();

  const toggle = useMutation({
    mutationFn: ({ id, next }: { id: number; next: boolean }) => toggleTaskCompletion(id, next),
    onMutate: async ({ id, next }) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = (qc.getQueryData(key) as TaskItem[]) ?? [];
      const nextData = prev.map((t) =>
        t.id === id
          ? {
              ...t,
              is_completed: next,
              status: next ? 'completed' : 'not_started',
              updated_at: new Date().toISOString(),
            }
          : t,
      );
      qc.setQueryData(key, nextData);
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });

  const create = useMutation({
    mutationFn: (p: CreateVars) =>
      createTask({
        name: p.name,
        description: p.description,
        priority: p.priority,
        due_date: p.due_date,
        status: 'not_started',
        is_completed: false,
        list_id: listId,
      }),
    onMutate: async (p) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData(key) as TaskItem[];
      const optimistic: TaskItem = {
        id: Math.floor(Math.random() * 1e9),
        name: p.name,
        description: p.description,
        status: 'not_started',
        due_date: p.due_date,
        priority: p.priority,
        is_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        list_id: listId,
      };
      qc.setQueryData(key, [...prev, optimistic]);
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });

  const edit = useMutation({
    mutationFn: (p: EditVars) =>
      updateTask(p.id, {
        name: p.name,
        description: p.description,
        priority: p.priority,
        due_date: p.due_date,
      }),
    onMutate: async (p) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData(key) as TaskItem[];
      const next = prev.map((t) =>
        t.id === p.id
          ? {
              ...t,
              name: p.name,
              description: p.description,
              priority: p.priority,
              due_date: p.due_date,
              updated_at: new Date().toISOString(),
            }
          : t,
      );
      qc.setQueryData(key, next);
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteTask(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = (qc.getQueryData(key) as TaskItem[]) ?? [];
      qc.setQueryData(
        key,
        prev.filter((t) => t.id !== id),
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });

  const setStatus = useMutation({
    mutationFn: ({ id, status }: SetStatusVars) =>
      updateTask(id, {
        status,
        is_completed: status === 'completed',
      }),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = (qc.getQueryData(key) as TaskItem[]) ?? [];
      const next = prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status,
              is_completed: status === 'completed',
              updated_at: new Date().toISOString(),
            }
          : t,
      );
      qc.setQueryData(key, next);
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });

  return { toggle, create, edit, remove, setStatus };
};

export { useTaskMutations };
