import { cn } from '@/libs/cn';
import { memo, useCallback, useMemo } from 'react';
import type { GestureResponderEvent } from 'react-native';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
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
        <Pressable onPress={handleBackdropPress} className="flex-1" />
        <Pressable onPress={stopPropagation} className={cn(styles.card, contentClassName)}>
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
            placeholderTextColor="#9ca3af"
          />
          <View className={cn(styles.actions, actionsClassName)}>
            <Pressable accessibilityRole="button" accessibilityLabel="Vazgeç" onPress={onCancel}>
              <Text className={styles.cancel}>Vazgeç</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Kaydet"
              onPress={handleSave}
              disabled={!canSave}
              style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
            >
              <Text className={cn(styles.save, !canSave && styles.saveDisabled)}>Kaydet</Text>
            </Pressable>
          </View>
        </Pressable>
        <Pressable onPress={handleBackdropPress} className="flex-1" />
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default memo(RenameModal);

const styles = {
  backdrop: 'flex-1 justify-center bg-black/40 p-6',
  card: 'rounded-xl bg-white p-4',
  title: 'mb-2 text-base font-bold',
  input: 'mb-3 rounded-lg border border-black/10 px-3 py-2',
  actions: 'flex-row justify-end gap-4',
  cancel: '',
  save: 'font-bold text-blue-500',
  saveDisabled: 'text-blue-300',
} as const;
