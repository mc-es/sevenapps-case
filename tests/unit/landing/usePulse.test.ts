import { renderHook } from '@testing-library/react-native';

import { useLoop } from '@/features/landing/hooks/useLoop';
import { usePulse } from '@/features/landing/hooks/usePulse';

let mockInterpolate: jest.Mock;

jest.mock('@/features/landing/hooks/useLoop', () => {
  mockInterpolate = jest.fn();
  const mockValue = { interpolate: mockInterpolate };

  const useLoop = jest.fn(() => ({
    value: mockValue,
    start: jest.fn(),
    stop: jest.fn(),
  }));

  return { __esModule: true, useLoop };
});

describe('usePulse', () => {
  it('builds scale & opacity ranges when custom from/to/duration are provided', () => {
    const scaleResult = { scale: true };
    const opacityResult = { opacity: true };

    mockInterpolate.mockReturnValueOnce(scaleResult).mockReturnValueOnce(opacityResult);

    const { result } = renderHook(() => usePulse({ from: 0.9, to: 1.1, duration: 1500 }));

    expect((useLoop as jest.Mock).mock.calls[0][0].duration).toBe(1500);
    expect(mockInterpolate).toHaveBeenNthCalledWith(1, {
      inputRange: [0, 0.5, 1],
      outputRange: [0.9, 1.1, 0.9],
    });
    expect(mockInterpolate).toHaveBeenNthCalledWith(2, {
      inputRange: [0, 0.5, 1],
      outputRange: [0.9, 1, 0.9],
    });

    expect(result.current.scale).toBe(scaleResult);
    expect(result.current.opacity).toBe(opacityResult);
  });

  it('uses default values when no parameters are provided', () => {
    const scaleResult = { scale: 'default' };
    const opacityResult = { opacity: 'default' };
    mockInterpolate.mockReturnValueOnce(scaleResult).mockReturnValueOnce(opacityResult);

    const { result } = renderHook(() => usePulse({}));

    expect((useLoop as jest.Mock).mock.calls[0][0].duration).toBe(2000);
    expect(mockInterpolate).toHaveBeenNthCalledWith(1, {
      inputRange: [0, 0.5, 1],
      outputRange: [0.94, 1.06, 0.94],
    });
    expect(mockInterpolate).toHaveBeenNthCalledWith(2, {
      inputRange: [0, 0.5, 1],
      outputRange: [0.9, 1, 0.9],
    });

    expect(result.current.scale).toBe(scaleResult);
    expect(result.current.opacity).toBe(opacityResult);
  });
});
