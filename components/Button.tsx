import { LinearGradient } from 'expo-linear-gradient';
import React, { memo } from 'react';
import type { GestureResponderEvent } from 'react-native';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { cn } from '@/libs';

type ColorTuple = readonly [string, string, ...string[]];
type Variant = 'solid' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface Props {
  title: string;
  onPress?: (e?: GestureResponderEvent) => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  colors?: ColorTuple;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  left?: React.ReactNode;
  right?: React.ReactNode;
  rootClassName?: string;
  contentClassName?: string;
  textClassName?: string;
}

const Button = (props: Props) => {
  const {
    title,
    onPress,
    variant = 'solid',
    size = 'md',
    disabled,
    loading,
    fullWidth,
    colors = ['#111827', '#0b1220'],
    start = { x: 0, y: 0 },
    end = { x: 1, y: 1 },
    left,
    right,
    rootClassName,
    contentClassName,
    textClassName,
  } = props;
  let sizeCls: string;

  if (size === 'sm') sizeCls = styles.sizeSm;
  else if (size === 'lg') sizeCls = styles.sizeLg;
  else sizeCls = styles.sizeMd;

  const basePressable = cn(
    styles.base,
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    rootClassName,
  );

  const contentRow = cn(styles.contentRow, contentClassName);
  const textCls = cn(styles.textBase, textClassName);

  const pressableProps = {
    accessibilityRole: 'button' as const,
    disabled: disabled || loading,
    style: ({ pressed }: { pressed: boolean }) => [{ opacity: pressed ? 0.96 : 1 }],
    onPress: (e: GestureResponderEvent) => onPress?.(e),
  };

  if (variant === 'solid') {
    return (
      <Pressable {...pressableProps} className={basePressable}>
        <LinearGradient
          colors={colors}
          start={start}
          end={end}
          className={cn(styles.gradient, sizeCls)}
        >
          <View className={contentRow}>
            {left ? <View className={styles.iconLeft}>{left}</View> : null}
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className={cn(textCls, styles.textOnSolid)}>{title}</Text>
            )}
            {right ? <View className={styles.iconRight}>{right}</View> : null}
          </View>
        </LinearGradient>
      </Pressable>
    );
  }

  if (variant === 'outline') {
    return (
      <Pressable {...pressableProps} className={cn(basePressable, styles.outline, sizeCls)}>
        <View className={contentRow}>
          {left ? <View className={styles.iconLeft}>{left}</View> : null}
          {loading ? <ActivityIndicator /> : <Text className={textCls}>{title}</Text>}
          {right ? <View className={styles.iconRight}>{right}</View> : null}
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable {...pressableProps} className={cn(basePressable, styles.ghost, sizeCls)}>
      <View className={contentRow}>
        {left ? <View className={styles.iconLeft}>{left}</View> : null}
        {loading ? <ActivityIndicator /> : <Text className={textCls}>{title}</Text>}
        {right ? <View className={styles.iconRight}>{right}</View> : null}
      </View>
    </Pressable>
  );
};

export default memo(Button);

const styles = {
  base: 'rounded-2xl overflow-hidden',
  fullWidth: 'w-full',
  disabled: 'opacity-60',
  gradient: 'items-center justify-center',
  outline: 'border border-white/25 bg-white/5',
  ghost: 'bg-transparent',
  contentRow: 'flex-row items-center justify-center px-4',
  iconLeft: 'mr-2',
  iconRight: 'ml-2',
  sizeSm: 'py-2',
  sizeMd: 'py-3',
  sizeLg: 'py-4',
  textBase: 'font-semibold text-white',
  textOnSolid: 'text-white',
} as const;
