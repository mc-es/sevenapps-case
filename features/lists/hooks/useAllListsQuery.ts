import { useQuery, type QueryKey } from '@tanstack/react-query';

import { getAllLists, listsKeys, searchListsByName } from '@/queries';
import type { ListDto } from '@/validations';

interface Response {
  key: QueryKey;
  lists: ListDto[];
  isLoading: boolean;
  isError: boolean;
  isRefetching: boolean;
  refetch: () => void;
}

const useAllListsQuery = (search: string): Response => {
  const term = search.trim();
  const hasSearch = term.length > 0;
  const key: QueryKey = hasSearch ? [...listsKeys.all, 'search', term] : listsKeys.all;

  const q = useQuery<ListDto[]>({
    queryKey: key,
    queryFn: () => (hasSearch ? searchListsByName({ term }) : getAllLists()),
    staleTime: hasSearch ? 5_000 : 10_000,
    placeholderData: (prev) => prev,
    refetchOnWindowFocus: false,
  });

  return {
    key,
    lists: q.data ?? [],
    isLoading: q.isLoading,
    isError: q.isError,
    isRefetching: q.isRefetching,
    refetch: () => q.refetch(),
  };
};

export { useAllListsQuery };
