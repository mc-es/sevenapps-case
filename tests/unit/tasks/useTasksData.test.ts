import { act } from '@testing-library/react-native';

import { useTaskMutations } from '@/features/tasks/hooks/useTaskMutations';
import { useTaskSelectors } from '@/features/tasks/hooks/useTaskSelectors';
import { useTasksData } from '@/features/tasks/hooks/useTasksData';
import { useTasksQueries } from '@/features/tasks/hooks/useTasksQueries';
import { renderHookWithProviders } from '@/tests/utils';

jest.mock('@/features/tasks/hooks/useTasksQueries', () => ({
  useTasksQueries: jest.fn(),
}));
jest.mock('@/features/tasks/hooks/useTaskMutations', () => ({
  useTaskMutations: jest.fn(),
}));
jest.mock('@/features/tasks/hooks/useTaskSelectors', () => ({
  useTaskSelectors: jest.fn(),
}));

type MockedFn<T extends (...args: any) => any> = jest.MockedFunction<T>;
const mockUseTasksQueries = useTasksQueries as MockedFn<typeof useTasksQueries>;
const mockUseTaskMutations = useTaskMutations as MockedFn<typeof useTaskMutations>;
const mockUseTaskSelectors = useTaskSelectors as MockedFn<typeof useTaskSelectors>;

describe('useTasksData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('exposes data/flags from queries & selectors', () => {
    const refetch = jest.fn();

    mockUseTasksQueries.mockReturnValue({
      key: ['tasks', 'byList', 7],
      tasks: [{ id: 1, name: 'A', is_completed: false } as any],
      isLoading: false,
      isError: false,
      isRefetching: false,
      refetch,
    });

    mockUseTaskSelectors.mockReturnValue({
      displayTasks: [{ id: 1, name: 'A', is_completed: false } as any],
      completedCount: 0,
    });

    mockUseTaskMutations.mockReturnValue({
      toggle: { mutate: jest.fn() } as any,
      create: { mutate: jest.fn() } as any,
      edit: { mutate: jest.fn() } as any,
      remove: { mutate: jest.fn() } as any,
      setStatus: { mutate: jest.fn() } as any,
    });

    const { result } = renderHookWithProviders(() =>
      useTasksData({
        listId: 7,
        search: '',
        tab: 'all',
        priorityFilter: null,
      }),
    );

    expect(result.current.displayTasks).toEqual([{ id: 1, name: 'A', is_completed: false }]);
    expect(result.current.completedCount).toBe(0);
    expect(result.current.isAnyLoading).toBe(false);
    expect(result.current.isAnyError).toBe(false);
    expect(result.current.isRefetching).toBe(false);

    act(() => {
      result.current.refetchAll();
    });
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('calls toggle/create/edit/delete/setStatus with correct payloads', () => {
    const toggle = { mutate: jest.fn() };
    const create = { mutate: jest.fn() };
    const edit = { mutate: jest.fn() };
    const remove = { mutate: jest.fn() };
    const setStatus = { mutate: jest.fn() };

    mockUseTasksQueries.mockReturnValue({
      key: ['tasks', 'byList', 10],
      tasks: [{ id: 2, name: 'B', is_completed: false } as any],
      isLoading: false,
      isError: false,
      isRefetching: false,
      refetch: jest.fn(),
    });

    mockUseTaskSelectors.mockReturnValue({
      displayTasks: [{ id: 2, name: 'B', is_completed: false } as any],
      completedCount: 0,
    });

    mockUseTaskMutations.mockReturnValue({
      toggle: toggle as any,
      create: create as any,
      edit: edit as any,
      remove: remove as any,
      setStatus: setStatus as any,
    });

    const { result } = renderHookWithProviders(() =>
      useTasksData({
        listId: 10,
        search: 'q',
        tab: 'upcoming',
        priorityFilter: 'high',
      }),
    );

    act(() => {
      result.current.toggleTask({ id: 2, is_completed: false } as any);
    });
    expect(toggle.mutate).toHaveBeenCalledWith({ id: 2, is_completed: true });

    act(() => {
      result.current.createTask({
        name: 'New',
        description: 'desc',
        priority: 'low',
        due_date: '2025-01-01T10:00:00.000Z',
      });
    });
    expect(create.mutate).toHaveBeenCalledWith({
      name: 'New',
      description: 'desc',
      priority: 'low',
      due_date: '2025-01-01T10:00:00.000Z',
    });

    act(() => {
      result.current.editTask({
        id: 5,
        name: 'Renamed',
        description: 'updated',
        priority: 'medium',
        status: 'in_progress',
        is_completed: false,
        due_date: '2025-02-01T09:00:00.000Z',
      });
    });
    expect(edit.mutate).toHaveBeenCalledWith({
      id: 5,
      name: 'Renamed',
      description: 'updated',
      priority: 'medium',
      status: 'in_progress',
      due_date: '2025-02-01T09:00:00.000Z',
    });

    act(() => {
      result.current.deleteTask(9);
    });
    expect(remove.mutate).toHaveBeenCalledWith({ id: 9 });

    act(() => {
      result.current.setTaskStatus({ id: 7, status: 'completed' });
    });
    expect(setStatus.mutate).toHaveBeenCalledWith({ id: 7, status: 'completed' });
  });
});
