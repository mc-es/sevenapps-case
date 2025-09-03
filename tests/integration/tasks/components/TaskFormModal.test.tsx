import { fireEvent, waitFor } from '@testing-library/react-native';
import { Pressable, Text, TextInput } from 'react-native';

import TaskFormModal from '@/features/tasks/components/TaskFormModal';
import { renderWithProviders, resetTranslations, setTranslations, t } from '@/tests/utils';

jest.mock('@react-native-community/datetimepicker', () => {
  const { Pressable, Text } = require('react-native');
  return function MockDatePicker({ onChange, title }: any) {
    return (
      <Pressable
        testID="mockDatePicker"
        onPress={() => onChange?.(null, new Date('2025-02-03T12:00:00Z'))}
      >
        <Text>{title ?? 'picker'}</Text>
      </Pressable>
    );
  };
});

const mockButton = jest.fn(({ title, onPress, disabled }) => (
  <Pressable onPress={!disabled ? onPress : undefined} disabled={disabled}>
    <Text>{title}</Text>
  </Pressable>
));

const mockInputBox = jest.fn(({ value, onChangeText, placeholder, multiline }) => (
  <TextInput
    placeholder={placeholder}
    value={value}
    onChangeText={onChangeText}
    multiline={multiline}
  />
));

jest.mock('@/components', () => ({
  __esModule: true,
  Button: (props: any) => mockButton(props),
  InputBox: (props: any) => mockInputBox(props),
}));

describe('TaskFormModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetTranslations();
    setTranslations({
      'global.add': 'Add',
      'placeholder.newTaskTitle': 'Eg: Buy Basket',
      'global.pickDate': 'Pick Date',
      'global.high': 'High',
      'global.clear': 'Clear',
    });
  });

  it('shows warning with empty name; submits when name is provided (default priority=medium)', async () => {
    const onClose = jest.fn();
    const onSubmit = jest.fn();

    const { getByText, getByPlaceholderText } = renderWithProviders(
      <TaskFormModal visible mode="create" onClose={onClose} onSubmit={onSubmit} />,
    );

    const addBtn = getByText(t('global.add'));

    fireEvent.press(addBtn);
    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });

    const nameInput = getByPlaceholderText(t('placeholder.newTaskTitle'));
    fireEvent.changeText(nameInput, 'Silly');
    fireEvent.press(addBtn);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Silly',
        description: '',
        priority: 'medium',
        due_date: null,
      });
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('priority & date selection reflect in payload; clear due removes the date', async () => {
    const onClose = jest.fn();
    const onSubmit = jest.fn();

    resetTranslations();
    setTranslations({
      'global.add': 'Add',
      'global.high': 'High',
      'global.pickDate': 'Pick Date',
      'global.clear': 'Clear',
      'placeholder.newTaskTitle': 'Eg: Buy Basket',
    });

    const { getByText, getByPlaceholderText, getByTestId } = renderWithProviders(
      <TaskFormModal visible mode="create" onClose={onClose} onSubmit={onSubmit} />,
    );

    const highBtn = getByText(t('global.high'));
    fireEvent.press(highBtn);

    const dateBtn = getByText(t('global.pickDate'));
    fireEvent.press(dateBtn);

    const nameInput = getByPlaceholderText(t('placeholder.newTaskTitle'));
    fireEvent.changeText(nameInput, 'Silly');

    const datePicker = getByTestId('mockDatePicker');
    fireEvent.press(datePicker);

    const saveBtn = getByText(t('global.add'));
    fireEvent.press(saveBtn);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Silly',
        description: '',
        priority: 'high',
        due_date: '2025-02-03T12:00:00.000Z',
      });
      expect(onClose).toHaveBeenCalled();
    });

    const clearBtn = getByText(t('global.clear'));
    fireEvent.press(clearBtn);
  });
});
