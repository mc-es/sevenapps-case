import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import { createList, deleteList, listsKeys, updateList } from '@/queries';
import {
  getZodMessage,
  type ListById,
  type ListCreate,
  type ListDto,
  type ListUpdate,
} from '@/validations';

type Ctx = { prev: ListDto[] };

interface Response {
  createM: UseMutationResult<unknown, unknown, ListCreate, Ctx | undefined>;
  renameM: UseMutationResult<unknown, unknown, ListUpdate, Ctx | undefined>;
  deleteM: UseMutationResult<unknown, unknown, ListById, Ctx | undefined>;
  invalidateAll: () => void;
}

const useListMutations = (recentLimit: number): Response => {
  const qc = useQueryClient();

  const snapshot = (): ListDto[] => qc.getQueryData(listsKeys.all) ?? [];
  const setAll = (next: ListDto[]): unknown => qc.setQueryData(listsKeys.all, next);
  const invalidateAll = (): void => {
    qc.invalidateQueries({ queryKey: listsKeys.all });
    qc.invalidateQueries({ queryKey: [...listsKeys.all, 'recent', recentLimit] });
  };

  const createM = useMutation<unknown, unknown, ListCreate, Ctx | undefined>({
    mutationFn: ({ name }) => createList({ name }),
    onMutate: async ({ name }) => {
      await qc.cancelQueries({ queryKey: listsKeys.all });
      const prev = snapshot();
      setAll([
        ...prev,
        { id: Math.floor(Math.random() * 1e9), name, created_at: new Date().toISOString() },
      ]);
      return { prev };
    },
    onError: (err, _vars, ctx) => {
      console.error(getZodMessage(err));
      if (ctx?.prev) setAll(ctx.prev);
    },
    onSettled: () => invalidateAll(),
  });

  const renameM = useMutation<unknown, unknown, ListUpdate, Ctx | undefined>({
    mutationFn: ({ id, name }) => updateList({ id, name }),
    onMutate: async ({ id, name }) => {
      await qc.cancelQueries({ queryKey: listsKeys.all });
      const prev = snapshot();
      setAll(
        prev.map((l) => (l.id === id ? { ...l, name, updated_at: new Date().toISOString() } : l)),
      );
      return { prev };
    },
    onError: (err, _vars, ctx) => {
      console.error(getZodMessage(err));
      if (ctx?.prev) setAll(ctx.prev);
    },
    onSettled: () => invalidateAll(),
  });

  const deleteM = useMutation<unknown, unknown, ListById, Ctx | undefined>({
    mutationFn: ({ id }) => deleteList({ id }),
    onMutate: async ({ id }) => {
      await qc.cancelQueries({ queryKey: listsKeys.all });
      const prev = snapshot();
      setAll(prev.filter((l) => l.id !== id));
      return { prev };
    },
    onError: (err, _vars, ctx) => {
      console.error(getZodMessage(err));
      if (ctx?.prev) setAll(ctx.prev);
    },
    onSettled: () => invalidateAll(),
  });

  return { createM, renameM, deleteM, invalidateAll };
};

export { useListMutations };
