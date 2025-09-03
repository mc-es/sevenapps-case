import { fireEvent } from '@testing-library/react-native';
import { Pressable, Text, TextInput } from 'react-native';

import Header from '@/features/lists/components/Header';
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
      'lists.subTitle': 'Welcome Back',
      'lists.title': 'Your Lists',
      'placeholder.searchList': 'Search List',
      'global.add': 'Add',
    });
  });

  it('renders titles and search placeholder', () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <Header search="" onChangeSearch={() => {}} onAdd={() => {}} />,
    );

    expect(getByText(t('lists.subTitle'))).toBeTruthy();
    expect(getByText(t('lists.title'))).toBeTruthy();
    expect(getByPlaceholderText(t('placeholder.searchList'))).toBeTruthy();
  });

  it('calls onChangeSearch when the search input changes', () => {
    const onChangeSearch = jest.fn();
    const { getByPlaceholderText } = renderWithProviders(
      <Header search="" onChangeSearch={onChangeSearch} onAdd={() => {}} />,
    );

    const input = getByPlaceholderText(t('placeholder.searchList'));
    fireEvent.changeText(input, 'mar');
    expect(onChangeSearch).toHaveBeenCalledWith('mar');
  });

  it('calls onAdd when pressing the "Add" button, but not when disabled', () => {
    const onAdd = jest.fn();
    const { getByText, rerender } = renderWithProviders(
      <Header search="" onChangeSearch={() => {}} onAdd={onAdd} />,
    );

    const label = `${t('global.add')} +`;
    const addBtn = getByText(label);
    fireEvent.press ? fireEvent.press(addBtn) : addBtn.props.onClick();
    expect(onAdd).toHaveBeenCalledTimes(1);

    rerender(<Header search="" onChangeSearch={() => {}} onAdd={onAdd} isDisabled />);

    const addBtnDisabled = getByText(label);
    fireEvent.press ? fireEvent.press(addBtnDisabled) : addBtnDisabled.props.onClick?.();
    expect(onAdd).toHaveBeenCalledTimes(1);
  });
});
