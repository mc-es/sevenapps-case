import { useMemo } from 'react';
import type { Animated } from 'react-native';
import { Easing } from 'react-native';

import { useLoop } from './useLoop';

interface Params {
  from?: number;
  to?: number;
  duration?: number;
}

interface Response {
  scale: Animated.AnimatedInterpolation<string | number>;
  opacity: Animated.AnimatedInterpolation<string | number>;
}

const defaults: Required<Params> = {
  from: 0.94,
  to: 1.06,
  duration: 2000,
};

const usePulse = (props: Params): Response => {
  const { from, to, duration } = { ...defaults, ...props };
  const { value } = useLoop({ duration, easing: Easing.inOut(Easing.quad) });

  const ranges = useMemo(
    () => ({
      scale: value.interpolate({ inputRange: [0, 0.5, 1], outputRange: [from, to, from] }),
      opacity: value.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.9, 1, 0.9] }),
    }),
    [value, from, to],
  );

  return ranges;
};

export { usePulse };
