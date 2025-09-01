import type { Priority, TaskItem } from '@/types/tasks';

import { useTaskMutations } from './useTaskMutations';
import { useTaskSelectors } from './useTaskSelectors';
import { useTasksQueries } from './useTasksQueries';

export type TabKey = 'all' | 'upcoming' | 'completed';

interface Params {
  listId: number;
  search: string;
  tab: TabKey;
  statusFilter?: string | null;
  priorityFilter: Priority | null;
}

interface Response {
  displayTasks: TaskItem[];
  completedCount: number;
  isAnyLoading: boolean;
  isAnyError: boolean;
  isRefetching: boolean;
  refetchAll: () => void;
  toggleTask: (task: TaskItem) => void;
  createTask: (p: { name: string; description?: string; priority: Priority }) => void;
  editTask: (p: { id: number; name: string; description?: string; priority: Priority }) => void;
  deleteTask: (id: number) => void;
}

const useTasksData = ({ listId, search, tab, priorityFilter }: Params): Response => {
  const q = useTasksQueries(listId);
  const m = useTaskMutations(listId, q.key);
  const s = useTaskSelectors(q.tasks, {
    search,
    tab,
    priority: priorityFilter,
  });

  return {
    displayTasks: s.displayTasks,
    completedCount: s.completedCount,
    isAnyLoading: q.isLoading,
    isAnyError: q.isError,
    isRefetching: q.isRefetching,
    refetchAll: () => q.refetch(),
    toggleTask: (task: TaskItem) => m.toggle.mutate({ id: task.id, next: !task.is_completed }),
    createTask: (p) => m.create.mutate(p),
    editTask: (p) => m.edit.mutate(p),
    deleteTask: (id: number) => m.remove.mutate(id),
  };
};

export { useTasksData };
