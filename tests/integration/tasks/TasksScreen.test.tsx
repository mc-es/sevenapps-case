import { useTasksData } from '@/features/tasks/hooks';
import TasksScreen from '@/features/tasks/screens/TasksScreen';
import { renderWithProviders, resetTranslations, setTranslations, t } from '@/tests/utils';

jest.mock('@/queries', () => ({
  __esModule: true,
  listsKeys: { all: ['lists'] },
  getListById: jest.fn().mockResolvedValue({ id: 1, name: 'My List' }),
}));

jest.mock('@/components', () => {
  const { Pressable, Text, View } = require('react-native');

  return {
    __esModule: true,
    Container: ({ children }: any) => <>{children}</>,
    GradientBackground: () => null,
    Button: ({ title, onPress }: any) => (
      <Pressable accessibilityRole="button" onPress={onPress}>
        <Text>{title}</Text>
      </Pressable>
    ),
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

jest.mock('@/features/tasks/hooks', () => ({
  __esModule: true,
  useTasksData: jest.fn(),
}));

describe('TasksScreen', () => {
  beforeEach(() => {
    resetTranslations();
    setTranslations({
      'error.invalidId': 'Invalid Id',
    });

    (useTasksData as jest.Mock).mockImplementation(() => ({
      displayTasks: [],
      completedCount: 0,
      isAnyLoading: false,
      isAnyError: false,
      isRefetching: false,
      toggleTask: jest.fn(),
      createTask: jest.fn(),
      editTask: jest.fn(),
      deleteTask: jest.fn(),
      setTaskStatus: jest.fn(),
      refetchAll: jest.fn(),
    }));
  });

  it('shows invalid id message when route id is missing', () => {
    const { getByText } = renderWithProviders(<TasksScreen />);
    expect(getByText(t('error.invalidId'))).toBeTruthy();
  });
});
