import { act, waitFor } from '@testing-library/react-native';

import { useListMutations } from '@/features/lists/hooks/useListMutations';
import * as Queries from '@/queries';
import { renderHookWithProviders } from '@/tests/utils';

jest.mock('@/queries', () => ({
  __esModule: true,
  listsKeys: { all: ['lists'] },
  createList: jest.fn(),
  updateList: jest.fn(),
  deleteList: jest.fn(),
}));

const createList = Queries.createList as jest.MockedFunction<typeof Queries.createList>;
const updateList = Queries.updateList as jest.MockedFunction<typeof Queries.updateList>;
const deleteList = Queries.deleteList as jest.MockedFunction<typeof Queries.deleteList>;

describe('useListMutations', () => {
  it('createM calls createList and becomes success', async () => {
    const { result } = renderHookWithProviders(() => useListMutations(5));

    act(() => {
      result.current.createM.mutate({ name: 'X' });
    });

    await waitFor(() => expect(result.current.createM.isSuccess).toBe(true));
    expect(createList).toHaveBeenCalledWith({ name: 'X' });
  });

  it('renameM calls updateList and becomes success', async () => {
    const { result } = renderHookWithProviders(() => useListMutations(5));

    act(() => {
      result.current.renameM.mutate({ id: 1, name: 'Y' });
    });

    await waitFor(() => expect(result.current.renameM.isSuccess).toBe(true));
    expect(updateList).toHaveBeenCalledWith({ id: 1, name: 'Y' });
  });

  it('deleteM calls deleteList and becomes success', async () => {
    const { result } = renderHookWithProviders(() => useListMutations(5));

    act(() => {
      result.current.deleteM.mutate({ id: 2 });
    });

    await waitFor(() => expect(result.current.deleteM.isSuccess).toBe(true));
    expect(deleteList).toHaveBeenCalledWith({ id: 2 });
  });
});
