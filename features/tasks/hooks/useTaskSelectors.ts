import { useMemo } from 'react';

import type { Priority, TaskItem } from '@/types/tasks';

import type { TabKey } from './useTasksData';

interface Response {
  displayTasks: TaskItem[];
  completedCount: number;
}

const useTaskSelectors = (
  tasks: TaskItem[],
  { search, tab, priority }: { search: string; tab: TabKey; priority: Priority | null },
): Response =>
  useMemo<Response>(() => {
    let arr = [...tasks];

    if (search) {
      const q = search.toLowerCase();
      arr = arr.filter((t) => t.name?.toLowerCase().includes(q));
    }

    if (priority) arr = arr.filter((t) => (t.priority as Priority | undefined) === priority);

    const nowIso = new Date().toISOString();
    if (tab === 'upcoming') {
      arr = arr
        .filter((t) => !!t.due_date && t.due_date > nowIso && !t.is_completed)
        .sort((a, b) => (a.due_date! > b.due_date! ? 1 : -1));
    } else if (tab === 'completed') {
      arr = arr
        .filter((t) => !!t.is_completed)
        .sort((a, b) => (b.updated_at ?? '').localeCompare(a.updated_at ?? ''));
    }

    const completedCount = arr.filter((t) => t.is_completed).length;
    return { displayTasks: arr, completedCount };
  }, [tasks, search, tab, priority]);

export { useTaskSelectors };
