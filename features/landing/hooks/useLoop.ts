import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

interface Params {
  duration?: number;
  easing?: (value: number) => number;
  delay?: number;
  autoStart?: boolean;
}

interface Response {
  value: Animated.Value;
  start: () => void;
  stop: () => void;
}

const useLoop = (props: Params): Response => {
  const {
    duration = 2000,
    easing = Easing.inOut(Easing.quad),
    delay = 0,
    autoStart = true,
  } = props;
  const value = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = (): void => {
    value.setValue(0);
    loopRef.current = Animated.loop(
      Animated.timing(value, {
        toValue: 1,
        duration,
        easing,
        useNativeDriver: true,
        isInteraction: false,
      }),
    );
    loopRef.current.start();
  };

  const stop = (): void => {
    loopRef.current?.stop?.();
    loopRef.current = null;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    if (autoStart) {
      if (delay > 0) timeoutRef.current = setTimeout(start, delay);
      else start();
    }

    return stop;
  }, [duration, easing, delay, autoStart]);

  return { value, start, stop };
};

export { useLoop };
