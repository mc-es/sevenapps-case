import { fireEvent } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';

import PriorityBar from '@/features/tasks/components/PriorityBar';
import { renderWithProviders, resetTranslations, setTranslations, t } from '@/tests/utils';

const mockButton = jest.fn(({ title, onPress }) => (
  <Pressable accessibilityRole="button" onPress={onPress}>
    <Text>{title}</Text>
  </Pressable>
));

jest.mock('@/components', () => ({
  __esModule: true,
  Button: (props: any) => mockButton(props),
}));

describe('PriorityBar', () => {
  beforeEach(() => {
    resetTranslations();
    setTranslations({
      'global.all': 'All',
      'global.low': 'Low',
      'global.medium': 'Medium',
      'global.high': 'High',
    });
  });

  it('renders all priority tags', () => {
    const { getByText } = renderWithProviders(<PriorityBar value={null} onChange={() => {}} />);

    expect(getByText(t('global.all'))).toBeTruthy();
    expect(getByText(t('global.low'))).toBeTruthy();
    expect(getByText(t('global.medium'))).toBeTruthy();
    expect(getByText(t('global.high'))).toBeTruthy();
  });

  it('calls onChange(null) when All is pressed', () => {
    const onChange = jest.fn();
    const { getByText } = renderWithProviders(<PriorityBar value={'high'} onChange={onChange} />);

    const allBtn = getByText(t('global.all'));
    fireEvent.press ? fireEvent.press(allBtn) : allBtn.props.onClick?.();
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('selects high when pressed, toggles back to null when pressed again', () => {
    const onChange = jest.fn();

    const { getByText, rerender } = renderWithProviders(
      <PriorityBar value={null} onChange={onChange} />,
    );

    const highBtn = getByText(t('global.high'));

    fireEvent.press ? fireEvent.press(highBtn) : highBtn.props.onClick?.();
    expect(onChange).toHaveBeenCalledWith('high');

    rerender(<PriorityBar value="high" onChange={onChange} />);

    fireEvent.press ? fireEvent.press(highBtn) : highBtn.props.onClick?.();
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('calls onChange("medium") when Medium is pressed', () => {
    const onChange = jest.fn();
    const { getByText } = renderWithProviders(<PriorityBar value={null} onChange={onChange} />);

    const mediumBtn = getByText(t('global.medium'));
    fireEvent.press ? fireEvent.press(mediumBtn) : mediumBtn.props.onClick?.();
    expect(onChange).toHaveBeenCalledWith('medium');
  });
});
