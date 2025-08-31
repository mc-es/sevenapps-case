import { useMemo } from 'react';
import { Easing } from 'react-native';

import { useLoop } from './useLoop';

interface UsePulseProps {
  from?: number;
  to?: number;
  duration?: number;
}

const defaults: Required<UsePulseProps> = {
  from: 0.94,
  to: 1.06,
  duration: 2000,
};

const usePulse = (props: UsePulseProps) => {
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
