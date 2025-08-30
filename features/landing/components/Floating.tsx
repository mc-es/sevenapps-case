import React, { memo, useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

interface FloatingProps {
  delay?: number;
  distance?: number;
  duration?: number;
  children: React.ReactNode;
  className?: string;
}

const Floating = ({
  delay = 0,
  distance = 8,
  duration = 1800,
  children,
  className,
}: FloatingProps) => {
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
          easing: Easing.inOut(Easing.sin),
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

  const translateY = v.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -distance, 0],
  });

  return (
    <Animated.View
      pointerEvents="box-none"
      className={className}
      style={{ transform: [{ translateY }] }}
    >
      {children}
    </Animated.View>
  );
};

export default memo(Floating);
