import { waitFor } from '@testing-library/react-native';

import { useAllListsQuery } from '@/features/lists/hooks/useAllListsQuery';
import * as Queries from '@/queries';
import { renderHookWithProviders } from '@/tests/utils';

jest.mock('@/queries', () => ({
  __esModule: true,
  listsKeys: { all: ['lists'] },
  getAllLists: jest.fn(),
  searchListsByName: jest.fn(),
}));

const getAllLists = Queries.getAllLists as jest.MockedFunction<typeof Queries.getAllLists>;
const searchListsByName = Queries.searchListsByName as jest.MockedFunction<
  typeof Queries.searchListsByName
>;

describe('useAllListsQuery', () => {
  it('calls getAllLists when search is empty and returns data', async () => {
    getAllLists.mockResolvedValueOnce([{ id: 1, name: 'Dummy' }]);

    const { result } = renderHookWithProviders(() => useAllListsQuery(''));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.lists).toEqual([{ id: 1, name: 'Dummy' }]);
  });

  it('calls searchListsByName({term}) when search is provided and sets the key', async () => {
    searchListsByName.mockResolvedValueOnce([{ id: 2, name: 'Silly' }]);

    const { result } = renderHookWithProviders(() => useAllListsQuery('of'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.lists).toEqual([{ id: 2, name: 'Silly' }]);
  });
});
