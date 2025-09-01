import { BlurView } from 'expo-blur';
import { memo } from 'react';
import { Animated, Modal, Pressable, Text, View } from 'react-native';

import { useInOutAnimation } from '@/hooks';

import Button from './Button';

type Action = { key: string; label: string; destructive?: boolean; onPress: () => void };

interface Props {
  visible: boolean;
  title: string;
  actions: Action[];
  cancelText: string;
  onClose: () => void;
  backdropOpacity?: number;
  intensity?: number;
  blurTint?: 'light' | 'dark' | 'default';
}

const defaults: Required<Pick<Props, 'backdropOpacity' | 'intensity' | 'blurTint'>> = {
  backdropOpacity: 0.65,
  intensity: 65,
  blurTint: 'light',
};

const BottomSheet = (props: Props) => {
  const { visible, title, actions, cancelText, onClose, backdropOpacity, intensity, blurTint } = {
    ...defaults,
    ...props,
  };
  const { open, backdropStyle, cardStyle } = useInOutAnimation({
    visible,
    translateY: { from: 60, to: 0 },
    onClosed: onClose,
  });

  if (!open) return null;

  return (
    <Modal animationType="none" transparent visible onRequestClose={onClose}>
      <Animated.View style={backdropStyle} className="absolute inset-0">
        <Pressable
          onPress={onClose}
          style={{ backgroundColor: `rgba(0,0,0,${backdropOpacity})` }}
          className="flex-1"
        />
      </Animated.View>
      <Animated.View style={cardStyle} className={styles.sheetWrap}>
        <BlurView intensity={intensity} tint={blurTint} className={styles.sheetBlur}>
          <View className={styles.sheetFill} />
          <View className={styles.sheetInner}>
            <Text className={styles.sheetTitle}>{title}</Text>
            {actions.map((a) => (
              <Button
                key={a.key}
                title={a.label}
                colors={a.destructive ? ['#fb7185', '#e11d48'] : ['#818cf8', '#4f46e5']}
                size="md"
                variant="solid"
                rootClassName="mb-2"
                onPress={() => {
                  onClose();
                  requestAnimationFrame(a.onPress);
                }}
              />
            ))}
            <Button
              title={cancelText}
              size="md"
              variant="solid"
              onPress={onClose}
              colors={['#808080', '#4D4D4D']}
            />
          </View>
        </BlurView>
      </Animated.View>
    </Modal>
  );
};

export default memo(BottomSheet);

const styles = {
  sheetWrap: 'absolute left-0 right-0 bottom-0 px-4 pb-6',
  sheetBlur: 'rounded-3xl overflow-hidden border border-white/25',
  sheetFill: 'absolute inset-0 bg-white/22',
  sheetInner: 'px-4 pt-4 pb-2',
  sheetTitle: 'text-white font-bold mb-3 text-3xl',
} as const;
