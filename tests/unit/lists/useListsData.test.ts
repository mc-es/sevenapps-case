import { act } from '@testing-library/react-native';

import { useAllListsQuery } from '@/features/lists/hooks/useAllListsQuery';
import { useListMutations } from '@/features/lists/hooks/useListMutations';
import { useListsData } from '@/features/lists/hooks/useListsData';
import { useRecentListsQuery } from '@/features/lists/hooks/useRecentListsQuery';
import { renderHookWithProviders } from '@/tests/utils';

jest.mock('@/features/lists/hooks/useAllListsQuery', () => ({
  useAllListsQuery: jest.fn(),
}));
jest.mock('@/features/lists/hooks/useRecentListsQuery', () => ({
  useRecentListsQuery: jest.fn(),
}));
jest.mock('@/features/lists/hooks/useListMutations', () => ({
  useListMutations: jest.fn(),
}));

describe('useListsData', () => {
  it('returns data from useAllListsQuery and useRecentListsQuery', () => {
    (useAllListsQuery as jest.Mock).mockReturnValue({
      lists: [{ id: 1, name: 'A' }],
      isLoading: false,
      isError: false,
      isRefetching: false,
      refetch: jest.fn(),
    });
    (useRecentListsQuery as jest.Mock).mockReturnValue({
      recentLists: [{ id: 2, name: 'B' }],
      refetch: jest.fn(),
    });
    (useListMutations as jest.Mock).mockReturnValue({
      createM: { mutate: jest.fn() },
      renameM: { mutate: jest.fn() },
      deleteM: { mutate: jest.fn() },
      invalidateAll: jest.fn(),
    });

    const { result } = renderHookWithProviders(() => useListsData({ search: '', recentLimit: 3 }));

    expect(result.current.lists).toEqual([{ id: 1, name: 'A' }]);
    expect(result.current.recentLists).toEqual([{ id: 2, name: 'B' }]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.isRefetching).toBe(false);
  });

  it('calls create/rename/delete mutations', () => {
    const create = jest.fn();
    const rename = jest.fn();
    const del = jest.fn();

    (useAllListsQuery as jest.Mock).mockReturnValue({
      lists: [],
      isLoading: false,
      isError: false,
      isRefetching: false,
      refetch: jest.fn(),
    });
    (useRecentListsQuery as jest.Mock).mockReturnValue({
      recentLists: [],
      refetch: jest.fn(),
    });
    (useListMutations as jest.Mock).mockReturnValue({
      createM: { mutate: create },
      renameM: { mutate: rename },
      deleteM: { mutate: del },
      invalidateAll: jest.fn(),
    });

    const { result } = renderHookWithProviders(() => useListsData({ search: '', recentLimit: 3 }));

    act(() => {
      result.current.createList('X');
      result.current.renameList(1, 'Y');
      result.current.deleteList(2);
    });

    expect(create).toHaveBeenCalledWith({ name: 'X' });
    expect(rename).toHaveBeenCalledWith({ id: 1, name: 'Y' });
    expect(del).toHaveBeenCalledWith({ id: 2 });
  });

  it('refetchAll calls both refetch functions', () => {
    const refetchAll = jest.fn();
    const refetchRecent = jest.fn();

    (useAllListsQuery as jest.Mock).mockReturnValue({
      lists: [],
      isLoading: false,
      isError: false,
      isRefetching: false,
      refetch: refetchAll,
    });
    (useRecentListsQuery as jest.Mock).mockReturnValue({
      recentLists: [],
      refetch: refetchRecent,
    });
    (useListMutations as jest.Mock).mockReturnValue({
      createM: { mutate: jest.fn() },
      renameM: { mutate: jest.fn() },
      deleteM: { mutate: jest.fn() },
      invalidateAll: jest.fn(),
    });

    const { result } = renderHookWithProviders(() =>
      useListsData({ search: 'abc', recentLimit: 5 }),
    );

    act(() => {
      result.current.refetchAll();
    });

    expect(refetchAll).toHaveBeenCalled();
    expect(refetchRecent).toHaveBeenCalled();
  });
});
