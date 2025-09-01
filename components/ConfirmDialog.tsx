import { BlurView } from 'expo-blur';
import { memo } from 'react';
import { Animated, Modal, Pressable, Text, View } from 'react-native';

import { useInOutAnimation } from '@/hooks';

import Button from './Button';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  backdropOpacity?: number;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
}

const ConfirmDialog = (props: Props) => {
  const {
    visible,
    title,
    message,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    backdropOpacity = 0.65,
    intensity = 50,
    tint = 'light',
  } = props;
  const { open, backdropStyle } = useInOutAnimation({
    visible,
    translateY: { from: 60, to: 0 },
    onClosed: onCancel,
  });

  if (!open) return null;

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onCancel}>
      <Animated.View style={backdropStyle} className="absolute inset-0">
        <Pressable
          onPress={onCancel}
          style={{ backgroundColor: `rgba(0,0,0,${backdropOpacity})` }}
          className="flex-1"
        />
      </Animated.View>
      <View className={styles.center}>
        <BlurView intensity={intensity} tint={tint} className={styles.card}>
          <Text className={styles.title}>{title}</Text>
          <Text className={styles.msg}>{message}</Text>
          <View className={styles.row}>
            <Button title={cancelText} onPress={onCancel} colors={['#595959', '#383838']} />
            <Button
              title={confirmText}
              colors={['#fb7185', '#e11d48']}
              onPress={() => {
                onCancel();
                requestAnimationFrame(onConfirm);
              }}
            />
          </View>
        </BlurView>
      </View>
    </Modal>
  );
};

export default memo(ConfirmDialog);

const styles = {
  backdrop: 'flex-1 bg-black/40',
  center: 'absolute inset-0 px-6 items-center justify-center',
  card: 'w-full rounded-3xl overflow-hidden border border-white/25 bg-white/15 px-4 py-4',
  title: 'text-white font-bold text-2xl mb-1',
  msg: 'text-white/80 mb-4',
  row: 'flex-row justify-end space-x-3 gap-2',
} as const;
