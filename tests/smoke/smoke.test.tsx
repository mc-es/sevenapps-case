import { act, fireEvent, render } from '@testing-library/react-native';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

jest.useFakeTimers();

function Demo() {
  const [count, setCount] = useState(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setTimeout(() => setTick((t) => t + 1), 300);
    return () => clearTimeout(id);
  }, [count]);

  return (
    <View>
      <Text accessibilityRole="header">Hello Test</Text>
      <Text testID="count">Count: {count}</Text>
      <Text testID="tick">Tick: {tick}</Text>
      <Pressable accessibilityRole="button" onPress={() => setCount((c) => c + 1)}>
        <Text>Increase</Text>
      </Pressable>
    </View>
  );
}

describe('Smoke test', () => {
  it('renders, handles press, and advances timers', () => {
    const { getByText, getByTestId } = render(<Demo />);

    expect(getByText('Hello Test')).toBeTruthy();
    expect(getByTestId('count')).toHaveTextContent('Count: 0');
    expect(getByTestId('tick')).toHaveTextContent('Tick: 0');

    fireEvent.press(getByText('Increase'));
    expect(getByTestId('count')).toHaveTextContent('Count: 1');

    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(getByTestId('tick')).toHaveTextContent('Tick: 1');
  });
});
