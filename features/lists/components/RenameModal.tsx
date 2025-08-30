import { cn } from '@/libs/cn';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { memo, useCallback, useMemo } from 'react';
import type { GestureResponderEvent } from 'react-native';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type RenameModalProps = {
  visible: boolean;
  value: string;
  onChangeText: (t: string) => void;
  onCancel: () => void;
  onSave: () => void;
  title?: string;
  placeholder?: string;
  containerClassName?: string;
  contentClassName?: string;
  inputClassName?: string;
  actionsClassName?: string;
};

const RenameModal = ({
  visible,
  value,
  onChangeText,
  onCancel,
  onSave,
  title = 'Yeniden adlandır',
  placeholder = 'Yeni ad',
  containerClassName,
  contentClassName,
  inputClassName,
  actionsClassName,
}: RenameModalProps) => {
  const canSave = useMemo(() => value.trim().length > 0, [value]);

  const handleBackdropPress = useCallback(() => {
    onCancel();
  }, [onCancel]);

  const stopPropagation = useCallback(
    (e: GestureResponderEvent & { stopPropagation?: () => void }) => {
      e?.stopPropagation?.();
    },
    [],
  );

  const handleSave = useCallback(() => {
    if (!canSave) return;
    onSave();
  }, [canSave, onSave]);

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: 'height' })}
        className={cn(styles.backdrop, containerClassName)}
      >
        <BlurView intensity={100} tint="dark" style={styles.blurOverlay} />
        <Pressable onPress={handleBackdropPress} className="flex-1" />
        <Pressable onPress={stopPropagation} className="px-6">
          <BlurView intensity={50} tint="light" className={cn(styles.card, contentClassName)}>
            <View className="rounded-2xl border border-white/20 bg-white/10 p-4">
              <Text className={styles.title}>{title}</Text>
              <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                autoFocus
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleSave}
                className={cn(styles.input, inputClassName)}
                placeholderTextColor="rgba(255,255,255,0.6)"
              />
              <View className={cn(styles.actions, actionsClassName)}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Vazgeç"
                  onPress={onCancel}
                >
                  <Text className={styles.cancel}>Vazgeç</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Kaydet"
                  onPress={handleSave}
                  disabled={!canSave}
                  className={cn(styles.saveBtnWrapper, !canSave && 'opacity-70')}
                >
                  <LinearGradient
                    colors={['#111827', '#0b1220'] as const}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className={styles.saveBtn}
                  >
                    <Text className={styles.saveText}>Kaydet</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          </BlurView>
        </Pressable>
        <Pressable onPress={handleBackdropPress} className="flex-1" />
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default memo(RenameModal);

const styles = {
  backdrop: 'flex-1 justify-center bg-black/60',
  blurOverlay: { ...StyleSheet.absoluteFillObject },
  card: 'rounded-2xl overflow-hidden',
  title: 'mb-2 text-base font-bold text-white',
  input: 'mb-3 rounded-xl border border-white/20 px-3 py-2 text-white bg-white/10',
  actions: 'flex-row justify-end gap-4 mt-1',
  cancel: 'text-white/80',
  saveBtnWrapper: 'rounded-2xl overflow-hidden',
  saveBtn: 'px-4 py-2 items-center justify-center',
  saveText: 'font-bold text-white',
} as const;
