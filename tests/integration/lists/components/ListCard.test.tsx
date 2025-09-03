import { fireEvent } from '@testing-library/react-native';

import ListCard from '@/features/lists/components/ListCard';
import { resetTranslations, setTranslations, t } from '@/tests/utils';
import { renderWithProviders } from '@/tests/utils/render';
import { Pressable, Text } from 'react-native';

const mockButton = jest.fn(({ title, onPress }) => (
  <Pressable accessibilityRole="button" onPress={onPress}>
    <Text>{title}</Text>
  </Pressable>
));
jest.mock('@/components', () => ({
  __esModule: true,
  Button: (props: any) => mockButton(props),
}));

describe('ListCard', () => {
  const baseItem = {
    id: 1,
    name: 'Market',
    created_at: new Date('2025-01-01T10:00:00Z').toISOString(),
    updated_at: new Date('2025-01-01T10:00:00Z').toISOString(),
  };

  beforeEach(() => {
    resetTranslations();
    setTranslations({
      'global.creation': 'Creation',
      'global.delete': 'Delete',
    });
  });

  it('renders the name and creation date', () => {
    const { getByText } = renderWithProviders(<ListCard item={baseItem} />);

    const creationLabel = t('global.creation');
    const pattern = new RegExp(`${creationLabel}\\s*:\\s*01\\.01\\.2025 10:00`);

    expect(getByText(baseItem.name)).toBeTruthy();
    expect(getByText(pattern)).toBeTruthy();
  });

  it('calls onDelete when the Delete button is pressed', () => {
    const onDelete = jest.fn();
    const { getByText } = renderWithProviders(<ListCard item={baseItem} onDelete={onDelete} />);

    const del = getByText(t('global.delete'));
    fireEvent.press ? fireEvent.press(del) : del.props.onClick();
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('calls onLongPress when the card is long-pressed', () => {
    const onLongPress = jest.fn();
    const { getByText } = renderWithProviders(
      <ListCard item={baseItem} onLongPress={onLongPress} />,
    );

    const name = getByText(baseItem.name);
    fireEvent(name, 'longPress');
    expect(onLongPress).toHaveBeenCalledTimes(1);
  });
});
