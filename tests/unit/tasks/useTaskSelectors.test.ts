import { renderHook } from '@testing-library/react-native';

import { useTaskSelectors } from '@/features/tasks/hooks/useTaskSelectors';

describe('useTaskSelectors', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2025-01-01T00:00:00.000Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  const baseTasks = [
    {
      id: 1,
      name: 'Buy milk',
      priority: 'low',
      is_completed: false,
      due_date: '2025-01-03T10:00:00.000Z',
      updated_at: '2024-12-31T12:00:00.000Z',
    },
    {
      id: 2,
      name: 'Email Bob',
      priority: 'high',
      is_completed: false,
      due_date: '2024-12-30T09:00:00.000Z',
      updated_at: '2024-12-30T10:00:00.000Z',
    },
    {
      id: 3,
      name: 'Pay bills',
      priority: 'medium',
      is_completed: true,
      due_date: '2025-01-05T09:00:00.000Z',
      updated_at: '2025-01-01T08:00:00.000Z',
    },
    {
      id: 4,
      name: 'Book tickets',
      priority: 'high',
      is_completed: true,
      due_date: null,
      updated_at: '2025-01-02T07:00:00.000Z',
    },
    {
      id: 5,
      name: 'buy bread',
      priority: 'low',
      is_completed: false,
      due_date: '2025-01-02T08:00:00.000Z',
      updated_at: '2024-12-29T07:00:00.000Z',
    },
  ] as any[];

  it('returns all tasks with no search/priority and tab=all', () => {
    const { result } = renderHook(() =>
      useTaskSelectors({
        tasks: baseTasks,
        search: '',
        tab: 'all',
        priority: null,
      }),
    );

    expect(result.current.displayTasks.map((t) => t.id)).toEqual([1, 2, 3, 4, 5]);
    expect(result.current.completedCount).toBe(baseTasks.filter((t) => t.is_completed).length);
  });

  it('filters by search (case-insensitive)', () => {
    const { result } = renderHook(() =>
      useTaskSelectors({
        tasks: baseTasks,
        search: 'BUY',
        tab: 'all',
        priority: null,
      }),
    );

    expect(result.current.displayTasks.map((t) => t.id)).toEqual([1, 5]);
  });

  it('filters by priority', () => {
    const { result } = renderHook(() =>
      useTaskSelectors({
        tasks: baseTasks,
        search: '',
        tab: 'all',
        priority: 'high',
      }),
    );

    expect(result.current.displayTasks.map((t) => t.id)).toEqual([2, 4]);
    expect(result.current.completedCount).toBe(1);
  });

  it('tab=upcoming → due_date > now && not completed, sorted by due_date asc', () => {
    const { result } = renderHook(() =>
      useTaskSelectors({
        tasks: baseTasks,
        search: '',
        tab: 'upcoming',
        priority: null,
      }),
    );

    expect(result.current.displayTasks.map((t) => t.id)).toEqual([5, 1]);
    expect(result.current.completedCount).toBe(0);
  });

  it('tab=completed → only completed, sorted by updated_at desc', () => {
    const { result } = renderHook(() =>
      useTaskSelectors({
        tasks: baseTasks,
        search: '',
        tab: 'completed',
        priority: null,
      }),
    );

    expect(result.current.displayTasks.map((t) => t.id)).toEqual([4, 3]);
    expect(result.current.completedCount).toBe(2);
  });

  it('combines search + priority before tab-specific filtering/sorting', () => {
    const { result } = renderHook(() =>
      useTaskSelectors({
        tasks: baseTasks,
        search: 'buy',
        tab: 'upcoming',
        priority: 'low',
      }),
    );

    expect(result.current.displayTasks.map((t) => t.id)).toEqual([5, 1]);
  });
});
