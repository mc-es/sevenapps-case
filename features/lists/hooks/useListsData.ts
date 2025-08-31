import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { listsKeys } from '@/queries/keys';
import {
  createList,
  deleteList,
  getAllLists,
  getRecentLists,
  searchListsByName,
  updateList,
} from '@/queries/lists';
import type { ListItem } from '@/types/lists';

interface Params {
  debouncedSearch: string;
  recentLimit?: number;
}

interface Response {
  lists: ListItem[];
  recentLists: ListItem[];
  isLoading: boolean;
  isError: boolean;
  isRefetching: boolean;
  refetchAll: () => void;
  createList: (name: string) => void;
  renameList: (id: number, name: string) => void;
  deleteList: (id: number) => void;
}

const invalidateAll = (qc: ReturnType<typeof useQueryClient>, recentLimit: number): void => {
  qc.invalidateQueries({ queryKey: listsKeys.all });
  qc.invalidateQueries({ queryKey: [...listsKeys.all, 'recent', recentLimit] });
};

const useListsData = ({ debouncedSearch, recentLimit = 3 }: Params): Response => {
  const qc = useQueryClient();
  const { t } = useTranslation();

  const listsQ = useQuery({
    queryKey: debouncedSearch ? [...listsKeys.all, 'search', debouncedSearch] : listsKeys.all,
    queryFn: () => (debouncedSearch ? searchListsByName(debouncedSearch) : getAllLists()),
    staleTime: debouncedSearch ? 5_000 : 10_000,
    placeholderData: (prev) => prev,
  });

  const recentQ = useQuery({
    queryKey: [...listsKeys.all, 'recent', recentLimit],
    queryFn: () => getRecentLists(recentLimit),
    staleTime: 30_000,
  });

  const snapshot = (): ListItem[] => (qc.getQueryData(listsKeys.all) as ListItem[]) ?? [];
  const setAll = (next: ListItem[]): unknown => qc.setQueryData(listsKeys.all, next);

  const createM = useMutation({
    mutationFn: (name: string) => createList(name),
    onMutate: async (name) => {
      await qc.cancelQueries({ queryKey: listsKeys.all });
      const prev = snapshot();
      setAll([...prev, { id: Math.random(), name, created_at: new Date().toISOString() }]);
      return { prev };
    },
    onError: (_e, _name, ctx) => {
      if (ctx?.prev) setAll(ctx.prev);
      Alert.alert(t('alert.error'), t('alert.failedAddingList'));
    },
    onSettled: () => invalidateAll(qc, recentLimit),
  });

  const renameM = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => updateList(id, name),
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
      Alert.alert(t('alert.error'), t('alert.failedRenamingList'));
    },
    onSettled: () => invalidateAll(qc, recentLimit),
  });

  const deleteM = useMutation({
    mutationFn: (id: number) => deleteList(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: listsKeys.all });
      const prev = snapshot();
      setAll(prev.filter((l) => l.id !== id));
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prev) setAll(ctx.prev);
      Alert.alert(t('alert.error'), t('alert.failedDeletingList'));
    },
    onSettled: () => invalidateAll(qc, recentLimit),
  });

  return {
    lists: (listsQ.data as ListItem[]) ?? [],
    recentLists: (recentQ.data as ListItem[]) ?? [],
    isLoading: !!listsQ.isLoading,
    isError: !!listsQ.isError,
    isRefetching: !!listsQ.isRefetching,
    refetchAll: (): void => {
      listsQ.refetch();
      recentQ.refetch();
    },
    createList: (name) => createM.mutate(name),
    renameList: (id, name) => renameM.mutate({ id, name }),
    deleteList: (id) => deleteM.mutate(id),
  };
};

export { useListsData };
