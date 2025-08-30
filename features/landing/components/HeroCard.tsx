import { cn } from '@/libs/cn';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { memo, type ComponentProps } from 'react';
import { Animated, Text, View } from 'react-native';
import usePulse from '../hooks/usePulse';

interface HeroCardProps {
  title: string;
  subtitle: string;
  badges?: string[];
  iconName?: ComponentProps<typeof Ionicons>['name'];
  iconColor?: string;
  iconSize?: number;
  blurIntensity?: number;
  blurTint?: 'light' | 'dark' | 'default';
  rootClassName?: string;
  cardClassName?: string;
  contentClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  badgePillClassName?: string;
  badgeTextClassName?: string;
}

const HeroCard = ({
  title,
  subtitle,
  badges = ['Hızlı', 'Basit', 'Akıcı'],
  iconName = 'checkmark-done-circle',
  iconColor = '#10b981',
  iconSize = 84,
  blurIntensity = 50,
  blurTint = 'light',
  rootClassName,
  cardClassName,
  contentClassName,
  titleClassName,
  subtitleClassName,
  badgePillClassName,
  badgeTextClassName,
}: HeroCardProps) => {
  const pulse = usePulse({});

  return (
    <Animated.View
      className={rootClassName}
      style={{ transform: [{ scale: pulse.scale }], opacity: pulse.opacity }}
      accessibilityRole="summary"
      accessibilityLabel={title}
      pointerEvents="box-none"
    >
      <BlurView
        intensity={blurIntensity}
        tint={blurTint}
        className={cn(styles.card, cardClassName)}
      >
        <View className={cn(styles.content, contentClassName)}>
          <Ionicons name={iconName} size={iconSize} color={iconColor} />
          <Text className={cn(styles.title, titleClassName)}>{title}</Text>
          {!!subtitle && <Text className={cn(styles.subtitle, subtitleClassName)}>{subtitle}</Text>}
          {!!badges?.length && (
            <View className={styles.badgesRow}>
              {badges.map((b, i) => (
                <View key={`${b}-${i}`} className={cn(styles.badgePill, badgePillClassName)}>
                  <Text className={cn(styles.badgeText, badgeTextClassName)}>{b}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </BlurView>
    </Animated.View>
  );
};

export default memo(HeroCard);

const styles = {
  card: 'h-[280px] w-[280px] overflow-hidden rounded-3xl',
  content: 'flex-1 items-center justify-center border border-white/25 bg-white/10',
  title: 'mt-3 text-2xl font-extrabold text-white',
  subtitle: 'mt-1 px-6 text-center text-white/80',
  badgesRow: 'mt-4 flex-row',
  badgePill: 'mr-2 rounded-full border border-white/25 bg-white/15 px-3 py-1',
  badgeText: 'text-xs text-white/90',
} as const;
