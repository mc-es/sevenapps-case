import { fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';

import Footer from '@/features/landing/components/Footer';
import { renderWithProviders } from '@/tests/utils';

const mockButton = jest.fn(({ title, onPress }: any) => <Text onPress={onPress}>{title}</Text>);
jest.mock('@/components', () => ({
  __esModule: true,
  Button: (props: any) => mockButton(props),
}));

describe('Footer', () => {
  it('calls onPress when the button is pressed and reveals the subtitle', () => {
    const onPress = jest.fn();

    const { getByText } = renderWithProviders(
      <Footer title="Start" subtitle="Muted text" onPress={onPress} />,
    );

    const btnText = getByText('Start');
    fireEvent.press(btnText);

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(getByText('Muted text')).toBeTruthy();
    expect(mockButton).toHaveBeenCalled();
  });

  it('does not render subtitle when it is empty/undefined', () => {
    const { queryByText, rerender } = renderWithProviders(
      <Footer title="Start" subtitle="" onPress={() => {}} />,
    );
    expect(queryByText('Muted text')).toBeNull();

    rerender(<Footer title="Start" subtitle={undefined as any} onPress={() => {}} />);
    expect(queryByText('Muted text')).toBeNull();
  });

  it('forwards expected props to Button (variant, size, gradient, etc.)', () => {
    renderWithProviders(<Footer title="Start" subtitle="Muted text" onPress={() => {}} />);

    const passedProps = mockButton.mock.calls[0][0];

    expect(passedProps).toEqual(
      expect.objectContaining({
        title: 'Start',
        variant: 'solid',
        size: 'sm',
        colors: ['#111827', '#0b1220'],
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
        contentClassName: 'py-1',
      }),
    );

    expect(typeof passedProps.onPress).toBe('function');
  });
});
