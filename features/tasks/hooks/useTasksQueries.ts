import { useQuery, type QueryKey } from '@tanstack/react-query';

import { getTasksByListId, tasksKeys } from '@/queries';
import type { TaskItem } from '@/types/tasks';

interface Response {
  key: QueryKey;
  tasks: TaskItem[];
  isLoading: boolean;
  isError: boolean;
  isRefetching: boolean;
  refetch: () => void;
}

const useTasksQueries = (listId: number): Response => {
  const key = tasksKeys.byList(listId) as QueryKey;

  const listTasksQ = useQuery({
    queryKey: key,
    queryFn: () => getTasksByListId(listId),
    enabled: Number.isFinite(listId),
    staleTime: 10_000,
  });

  return {
    key,
    tasks: (listTasksQ.data as TaskItem[]) ?? [],
    isLoading: listTasksQ.isLoading,
    isError: listTasksQ.isError,
    isRefetching: listTasksQ.isRefetching,
    refetch: () => listTasksQ.refetch(),
  };
};

export { useTasksQueries };
