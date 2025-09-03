import { waitFor } from '@testing-library/react-native';

import { useTasksQueries } from '@/features/tasks/hooks/useTasksQueries';
import * as Queries from '@/queries';
import { renderHookWithProviders } from '@/tests/utils';

jest.mock('@/queries', () => ({
  __esModule: true,
  tasksKeys: {
    byList: (id: number) => ['tasks', 'byList', id],
  },
  getTasksByListId: jest.fn(),
}));

const getTasksByListId = Queries.getTasksByListId as jest.MockedFunction<
  typeof Queries.getTasksByListId
>;

describe('useTasksQueries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls getTasksByListId({ list_id }) when listId is finite and returns data + key', async () => {
    getTasksByListId.mockResolvedValueOnce([
      { id: 1, list_id: 7, title: 'Buy milk' },
      { id: 2, list_id: 7, title: 'Email Bob' },
    ] as any);

    const { result } = renderHookWithProviders(() => useTasksQueries(7));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(getTasksByListId).toHaveBeenCalledTimes(1);
    expect(getTasksByListId).toHaveBeenCalledWith({ list_id: 7 });

    expect(result.current.key).toEqual(['tasks', 'byList', 7]);
    expect(result.current.tasks).toEqual([
      { id: 1, list_id: 7, title: 'Buy milk' },
      { id: 2, list_id: 7, title: 'Email Bob' },
    ]);
    expect(result.current.isError).toBe(false);
    expect(result.current.isRefetching).toBe(false);
  });

  it('does not run query when listId is not finite (enabled=false)', async () => {
    const { result } = renderHookWithProviders(() => useTasksQueries(Number.NaN));

    expect(result.current.isLoading).toBe(false);
    expect(getTasksByListId).not.toHaveBeenCalled();
    expect(result.current.key).toEqual(['tasks', 'byList', NaN]);
    expect(result.current.tasks).toEqual([]);
  });
});
