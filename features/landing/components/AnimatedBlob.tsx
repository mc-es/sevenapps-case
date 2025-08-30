import { LinearGradient } from 'expo-linear-gradient';
import { memo, useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

type ColorTuple = readonly [string, string, ...string[]];

type AnimatedBlobProps = {
  size?: number;
  colors: ColorTuple;
  initial: { top: number; left: number };
  drift: { x: number; y: number };
  delay?: number;
  duration?: number;
};

const AnimatedBlob = ({
  size = 220,
  colors,
  initial,
  drift,
  delay = 0,
  duration = 6500,
}: AnimatedBlobProps) => {
  const v = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const start = () => {
      v.setValue(0);
      loopRef.current = Animated.loop(
        Animated.timing(v, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
          isInteraction: false,
        }),
      );
      loopRef.current.start();
    };

    if (delay > 0) timeoutRef.current = setTimeout(start, delay);
    else start();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      loopRef.current?.stop?.();
      loopRef.current = null;
    };
  }, [delay, duration, v]);

  const translateX = v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, drift.x, 0] });
  const translateY = v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -drift.y, 0] });
  const opacity = v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.75, 1, 0.75] });

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
