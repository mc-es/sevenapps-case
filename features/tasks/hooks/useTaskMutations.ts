import type { UseMutationResult } from '@tanstack/react-query';
import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';

import { createTask, deleteTask, toggleTaskCompletion, updateTask } from '@/queries';
import {
  getZodMessage,
  type Status,
  type TaskById,
  type TaskCreate,
  type TaskDto,
  type TaskToggleCompletion,
  type TaskUpdate,
} from '@/validations';

type ToggleVars = TaskToggleCompletion;
type CreateVars = Omit<TaskCreate, 'list_id'>;
type EditVars = TaskUpdate;
type DeleteVars = TaskById;
type SetStatusVars = { id: number; status: Status };
type Ctx = { prev: TaskDto[] };

interface Response {
  toggle: UseMutationResult<unknown, unknown, ToggleVars, Ctx | undefined>;
  create: UseMutationResult<unknown, unknown, CreateVars, Ctx | undefined>;
  edit: UseMutationResult<unknown, unknown, EditVars, Ctx | undefined>;
  remove: UseMutationResult<unknown, unknown, DeleteVars, Ctx | undefined>;
  setStatus: UseMutationResult<unknown, unknown, SetStatusVars, Ctx | undefined>;
}

const useTaskMutations = (listId: number, key: QueryKey): Response => {
  const qc = useQueryClient();

  const snapshot = (): TaskDto[] => qc.getQueryData(key) ?? [];
  const setAll = (next: TaskDto[]): unknown => qc.setQueryData(key, next);

  const toggle = useMutation<unknown, unknown, ToggleVars, Ctx | undefined>({
    mutationFn: (vars) => toggleTaskCompletion(vars),
    onMutate: async ({ id, is_completed }) => {
      const status: Status = is_completed ? 'completed' : 'not_started';
      await qc.cancelQueries({ queryKey: key });
      const prev = snapshot();
      const next = prev.map((t) =>
        t.id === id
          ? {
              ...t,
              is_completed,
              status,
              updated_at: new Date().toISOString(),
            }
          : t,
      );
      setAll(next);
      return { prev };
    },
    onError: (e, _v, ctx) => {
      console.error(getZodMessage(e));
      if (ctx?.prev) setAll(ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });

  const create = useMutation<unknown, unknown, CreateVars, Ctx | undefined>({
    mutationFn: (p) => createTask({ ...p, list_id: listId }),
    onMutate: async (p) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = snapshot();
      const optimistic: TaskDto = {
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
      setAll([...prev, optimistic]);
      return { prev };
    },
    onError: (e, _v, ctx) => {
      console.error(getZodMessage(e));
      if (ctx?.prev) setAll(ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });

  const edit = useMutation<unknown, unknown, EditVars, Ctx | undefined>({
    mutationFn: (p) => updateTask(p),
    onMutate: async (p) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = snapshot();
      const next = prev.map((t) => {
        if (t.id !== p.id) return t;

        const partial: Partial<TaskDto> = {
          name: p.name,
          description: p.description,
          priority: p.priority,
          status: p.status,
          is_completed: p.is_completed,
          due_date: p.due_date,
        };

        return { ...t, ...partial, updated_at: new Date().toISOString() };
      });
      setAll(next);
      return { prev };
    },
    onError: (e, _v, ctx) => {
      console.error(getZodMessage(e));
      if (ctx?.prev) setAll(ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });

  const remove = useMutation<unknown, unknown, DeleteVars, Ctx | undefined>({
    mutationFn: (vars) => deleteTask(vars),
    onMutate: async ({ id }) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = snapshot();
      setAll(prev.filter((t) => t.id !== id));
      return { prev };
    },
    onError: (e, _v, ctx) => {
      console.error(getZodMessage(e));
      if (ctx?.prev) setAll(ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });

  const setStatus = useMutation<unknown, unknown, SetStatusVars, Ctx | undefined>({
    mutationFn: ({ id, status }) =>
      updateTask({
        id,
        status,
        is_completed: status === 'completed',
      }),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = snapshot();
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
      setAll(next);
      return { prev };
    },
    onError: (e, _v, ctx) => {
      console.error(getZodMessage(e));
      if (ctx?.prev) setAll(ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });

  return { toggle, create, edit, remove, setStatus };
};

export { useTaskMutations };
