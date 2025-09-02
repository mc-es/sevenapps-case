import { useQuery, type QueryKey } from '@tanstack/react-query';

import { getTasksByListId, tasksKeys } from '@/queries';
import type { TaskDto } from '@/validations';

interface Response {
  key: QueryKey;
  tasks: TaskDto[];
  isLoading: boolean;
  isError: boolean;
  isRefetching: boolean;
  refetch: () => void;
}

const useTasksQueries = (listId: number): Response => {
  const key: QueryKey = tasksKeys.byList(listId);

  const q = useQuery<TaskDto[]>({
    queryKey: key,
    queryFn: () => getTasksByListId({ list_id: listId }),
    enabled: Number.isFinite(listId),
    staleTime: 10_000,
    placeholderData: (prev) => prev,
    refetchOnWindowFocus: false,
  });

  return {
    key,
    tasks: q.data ?? [],
    isLoading: q.isLoading,
    isError: q.isError,
    isRefetching: q.isRefetching,
    refetch: () => q.refetch(),
  };
};

export { useTasksQueries };
