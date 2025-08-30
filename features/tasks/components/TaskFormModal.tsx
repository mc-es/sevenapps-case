import { cn } from '@/libs/cn';
import type { Priority, TaskItem } from '@/types/tasks';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import type { GestureResponderEvent } from 'react-native';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

type Mode = 'create' | 'edit';

interface TaskFormModalProps {
  visible: boolean;
  mode: Mode;
  initial?: Partial<Pick<TaskItem, 'name' | 'description' | 'priority'>>;
  onClose: () => void;
  onSubmit: (payload: { name: string; description?: string; priority: Priority }) => void;
  containerClassName?: string;
  cardClassName?: string;
  inputClassName?: string;
  actionsClassName?: string;
  priorityBtnClassName?: string;
  priorityTextClassName?: string;
}

const PRIORITIES: Priority[] = ['low', 'medium', 'high'];

function TaskFormModal({
  visible,
  mode,
  initial,
  onClose,
  onSubmit,
  containerClassName,
  cardClassName,
  inputClassName,
  actionsClassName,
  priorityBtnClassName,
  priorityTextClassName,
}: TaskFormModalProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [desc, setDesc] = useState(initial?.description ?? '');
  const [priority, setPriority] = useState<Priority>((initial?.priority as Priority) ?? 'medium');

  useEffect(() => {
    if (visible) {
      setName(initial?.name ?? '');
      setDesc(initial?.description ?? '');
      setPriority((initial?.priority as Priority) ?? 'medium');
    }
  }, [visible, initial]);

  const trimmedName = name.trim();
  const canSubmit = useMemo(() => trimmedName.length > 0, [trimmedName]);

  const handleSubmit = useCallback(() => {
    if (!canSubmit) {
      Alert.alert('Form Hatası', 'Ad zorunlu');
      return;
    }
    onSubmit({
      name: trimmedName,
      description: desc.trim(),
      priority,
    });
    onClose();
  }, [canSubmit, desc, onClose, onSubmit, priority, trimmedName]);

  const handleBackdropPress = useCallback(() => {
    onClose();
  }, [onClose]);

  const stopPropagation = useCallback((e: GestureResponderEvent) => {
    e?.stopPropagation?.();
  }, []);

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: 'height' })}
        className={cn(styles.backdrop, containerClassName)}
      >
        <Pressable onPress={handleBackdropPress} className="flex-1" />
        <Pressable
          onPress={stopPropagation}
          className={cn(styles.card, cardClassName)}
          accessibilityRole="adjustable"
          accessibilityLabel={mode === 'create' ? 'Görev Ekle' : 'Görevi Düzenle'}
        >
          <Text className={styles.title}>
            {mode === 'create' ? 'Görev Ekle' : 'Görevi Düzenle'}
          </Text>
          <Text className={styles.label}>Ad *</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Örn: Sepet al"
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            className={cn(styles.input, inputClassName)}
            placeholderTextColor="#9ca3af"
          />
          <Text className={styles.label}>Açıklama</Text>
          <TextInput
            value={desc}
            onChangeText={setDesc}
            placeholder="İsteğe bağlı açıklama"
            multiline
            className={cn(styles.input, styles.inputMultiline, inputClassName)}
            placeholderTextColor="#9ca3af"
          />
          <Text className={styles.priorityLabel}>Öncelik</Text>
          <View className={styles.priorityRow}>
            {PRIORITIES.map((p) => {
              const active = priority === p;
              return (
                <Pressable
                  key={p}
                  onPress={() => setPriority(p)}
                  className={cn(
                    styles.priorityBtn,
                    active ? styles.priorityBtnActive : styles.priorityBtnInactive,
                    priorityBtnClassName,
                  )}
                  style={({ pressed }) => [{ opacity: pressed ? 0.95 : 1 }]}
                  accessibilityRole="button"
                  accessibilityLabel={`Öncelik: ${p}`}
                >
                  <Text
                    className={cn(
                      active ? styles.priorityTextActive : styles.priorityTextInactive,
                      priorityTextClassName,
                    )}
                  >
                    {p}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View className={cn(styles.actions, actionsClassName)}>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Vazgeç">
              <Text className={styles.cancelText}>Vazgeç</Text>
            </Pressable>
            <Pressable
              onPress={handleSubmit}
              disabled={!canSubmit}
              accessibilityRole="button"
              accessibilityLabel={mode === 'create' ? 'Ekle' : 'Kaydet'}
              style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
            >
              <Text className={cn(styles.submitText, !canSubmit && styles.submitDisabled)}>
                {mode === 'create' ? 'Ekle' : 'Kaydet'}
              </Text>
            </Pressable>
          </View>
        </Pressable>
        <Pressable onPress={handleBackdropPress} className="flex-1" />
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default memo(TaskFormModal);

const styles = {
  backdrop: 'flex-1 justify-center bg-black/40 p-6',
  card: 'rounded-xl bg-white p-4',
  title: 'mb-2 text-base font-bold',
  label: 'mb-1 font-semibold',
  input: 'mb-3 rounded-lg border border-black/10 px-3 py-2',
  inputMultiline: 'min-h-[80px]',
  priorityLabel: 'mb-1 mt-3 font-semibold',
  priorityRow: 'mb-2 flex-row',
  priorityBtn: 'mr-2 rounded-xl border px-3 py-2',
  priorityBtnActive: 'border-blue-500',
  priorityBtnInactive: 'border-black/15',
  priorityTextActive: 'font-extrabold text-blue-500',
  priorityTextInactive: 'font-semibold',
  actions: 'mt-3 flex-row justify-end gap-4',
  cancelText: '',
  submitText: 'font-bold text-blue-500',
  submitDisabled: 'text-blue-300',
} as const;
