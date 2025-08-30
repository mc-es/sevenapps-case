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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

type UseListsDataParams = {
  debouncedSearch: string;
  recentLimit?: number;
};

type UseListsDataResponse = {
  lists: ListItem[];
  recentLists: ListItem[];
  isLoading: boolean;
  isError: boolean;
  isRefetching: boolean;
  refetchAll: () => void;
  createList: (name: string) => void;
  renameList: (id: number, name: string) => void;
  deleteList: (id: number) => void;
};

export default function useListsData({
  debouncedSearch,
  recentLimit = 5,
}: UseListsDataParams): UseListsDataResponse {
  const qc = useQueryClient();

  const allListsQ = useQuery({
    queryKey: listsKeys.all,
    queryFn: getAllLists,
    staleTime: 10_000,
    enabled: debouncedSearch.length === 0,
  });

  const searchListsQ = useQuery({
    queryKey: [...listsKeys.all, 'search', debouncedSearch],
    queryFn: () => searchListsByName(debouncedSearch),
    enabled: debouncedSearch.length > 0,
    staleTime: 5_000,
  });

  const recentListsQ = useQuery({
    queryKey: [...listsKeys.all, 'recent', recentLimit],
    queryFn: () => getRecentLists(recentLimit),
    staleTime: 30_000,
  });

  const createListMutation = useMutation({
    mutationFn: (name: string) => createList(name),
    onMutate: async (name) => {
      await qc.cancelQueries({ queryKey: listsKeys.all });
      const prev = (qc.getQueryData(listsKeys.all) as ListItem[]) ?? [];
      qc.setQueryData(listsKeys.all, [
        ...prev,
        { id: Math.random(), name, created_at: new Date().toISOString(), updated_at: null },
      ]);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(listsKeys.all, ctx.prev);
      Alert.alert('Hata', 'Liste ekleme başarısız oldu.');
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: listsKeys.all });
      qc.invalidateQueries({ queryKey: [...listsKeys.all, 'recent', recentLimit] });
    },
  });

  const renameMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => updateList(id, name),
    onMutate: async ({ id, name }) => {
      await qc.cancelQueries({ queryKey: listsKeys.all });
      const prev = (qc.getQueryData(listsKeys.all) as ListItem[]) ?? [];
      const next = prev.map((l) =>
        l.id === id ? { ...l, name, updated_at: new Date().toISOString() } : l,
      );
      qc.setQueryData(listsKeys.all, next);
      return { prev };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(listsKeys.all, ctx.prev);
      Alert.alert('Hata', 'Yeniden adlandırma başarısız oldu.');
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: listsKeys.all });
      qc.invalidateQueries({ queryKey: [...listsKeys.all, 'recent', recentLimit] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteList(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: listsKeys.all });
      const prev = (qc.getQueryData(listsKeys.all) as ListItem[]) ?? [];
      qc.setQueryData(
        listsKeys.all,
        prev.filter((l) => l.id !== id),
      );
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(listsKeys.all, ctx.prev);
      Alert.alert('Hata', 'Silme işlemi başarısız oldu.');
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: listsKeys.all });
      qc.invalidateQueries({ queryKey: [...listsKeys.all, 'recent', recentLimit] });
    },
  });

  const isLoading = allListsQ.isLoading || searchListsQ.isLoading;
  const isError = allListsQ.isError || searchListsQ.isError;
  const lists: ListItem[] =
    (debouncedSearch.length > 0
      ? (searchListsQ.data as ListItem[])
      : (allListsQ.data as ListItem[])) ?? [];

  return {
    lists,
    recentLists: (recentListsQ.data as ListItem[]) ?? [],
    isLoading,
    isError,
    isRefetching: allListsQ.isRefetching || searchListsQ.isRefetching,
    refetchAll: (): void => {
      allListsQ.refetch();
      searchListsQ.refetch();
      recentListsQ.refetch();
    },
    createList: (name: string) => createListMutation.mutate(name),
    renameList: (id: number, name: string) => renameMutation.mutate({ id, name }),
    deleteList: (id: number) => deleteMutation.mutate(id),
  };
}
