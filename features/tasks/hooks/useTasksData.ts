// useTasksData.ts
import { error as hError, success as hSuccess, warn as hWarn } from '@/libs/feedback';
import { tasksKeys } from '@/queries/keys';
import {
  createTask,
  deleteTask,
  getCompletedTasks,
  getTasksByListId,
  getTasksByPriority,
  getTasksByStatus,
  getUpcomingTasks,
  searchTasksByName,
  toggleTaskCompletion,
  updateTask,
} from '@/queries/tasks';
import type { Priority, TaskItem } from '@/types/tasks';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Alert } from 'react-native';

type UseTaskDataParams = {
  listId: number;
  search: string;
  tab: 'all' | 'upcoming' | 'completed';
  statusFilter: string | null;
  priorityFilter: Priority | null;
};

type UseTaskDataResponse = {
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
};

export default function useTasksData({
  listId,
  search,
  tab,
  statusFilter,
  priorityFilter,
}: UseTaskDataParams): UseTaskDataResponse {
  const qc = useQueryClient();
  const key = tasksKeys.byList(listId);

  const listTasksQ = useQuery({
    queryKey: key,
    queryFn: () => getTasksByListId(listId),
    enabled: Number.isFinite(listId),
    staleTime: 10_000,
  });

  const searchTasksQ = useQuery({
    queryKey: [...key, 'search', search],
    queryFn: () => searchTasksByName(search),
    enabled: Number.isFinite(listId) && search.length > 0,
    staleTime: 5_000,
  });

  const statusTasksQ = useQuery({
    queryKey: [...key, 'status', statusFilter],
    queryFn: () => getTasksByStatus(statusFilter as string),
    enabled: Number.isFinite(listId) && !!statusFilter,
    staleTime: 10_000,
  });

  const priorityTasksQ = useQuery({
    queryKey: [...key, 'priority', priorityFilter],
    queryFn: () => getTasksByPriority(priorityFilter as string),
    enabled: Number.isFinite(listId) && !!priorityFilter,
    staleTime: 10_000,
  });

  const upcomingQ = useQuery({
    queryKey: [...key, 'upcoming'],
    queryFn: getUpcomingTasks,
    enabled: Number.isFinite(listId) && tab === 'upcoming',
    staleTime: 10_000,
  });

  const completedQ = useQuery({
    queryKey: [...key, 'completed'],
    queryFn: getCompletedTasks,
    enabled: Number.isFinite(listId) && tab === 'completed',
    staleTime: 10_000,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ taskId, nextCompleted }: { taskId: number; nextCompleted: boolean }) =>
      toggleTaskCompletion(taskId, nextCompleted),
    onMutate: async ({ taskId, nextCompleted }) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = (qc.getQueryData(key) as TaskItem[]) ?? [];
      const next = prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              is_completed: nextCompleted,
              status: nextCompleted ? 'completed' : (t.status ?? 'not_started'),
              updated_at: new Date().toISOString(),
            }
          : t,
      );
      qc.setQueryData(key, next);
      return { prev, nextCompleted };
    },
    onError: async (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
      await hError();
      Alert.alert('Hata', 'Görev durumu güncellenemedi.');
    },
    onSuccess: async (_data, _vars, ctx) => {
      if (ctx?.nextCompleted) await hSuccess();
      else await hWarn();
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });

  const createMutation = useMutation({
    mutationFn: (payload: { name: string; description?: string; priority: Priority }) =>
      createTask({
        name: payload.name,
        description: payload.description,
        priority: payload.priority,
        status: 'not_started',
        is_completed: false,
        list_id: listId,
      }),
    onMutate: async (payload) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = (qc.getQueryData(key) as TaskItem[]) ?? [];
      const optimistic: TaskItem = {
        id: Math.floor(Math.random() * 1e9),
        name: payload.name,
        description: payload.description,
        status: 'not_started',
        priority: payload.priority,
        is_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        list_id: listId,
      };
      qc.setQueryData(key, [...prev, optimistic]);
      return { prev };
    },
    onError: async (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
      await hError();
      Alert.alert('Hata', 'Görev ekleme başarısız oldu.');
    },
    onSuccess: async () => {
      await hSuccess();
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });

  const editMutation = useMutation({
    mutationFn: (payload: { id: number; name: string; description?: string; priority: Priority }) =>
      updateTask(payload.id, {
        name: payload.name,
        description: payload.description,
        priority: payload.priority,
      }),
    onMutate: async (payload) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = (qc.getQueryData(key) as TaskItem[]) ?? [];
      const next = prev.map((t) =>
        t.id === payload.id
          ? {
              ...t,
              name: payload.name,
              description: payload.description ?? null,
              priority: payload.priority,
              updated_at: new Date().toISOString(),
            }
          : t,
      );
      qc.setQueryData(key, next);
      return { prev };
    },
    onError: async (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
      await hError();
      Alert.alert('Hata', 'Görev güncellenemedi.');
    },
    onSuccess: async () => {
      await hSuccess();
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });

  const deleteMutation = useMutation({
    mutationFn: (taskId: number) => deleteTask(taskId),
    onMutate: async (taskId) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = (qc.getQueryData(key) as TaskItem[]) ?? [];
      qc.setQueryData(
        key,
        prev.filter((t) => t.id !== taskId),
      );
      return { prev };
    },
    onError: async (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
      await hError();
      Alert.alert('Hata', 'Silme işlemi başarısız oldu.');
    },
    onSuccess: async () => {
      await hSuccess();
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });

  const baseTasks = (listTasksQ.data as TaskItem[]) ?? [];
  const searchSet = ((searchTasksQ.data as TaskItem[]) ?? []).filter((t) => t.list_id === listId);
  const statusSet = ((statusTasksQ.data as TaskItem[]) ?? []).filter((t) => t.list_id === listId);
  const prioritySet = ((priorityTasksQ.data as TaskItem[]) ?? []).filter(
    (t) => t.list_id === listId,
  );
  const upcomingSet = ((upcomingQ.data as TaskItem[]) ?? []).filter((t) => t.list_id === listId);
  const completedSet = ((completedQ.data as TaskItem[]) ?? []).filter((t) => t.list_id === listId);

  const displayTasks: TaskItem[] = useMemo(() => {
    if (tab === 'upcoming') return upcomingSet;
    if (tab === 'completed') return completedSet;
    if (search.length > 0) return searchSet;
    if (statusFilter && priorityFilter) {
      const ids = new Set(prioritySet.map((t) => t.id));
      return statusSet.filter((t) => ids.has(t.id));
    }
    if (statusFilter) return statusSet;
    if (priorityFilter) return prioritySet;
    return baseTasks;
  }, [
    tab,
    search,
    statusFilter,
    priorityFilter,
    baseTasks,
    searchSet,
    statusSet,
    prioritySet,
    upcomingSet,
    completedSet,
  ]);

  const completedCount = useMemo(
    () => displayTasks.filter((t) => t.is_completed).length,
    [displayTasks],
  );

  const isAnyLoading =
    listTasksQ.isLoading ||
    searchTasksQ.isLoading ||
    statusTasksQ.isLoading ||
    priorityTasksQ.isLoading ||
    upcomingQ.isLoading ||
    completedQ.isLoading;

  const isAnyError =
    listTasksQ.isError ||
    searchTasksQ.isError ||
    statusTasksQ.isError ||
    priorityTasksQ.isError ||
    upcomingQ.isError ||
    completedQ.isError;

  return {
    displayTasks,
    completedCount,
    isAnyLoading,
    isAnyError,
    isRefetching: listTasksQ.isRefetching,
    refetchAll: (): void => {
      listTasksQ.refetch();
      searchTasksQ.refetch();
      statusTasksQ.refetch();
      priorityTasksQ.refetch();
      upcomingQ.refetch();
      completedQ.refetch();
    },
    toggleTask: (task: TaskItem): void => {
      const current = !!task.is_completed;
      toggleMutation.mutate({ taskId: task.id, nextCompleted: !current });
    },
    createTask: (p: { name: string; description?: string; priority: Priority }) =>
      createMutation.mutate(p),
    editTask: (p: { id: number; name: string; description?: string; priority: Priority }) =>
      editMutation.mutate(p),
    deleteTask: (id: number) => deleteMutation.mutate(id),
  };
}
