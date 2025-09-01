import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import { createList, deleteList, listsKeys, updateList } from '@/queries';
import type { ListItem } from '@/types/lists';

type Ctx = { prev: ListItem[] };
type CreateVars = string;
type RenameVars = { id: number; name: string };
type DeleteVars = number;

interface Response {
  createM: UseMutationResult<unknown, unknown, CreateVars, Ctx | undefined>;
  renameM: UseMutationResult<unknown, unknown, RenameVars, Ctx | undefined>;
  deleteM: UseMutationResult<unknown, unknown, DeleteVars, Ctx | undefined>;
  invalidateAll: () => void;
}

const useListMutations = (recentLimit: number): Response => {
  const qc = useQueryClient();

  const invalidateAll = (): void => {
    qc.invalidateQueries({ queryKey: listsKeys.all });
    qc.invalidateQueries({ queryKey: [...listsKeys.all, 'recent', recentLimit] });
  };

  const snapshot = (): ListItem[] => (qc.getQueryData(listsKeys.all) as ListItem[]) ?? [];
  const setAll = (next: ListItem[]): unknown => qc.setQueryData(listsKeys.all, next);

  const createM = useMutation<unknown, unknown, CreateVars, Ctx | undefined>({
    mutationFn: (name) => createList(name),
    onMutate: async (name) => {
      await qc.cancelQueries({ queryKey: listsKeys.all });
      const prev = snapshot();
      setAll([
        ...prev,
        { id: Math.floor(Math.random() * 1e9), name, created_at: new Date().toISOString() },
      ]);
      return { prev };
    },
    onError: (_e, _name, ctx) => {
      if (ctx?.prev) setAll(ctx.prev);
    },
    onSettled: () => invalidateAll(),
  });

  const renameM = useMutation<unknown, unknown, RenameVars, Ctx | undefined>({
    mutationFn: ({ id, name }) => updateList(id, name),
    onMutate: async ({ id, name }) => {
      await qc.cancelQueries({ queryKey: listsKeys.all });
      const prev = snapshot();
      setAll(
        prev.map((l) => (l.id === id ? { ...l, name, updated_at: new Date().toISOString() } : l)),
      );
      return { prev };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.prev) setAll(ctx.prev);
    },
    onSettled: () => invalidateAll(),
  });

  const deleteM = useMutation<unknown, unknown, DeleteVars, Ctx | undefined>({
    mutationFn: (id) => deleteList(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: listsKeys.all });
      const prev = snapshot();
      setAll(prev.filter((l) => l.id !== id));
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prev) setAll(ctx.prev);
    },
    onSettled: () => invalidateAll(),
  });

  return { createM, renameM, deleteM, invalidateAll };
};

export { useListMutations };
