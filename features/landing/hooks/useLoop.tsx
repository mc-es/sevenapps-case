import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

const useLoop = (duration = 2000, easing = Easing.inOut(Easing.quad)) => {
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(v, {
        toValue: 1,
        duration,
        easing,
        useNativeDriver: true,
        isInteraction: false,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [v, duration, easing]);

  return v;
};

export default useLoop;
