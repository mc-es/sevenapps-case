import { useQuery } from '@tanstack/react-query';

import { getRecentLists, listsKeys } from '@/queries';
import type { ListItem } from '@/types/lists';

interface Response {
  recentLists: ListItem[];
  refetch: () => void;
}

const useRecentListsQuery = (recentLimit: number): Response => {
  const q = useQuery({
    queryKey: [...listsKeys.all, 'recent', recentLimit],
    queryFn: () => getRecentLists(recentLimit),
    staleTime: 30_000,
  });

  return {
    recentLists: (q.data as ListItem[]) ?? [],
    refetch: () => q.refetch(),
  };
};

export { useRecentListsQuery };
