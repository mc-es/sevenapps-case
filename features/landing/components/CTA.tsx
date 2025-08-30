import { cn } from '@/libs/cn';
import { LinearGradient } from 'expo-linear-gradient';
import { memo, useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ColorTuple = readonly [string, string, ...string[]];

interface CTAProps {
  title: string;
  subtitle: string;
  onPress: () => void;
  colors?: ColorTuple;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  containerClassName?: string;
  buttonClassName?: string;
  gradientClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

const CTA = ({
  title,
  subtitle,
  onPress,
  colors = ['#111827', '#0b1220'],
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  containerClassName,
  buttonClassName,
  gradientClassName,
  titleClassName,
  subtitleClassName,
}: CTAProps) => {
  const insets = useSafeAreaInsets();

  const handlePress = useCallback(() => {
    onPress?.();
  }, [onPress]);

  return (
    <View
      className={cn(styles.container, containerClassName)}
      style={{ paddingBottom: insets.bottom + 12 }}
    >
      <Pressable
        onPress={handlePress}
        className={cn(styles.button, buttonClassName)}
        style={({ pressed }) => [{ opacity: pressed ? 0.96 : 1 }]}
        accessibilityRole="button"
        accessibilityLabel={title}
      >
        <LinearGradient
          colors={colors}
          start={start}
          end={end}
          className={cn(styles.gradient, gradientClassName)}
        >
          <Text className={cn(styles.title, titleClassName)}>{title}</Text>
        </LinearGradient>
      </Pressable>
      {!!subtitle && (
        <View className={styles.subtitleWrap}>
          <Text className={cn(styles.subtitle, subtitleClassName)}>{subtitle}</Text>
        </View>
      )}
    </View>
  );
};

export default memo(CTA);

const styles = {
  container: 'px-6',
  button: 'overflow-hidden rounded-2xl',
  gradient: 'items-center px-4 py-3',
  title: 'font-bold text-white',
  subtitleWrap: 'mt-3 items-center',
  subtitle: 'text-xs text-white/70',
} as const;
