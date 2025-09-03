import { act, renderHook } from '@testing-library/react-native';
import { Animated } from 'react-native';

import { useLoop } from '@/features/landing/hooks/useLoop';

describe('useLoop', () => {
  let loopObj: { start: jest.Mock; stop: jest.Mock };
  let loopSpy: jest.SpyInstance;
  let timingSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();

    loopObj = { start: jest.fn(), stop: jest.fn() };
    loopSpy = jest.spyOn(Animated as any, 'loop').mockImplementation(() => loopObj);
    timingSpy = jest
      .spyOn(Animated as any, 'timing')
      .mockImplementation(() => ({ start: jest.fn(), stop: jest.fn() }));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('auto-starts immediately when delay=0', () => {
    renderHook(() => useLoop({ autoStart: true, delay: 0, duration: 500 }));
    expect(loopObj.start).toHaveBeenCalledTimes(1);
    expect(loopSpy).toHaveBeenCalledTimes(1);
    expect(timingSpy).toHaveBeenCalledTimes(1);
  });

  it('starts after the specified delay', () => {
    renderHook(() => useLoop({ autoStart: true, delay: 200, duration: 500 }));

    expect(loopObj.start).not.toHaveBeenCalled();
    act(() => jest.advanceTimersByTime(199));
    expect(loopObj.start).not.toHaveBeenCalled();
    act(() => jest.advanceTimersByTime(1));
    expect(loopObj.start).toHaveBeenCalledTimes(1);
  });

  it('stop() cancels a pending delayed start', () => {
    const { result } = renderHook(() => useLoop({ autoStart: true, delay: 200 }));
    act(() => {
      result.current.stop();
      jest.advanceTimersByTime(1000);
    });
    expect(loopObj.start).not.toHaveBeenCalled();
    expect(loopObj.stop).not.toHaveBeenCalled();
  });

  it('stop() stops an already-started loop', () => {
    const { result } = renderHook(() => useLoop({ autoStart: true, delay: 0 }));
    expect(loopObj.start).toHaveBeenCalledTimes(1);
    act(() => result.current.stop());
    expect(loopObj.stop).toHaveBeenCalledTimes(1);
  });

  it('start() resets value to 0 and begins the loop', () => {
    const { result } = renderHook(() => useLoop({ autoStart: false }));
    const setValue = jest.spyOn(result.current.value, 'setValue');

    act(() => result.current.start());

    expect(setValue).toHaveBeenCalledWith(0);
    expect(loopSpy).toHaveBeenCalledTimes(1);
    expect(timingSpy).toHaveBeenCalledTimes(1);
    expect(loopObj.start).toHaveBeenCalledTimes(1);
  });

  it('unmount calls stop() if loop started', () => {
    const { unmount } = renderHook(() => useLoop({ autoStart: true, delay: 0 }));
    expect(loopObj.start).toHaveBeenCalledTimes(1);
    unmount();
    expect(loopObj.stop).toHaveBeenCalledTimes(1);
  });

  it('does not auto-start when autoStart=false', () => {
    renderHook(() => useLoop({ autoStart: false }));
    expect(loopObj.start).not.toHaveBeenCalled();
  });
});
