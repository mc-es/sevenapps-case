import { memo, useCallback } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/components';

interface Props {
  title: string;
  subtitle: string;
  onPress: () => void;
  colors?: readonly [string, string, ...string[]];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

type OptionalProps = Omit<Props, 'title' | 'subtitle' | 'onPress'>;
const defaults: Required<OptionalProps> = {
  colors: ['#111827', '#0b1220'],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
};

const CTA = (props: Props) => {
  const { title, subtitle, onPress, colors, start, end } = { ...defaults, ...props };
  const handlePress = useCallback(() => {
    onPress?.();
  }, [onPress]);

  return (
    <View className={styles.container}>
      <Button
        title={title}
        onPress={handlePress}
        variant="solid"
        size="sm"
        colors={colors}
        start={start}
        end={end}
        contentClassName={styles.gradient}
      />
      {!!subtitle && (
        <View className={styles.subtitleWrap}>
          <Text className={styles.subtitle}>{subtitle}</Text>
        </View>
      )}
    </View>
  );
};

export default memo(CTA);

const styles = {
  container: 'px-6',
  gradient: 'py-1',
  subtitleWrap: 'mt-3 items-center',
  subtitle: 'text-xs text-white/70',
} as const;
