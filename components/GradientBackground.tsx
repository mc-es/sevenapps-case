import { LinearGradient } from 'expo-linear-gradient';
import { memo } from 'react';
import { StyleSheet } from 'react-native';

type ColorTuple = readonly [string, string, ...string[]];
type LocationTuple = readonly [number, number, ...number[]];

interface Props {
  colors?: ColorTuple;
  locations?: LocationTuple;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  className?: string;
}

const GradientBackground = (props: Props) => {
  const {
    colors = ['#0ea5e9', '#8b5cf6', '#111827'],
    locations = [0, 0.6, 1],
    start = { x: 0, y: 0 },
    end = { x: 1, y: 1 },
    className,
  } = props;

  return (
    <LinearGradient
      colors={colors}
      locations={locations}
      start={start}
      end={end}
      style={StyleSheet.absoluteFillObject}
      className={className}
      pointerEvents="none"
    />
  );
};

export default memo(GradientBackground);
