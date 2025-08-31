import type { PropsWithChildren } from 'react';
import { memo } from 'react';
import { Animated, Easing } from 'react-native';

import { useLoop } from '../hooks/useLoop';

interface FloatingProps {
  delay?: number;
  distance?: number;
  duration?: number;
}

const defaults: Required<FloatingProps> = {
  delay: 0,
  distance: 8,
  duration: 1800,
};

const Floating = (props: PropsWithChildren<FloatingProps>) => {
  const { children, delay, distance, duration } = { ...defaults, ...props };
  const { value } = useLoop({
    duration,
    delay,
    easing: Easing.inOut(Easing.sin),
  });

  const translateY = value.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -distance, 0],
  });

  return (
    <Animated.View pointerEvents="box-none" style={{ transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
};

export default memo(Floating);
