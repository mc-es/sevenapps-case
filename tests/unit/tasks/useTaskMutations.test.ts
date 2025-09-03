import { act, waitFor } from '@testing-library/react-native';

import { useTaskMutations } from '@/features/tasks/hooks/useTaskMutations';
import * as Queries from '@/queries';
import { renderHookWithProviders } from '@/tests/utils';

jest.mock('@/queries', () => ({
  __esModule: true,
  createTask: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
  toggleTaskCompletion: jest.fn(),
}));

const createTask = Queries.createTask as jest.MockedFunction<typeof Queries.createTask>;
const updateTask = Queries.updateTask as jest.MockedFunction<typeof Queries.updateTask>;
const deleteTask = Queries.deleteTask as jest.MockedFunction<typeof Queries.deleteTask>;
const toggleTaskCompletion = Queries.toggleTaskCompletion as jest.MockedFunction<
  typeof Queries.toggleTaskCompletion
>;

describe('useTaskMutations', () => {
  const listId = 7;
  const key = ['tasks', 'byList', listId] as const;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('toggle → calls toggleTaskCompletion(vars) and becomes success', async () => {
    const { result } = renderHookWithProviders(() => useTaskMutations(listId, key));

    act(() => {
      result.current.toggle.mutate({ id: 1, is_completed: true });
    });

    await waitFor(() => expect(result.current.toggle.isSuccess).toBe(true));
    expect(toggleTaskCompletion).toHaveBeenCalledWith({ id: 1, is_completed: true });
  });

  it('create → calls createTask with list_id added and becomes success', async () => {
    const { result } = renderHookWithProviders(() => useTaskMutations(listId, key));

    act(() => {
      result.current.create.mutate({
        name: 'Task X',
        description: 'desc',
        priority: 'high',
        due_date: '2025-01-02T10:00:00.000Z',
      });
    });

    await waitFor(() => expect(result.current.create.isSuccess).toBe(true));
    expect(createTask).toHaveBeenCalledWith({
      name: 'Task X',
      description: 'desc',
      priority: 'high',
      due_date: '2025-01-02T10:00:00.000Z',
      list_id: listId,
    });
  });

  it('edit → calls updateTask(vars) and becomes success', async () => {
    const { result } = renderHookWithProviders(() => useTaskMutations(listId, key));

    act(() => {
      result.current.edit.mutate({
        id: 11,
        name: 'Renamed',
        description: 'updated',
        priority: 'low',
        status: 'in_progress',
        is_completed: false,
        due_date: '2025-01-03T08:00:00.000Z',
      });
    });

    await waitFor(() => expect(result.current.edit.isSuccess).toBe(true));
    expect(updateTask).toHaveBeenCalledWith({
      id: 11,
      name: 'Renamed',
      description: 'updated',
      priority: 'low',
      status: 'in_progress',
      is_completed: false,
      due_date: '2025-01-03T08:00:00.000Z',
    });
  });

  it('remove → calls deleteTask({ id }) and becomes success', async () => {
    const { result } = renderHookWithProviders(() => useTaskMutations(listId, key));

    act(() => {
      result.current.remove.mutate({ id: 99 });
    });

    await waitFor(() => expect(result.current.remove.isSuccess).toBe(true));
    expect(deleteTask).toHaveBeenCalledWith({ id: 99 });
  });

  it('setStatus → maps status to updateTask payload and becomes success', async () => {
    const { result } = renderHookWithProviders(() => useTaskMutations(listId, key));

    act(() => {
      result.current.setStatus.mutate({ id: 5, status: 'completed' });
    });

    await waitFor(() => expect(result.current.setStatus.isSuccess).toBe(true));
    expect(updateTask).toHaveBeenCalledWith({
      id: 5,
      status: 'completed',
      is_completed: true,
    });
  });
});
