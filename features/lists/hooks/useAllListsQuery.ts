import { useQuery, type QueryKey } from '@tanstack/react-query';

import { getAllLists, listsKeys, searchListsByName } from '@/queries';
import type { ListItem } from '@/types/lists';

interface Response {
  key: QueryKey;
  lists: ListItem[];
  isLoading: boolean;
  isError: boolean;
  isRefetching: boolean;
  refetch: () => void;
}

const useAllListsQuery = (debouncedSearch: string): Response => {
  const hasSearch = debouncedSearch.length > 0;
  const key = hasSearch
    ? ([...listsKeys.all, 'search', debouncedSearch] as QueryKey)
    : (listsKeys.all as QueryKey);

  const q = useQuery({
    queryKey: key,
    queryFn: () => (hasSearch ? searchListsByName(debouncedSearch) : getAllLists()),
    staleTime: hasSearch ? 5_000 : 10_000,
    placeholderData: (prev) => prev,
  });

  return {
    key,
    lists: (q.data as ListItem[]) ?? [],
    isLoading: q.isLoading,
    isError: q.isError,
    isRefetching: q.isRefetching,
    refetch: () => q.refetch(),
  };
};

export { useAllListsQuery };
