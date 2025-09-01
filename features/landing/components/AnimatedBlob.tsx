import { LinearGradient } from 'expo-linear-gradient';
import { memo } from 'react';
import { Animated } from 'react-native';

import { useLoop } from '../hooks';

interface Props {
  size: number;
  colors: readonly [string, string, ...string[]];
  initial: { top: number; left: number };
  drift: { x: number; y: number };
  delay?: number;
  duration?: number;
}

const defaults: Required<Pick<Props, 'delay' | 'duration'>> = {
  delay: 0,
  duration: 6500,
};

const AnimatedBlob = (props: Props) => {
  const { size, colors, initial, drift, delay, duration } = { ...defaults, ...props };
  const { value } = useLoop({ duration, delay });

  const translateX = value.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, drift.x, 0] });
  const translateY = value.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -drift.y, 0] });
  const opacity = value.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.75, 1, 0.75] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: initial.top,
        left: initial.left,
        width: size,
        height: size,
        opacity,
        transform: [{ translateX }, { translateY }],
        borderRadius: size / 1.8,
        overflow: 'hidden',
      }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ width: '100%', height: '100%' }}
      />
    </Animated.View>
  );
};

export default memo(AnimatedBlob);
