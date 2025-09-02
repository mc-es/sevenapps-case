import { useQuery } from '@tanstack/react-query';

import { getRecentLists, listsKeys } from '@/queries';
import type { ListDto } from '@/validations';

interface Response {
  recentLists: ListDto[];
  refetch: () => void;
}

const useRecentListsQuery = (limit: number): Response => {
  const q = useQuery<ListDto[]>({
    queryKey: [...listsKeys.all, 'recent', limit],
    queryFn: () => getRecentLists({ limit }),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,
  });

  return {
    recentLists: q.data ?? [],
    refetch: () => q.refetch(),
  };
};

export { useRecentListsQuery };
