import type { ListItem } from '@/types/lists';

import { useAllListsQuery } from './useAllListsQuery';
import { useListMutations } from './useListMutations';
import { useRecentListsQuery } from './useRecentListsQuery';

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

const useListsData = ({ debouncedSearch, recentLimit = 3 }: Params): Response => {
  const qAll = useAllListsQuery(debouncedSearch);
  const qRecent = useRecentListsQuery(recentLimit);
  const m = useListMutations(recentLimit);

  return {
    lists: qAll.lists,
    recentLists: qRecent.recentLists,
    isLoading: qAll.isLoading,
    isError: qAll.isError,
    isRefetching: qAll.isRefetching,
    refetchAll: (): void => {
      qAll.refetch();
      qRecent.refetch();
    },
    createList: (name: string) => m.createM.mutate(name),
    renameList: (id: number, name: string) => m.renameM.mutate({ id, name }),
    deleteList: (id: number) => m.deleteM.mutate(id),
  };
};

export { useListsData };
