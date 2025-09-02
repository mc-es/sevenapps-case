import type { Priority, Status, TaskCreate, TaskDto, TaskUpdate } from '@/validations';

import { useTaskMutations } from './useTaskMutations';
import { useTaskSelectors } from './useTaskSelectors';
import { useTasksQueries } from './useTasksQueries';

export type TabKey = 'all' | 'upcoming' | 'completed';

interface Params {
  listId: number;
  search: string;
  tab: TabKey;
  priorityFilter: Priority | null;
}

interface Response {
  displayTasks: TaskDto[];
  completedCount: number;
  isAnyLoading: boolean;
  isAnyError: boolean;
  isRefetching: boolean;
  refetchAll: () => void;
  toggleTask: (task: TaskDto) => void;
  createTask: (p: Omit<TaskCreate, 'list_id'>) => void;
  editTask: (p: TaskUpdate) => void;
  deleteTask: (id: number) => void;
  setTaskStatus: (p: { id: number; status: Status }) => void;
}

const useTasksData = ({ listId, search, tab, priorityFilter }: Params): Response => {
  const q = useTasksQueries(listId);
  const m = useTaskMutations(listId, q.key);
  const s = useTaskSelectors({
    tasks: q.tasks,
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
    toggleTask: (task) => m.toggle.mutate({ id: task.id, is_completed: !task.is_completed }),
    createTask: (p) =>
      m.create.mutate({
        name: p.name,
        description: p.description,
        priority: p.priority,
        due_date: p.due_date,
      }),
    editTask: (p) =>
      m.edit.mutate({
        id: p.id,
        name: p.name,
        description: p.description,
        priority: p.priority,
        status: p.status,
        due_date: p.due_date,
      }),
    deleteTask: (id: number) => m.remove.mutate({ id }),
    setTaskStatus: ({ id, status }) => m.setStatus.mutate({ id, status }),
  };
};

export { useTasksData };
