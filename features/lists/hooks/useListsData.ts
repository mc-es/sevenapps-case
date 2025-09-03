import type { ListDto } from '@/validations';

import { useAllListsQuery } from './useAllListsQuery';
import { useListMutations } from './useListMutations';
import { useRecentListsQuery } from './useRecentListsQuery';

interface Params {
  search: string;
  recentLimit?: number;
}

interface Response {
  lists: ListDto[];
  recentLists: ListDto[];
  isLoading: boolean;
  isError: boolean;
  isRefetching: boolean;
  refetchAll: () => void;
  createList: (name: string) => void;
  renameList: (id: number, name: string) => void;
  deleteList: (id: number) => void;
}

const useListsData = ({ search, recentLimit = 3 }: Params): Response => {
  const qAll = useAllListsQuery(search);
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
    createList: (name: string) => m.createM.mutate({ name }),
    renameList: (id: number, name: string) => m.renameM.mutate({ id, name }),
    deleteList: (id: number) => m.deleteM.mutate({ id }),
  };
};

export { useListsData };
