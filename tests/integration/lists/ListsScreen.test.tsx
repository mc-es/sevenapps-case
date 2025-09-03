import { fireEvent, waitFor } from '@testing-library/react-native';

import { useListsData } from '@/features/lists/hooks';
import ListsScreen from '@/features/lists/screens/ListsScreen';
import { renderWithProviders, resetTranslations, setTranslations, t } from '@/tests/utils';

const createListMock = jest.fn();
const renameListMock = jest.fn();
const deleteListMock = jest.fn();
const refetchAllMock = jest.fn();

jest.mock('@/features/lists/hooks', () => ({
  useListsData: jest.fn(),
}));

const mockBump = jest.fn();
const mockReset = jest.fn();

jest.mock('@/store', () => ({
  useHydrated: () => true,
  useStore: (sel: any) =>
    sel({
      nextListCounter: 1,
      bump: mockBump,
      reset: mockReset,
    }),
}));

jest.mock('@/components', () => {
  const { Pressable, Text, TextInput, View } = require('react-native');

  return {
    __esModule: true,
    Container: ({ children }: any) => <>{children}</>,
    GradientBackground: () => null,
    Button: ({ title, onPress }: any) => (
      <Pressable accessibilityRole="button" onPress={onPress}>
        <Text>{title}</Text>
      </Pressable>
    ),
    InputBox: ({ value, onChangeText, placeholder }: any) => (
      <TextInput placeholder={placeholder} value={value} onChangeText={onChangeText} />
    ),
    BottomSheet: ({ visible, title, actions, onClose, closeLabel }: any) =>
      visible ? (
        <View>
          <Text>{title}</Text>
          {actions?.map((a: any) => (
            <Pressable key={a.key} accessibilityRole="button" onPress={a.onPress}>
              <Text>{a.label}</Text>
            </Pressable>
          ))}
          <Pressable accessibilityRole="button" onPress={onClose}>
            <Text>{closeLabel}</Text>
          </Pressable>
        </View>
      ) : null,
    ConfirmDialog: ({
      visible,
      title,
      message,
      onConfirm,
      onCancel,
      cancelLabel,
      confirmLabel,
      cancelText,
      confirmText,
    }: any) =>
      visible ? (
        <View>
          <Text>{title}</Text>
          <Text>{message}</Text>
          <Pressable accessibilityRole="button" onPress={onCancel}>
            <Text>{cancelText ?? cancelLabel ?? 'Cancel'}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={onConfirm}>
            <Text>{confirmText ?? confirmLabel ?? 'OK'}</Text>
          </Pressable>
        </View>
      ) : null,
  };
});

describe('ListsScreen', () => {
  beforeEach(() => {
    resetTranslations();
    setTranslations({
      'loading.lists': 'Lists are loading...',
      'error.tryAgain': 'Try Again',
      'lists.recentListTitle': 'Recently Created',
      'global.rename': 'Rename',
      'global.save': 'Save',
      'global.add': 'Add',
      'lists.addToListBtn': 'Add List',
      'placeholder.newName': 'New Name',
      'placeholder.searchList': 'Search List',
    });
  });

  it('display loading and error states; retry triggers refetchAll', () => {
    (useListsData as jest.Mock).mockReturnValue({
      lists: [],
      recentLists: [],
      isLoading: true,
      isError: false,
      isRefetching: false,
      refetchAll: refetchAllMock,
      createList: createListMock,
      renameList: renameListMock,
      deleteList: deleteListMock,
    });

    const { getByText, rerender } = renderWithProviders(<ListsScreen />);
    expect(getByText(t('loading.lists'))).toBeTruthy();

    (useListsData as jest.Mock).mockReturnValue({
      lists: [],
      recentLists: [],
      isLoading: false,
      isError: true,
      isRefetching: false,
      refetchAll: refetchAllMock,
      createList: createListMock,
      renameList: renameListMock,
      deleteList: deleteListMock,
    });
    rerender(<ListsScreen />);

    const retry = getByText(t('error.tryAgain'));
    retry.props?.onClick ? retry.props.onClick() : fireEvent.press(retry);
    expect(refetchAllMock).toHaveBeenCalledTimes(1);
  });

  it('show Recent strip when search is empty; hides it when search has text', () => {
    (useListsData as jest.Mock).mockReturnValue({
      lists: [{ id: 1, name: 'Shopping List' }],
      recentLists: [{ id: 2, name: 'Todos' }],
      isLoading: false,
      isError: false,
      isRefetching: false,
      refetchAll: refetchAllMock,
      createList: createListMock,
      renameList: renameListMock,
      deleteList: deleteListMock,
    });

    const { getByText, getByPlaceholderText, queryByText, rerender } = renderWithProviders(
      <ListsScreen />,
    );

    expect(getByText(t('lists.recentListTitle'))).toBeTruthy();

    const input = getByPlaceholderText(t('placeholder.searchList'));
    fireEvent.changeText(input, 'mar');

    rerender(<ListsScreen />);
    expect(queryByText(t('lists.recentListTitle'))).toBeNull();
  });

  it('calls createList and bump when adding from Header or ListBody', () => {
    (useListsData as jest.Mock).mockReturnValue({
      lists: [],
      recentLists: [],
      isLoading: false,
      isError: false,
      isRefetching: false,
      refetchAll: refetchAllMock,
      createList: createListMock,
      renameList: renameListMock,
      deleteList: deleteListMock,
    });

    const { getByText } = renderWithProviders(<ListsScreen />);

    const headerAdd = getByText(`${t('global.add')} +`);
    headerAdd.props?.onClick ? headerAdd.props.onClick() : fireEvent.press(headerAdd);

    const bodyAdd = getByText(`+ ${t('lists.addToListBtn')}`);
    bodyAdd.props?.onClick ? bodyAdd.props.onClick() : fireEvent.press(bodyAdd);

    expect(createListMock).toHaveBeenCalledTimes(2);
    expect(mockBump).toHaveBeenCalledTimes(2);
  });

  it('opens BottomSheet via long-press, renames via RenameModal, and calls renameList', async () => {
    (useListsData as jest.Mock).mockReturnValue({
      lists: [{ id: 5, name: 'Dummy' }],
      recentLists: [],
      isLoading: false,
      isError: false,
      isRefetching: false,
      refetchAll: refetchAllMock,
      createList: createListMock,
      renameList: renameListMock,
      deleteList: deleteListMock,
    });

    const { getByText, getByPlaceholderText } = renderWithProviders(<ListsScreen />);

    const listTitle = getByText('Dummy');
    fireEvent(listTitle, 'longPress');

    const renameAction = getByText(t('global.rename'));
    fireEvent.press(renameAction);

    const nameInput = getByPlaceholderText(t('placeholder.newName'));
    fireEvent.changeText(nameInput, 'Silly');

    const saveBtn = getByText(t('global.save'));
    fireEvent.press(saveBtn);

    await waitFor(() => {
      expect(renameListMock).toHaveBeenCalledWith(5, 'Silly');
    });
  });
});
