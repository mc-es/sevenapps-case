import { Easing } from 'react-native';
import useLoop from './useLoop';

const usePulse = ({ from = 0.94, to = 1.06, duration = 2000 }) => {
  const v = useLoop(duration, Easing.inOut(Easing.quad));
  const scale = v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [from, to, from] });
  const opacity = v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.9, 1, 0.9] });

  return { scale, opacity };
};

export default usePulse;
