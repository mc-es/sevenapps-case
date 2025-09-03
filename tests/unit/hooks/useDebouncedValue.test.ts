import { act, renderHook } from '@testing-library/react-native';

import { useDebouncedValue } from '@/hooks/useDebouncedValue';

describe('useDebouncedValue', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('A', 500));
    expect(result.current).toBe('A');
  });

  it('keeps old value until delay has passed', () => {
    const { result, rerender } = renderHook<string, { val: string }>(
      ({ val }) => useDebouncedValue(val, 500),
      { initialProps: { val: 'A' } },
    );

    rerender({ val: 'B' });
    expect(result.current).toBe('A');

    act(() => {
      jest.advanceTimersByTime(400);
    });
    expect(result.current).toBe('A');
  });

  it('updates value after delay', () => {
    const { result, rerender } = renderHook<string, { val: string }>(
      ({ val }) => useDebouncedValue(val, 500),
      { initialProps: { val: 'A' } },
    );

    rerender({ val: 'B' });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe('B');
  });

  it('resets timer if value changes again before delay', () => {
    const { result, rerender } = renderHook<string, { val: string }>(
      ({ val }) => useDebouncedValue(val, 500),
      { initialProps: { val: 'A' } },
    );

    rerender({ val: 'B' });
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current).toBe('A');

    rerender({ val: 'C' });
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe('C');
  });
});
