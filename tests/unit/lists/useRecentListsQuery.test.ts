import { waitFor } from '@testing-library/react-native';

import { useRecentListsQuery } from '@/features/lists/hooks/useRecentListsQuery';
import * as Queries from '@/queries';
import { renderHookWithProviders } from '@/tests/utils';

jest.mock('@/queries', () => ({
  __esModule: true,
  listsKeys: { all: ['lists'] },
  getRecentLists: jest.fn(),
}));

const getRecentLists = Queries.getRecentLists as jest.MockedFunction<typeof Queries.getRecentLists>;

describe('useRecentListsQuery', () => {
  it('calls getRecentLists({ limit }) and returns data', async () => {
    getRecentLists.mockResolvedValueOnce([{ id: 1, name: 'Groceries' }]);

    const { result } = renderHookWithProviders(() => useRecentListsQuery(3));

    await waitFor(() => {
      expect(getRecentLists).toHaveBeenCalledTimes(1);
      expect(result.current.recentLists).toEqual([{ id: 1, name: 'Groceries' }]);
    });

    expect(getRecentLists).toHaveBeenCalledWith({ limit: 3 });
  });

  it('refetch runs the query again and updates data', async () => {
    getRecentLists
      .mockResolvedValueOnce([{ id: 1, name: 'Groceries' }])
      .mockResolvedValueOnce([{ id: 2, name: 'Office' }]);

    const { result } = renderHookWithProviders(() => useRecentListsQuery(5));

    await waitFor(() => {
      expect(result.current.recentLists).toEqual([{ id: 1, name: 'Groceries' }]);
    });

    result.current.refetch();

    await waitFor(() => {
      expect(getRecentLists).toHaveBeenCalledTimes(2);
      expect(result.current.recentLists).toEqual([{ id: 2, name: 'Office' }]);
    });

    expect(getRecentLists).toHaveBeenLastCalledWith({ limit: 5 });
  });
});
