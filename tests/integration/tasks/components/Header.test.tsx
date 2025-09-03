import { fireEvent } from '@testing-library/react-native';
import { Pressable, Text, TextInput } from 'react-native';

import Header from '@/features/tasks/components/Header';
import { renderWithProviders, resetTranslations, setTranslations, t } from '@/tests/utils';

const mockButton = jest.fn(({ title, onPress }) => (
  <Pressable accessibilityRole="button" onPress={onPress}>
    <Text>{title}</Text>
  </Pressable>
));
const mockInputBox = jest.fn(({ value, onChangeText, placeholder }) => (
  <TextInput placeholder={placeholder} value={value} onChangeText={onChangeText} />
));

jest.mock('@/components', () => ({
  __esModule: true,
  Button: (props: any) => mockButton(props),
  InputBox: (props: any) => mockInputBox(props),
}));

describe('Header', () => {
  beforeEach(() => {
    resetTranslations();
    setTranslations({
      'global.all': 'All',
      'global.upcoming': 'Upcoming',
      'global.completed': 'Completed',
      'placeholder.searchTask': 'Search Task',
    });
  });

  it('renders title, tab labels and search placeholder', () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <Header
        title="Task Header"
        tab="all"
        onChangeTab={() => {}}
        search=""
        onChangeSearch={() => {}}
      />,
    );

    expect(getByText('Task Header')).toBeTruthy();
    expect(getByText(t('global.all'))).toBeTruthy();
    expect(getByText(t('global.upcoming'))).toBeTruthy();
    expect(getByText(t('global.completed'))).toBeTruthy();
    expect(getByPlaceholderText(t('placeholder.searchTask'))).toBeTruthy();
  });

  it('calls onChangeTab with correct key when tabs are pressed', () => {
    const onChangeTab = jest.fn();

    const { getByText, rerender } = renderWithProviders(
      <Header title="X" tab="all" onChangeTab={onChangeTab} search="" onChangeSearch={() => {}} />,
    );

    const upcomingBtn = getByText(t('global.upcoming'));
    fireEvent.press ? fireEvent.press(upcomingBtn) : upcomingBtn.props.onClick?.();
    expect(onChangeTab).toHaveBeenCalledWith('upcoming');

    rerender(
      <Header
        title="X"
        tab="upcoming"
        onChangeTab={onChangeTab}
        search=""
        onChangeSearch={() => {}}
      />,
    );

    const completedBtn = getByText(t('global.completed'));
    fireEvent.press ? fireEvent.press(completedBtn) : completedBtn.props.onClick?.();
    expect(onChangeTab).toHaveBeenCalledWith('completed');
  });

  it('calls onChangeSearch when search input changes', () => {
    const onChangeSearch = jest.fn();

    const { getByPlaceholderText } = renderWithProviders(
      <Header
        title="X"
        tab="all"
        onChangeTab={() => {}}
        search=""
        onChangeSearch={onChangeSearch}
      />,
    );

    const input = getByPlaceholderText(t('placeholder.searchTask'));
    fireEvent.changeText(input, 'Silly');

    expect(onChangeSearch).toHaveBeenCalledWith('Silly');
  });
});
