import { cn } from '@/libs/cn';
import type { Priority, TaskItem } from '@/types/tasks';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { GestureResponderEvent } from 'react-native';
import {
  Animated,
  Easing,
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
  backdropOpacity?: number;
  intensity?: number;
}

const PRIORITIES: Priority[] = ['low', 'medium', 'high'];
const IN_DURATION = 220;
const OUT_DURATION = 180;

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
  backdropOpacity = 0.85,
  intensity = 70,
}: TaskFormModalProps) {
  // içerik
  const [name, setName] = useState(initial?.name ?? '');
  const [desc, setDesc] = useState(initial?.description ?? '');
  const [priority, setPriority] = useState<Priority>((initial?.priority as Priority) ?? 'medium');
  const [touched, setTouched] = useState(false);

  // animasyonlu aç/kapa (unmount etmeden önce animasyonu bitir)
  const [open, setOpen] = useState(visible);
  const translateY = useRef(new Animated.Value(20)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      if (!open) setOpen(true);
      // form reset
      setName(initial?.name ?? '');
      setDesc(initial?.description ?? '');
      setPriority((initial?.priority as Priority) ?? 'medium');
      setTouched(false);

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: IN_DURATION,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(fade, {
          toValue: 1,
          duration: IN_DURATION - 60,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    } else if (open) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 20,
          duration: OUT_DURATION,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(fade, {
          toValue: 0,
          duration: OUT_DURATION - 60,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) setOpen(false);
      });
    }
  }, [visible, open, initial, translateY, fade]);

  const trimmedName = name.trim();
  const nameError = useMemo(
    () => (touched && trimmedName.length === 0 ? 'Ad zorunlu' : ''),
    [touched, trimmedName],
  );
  const canSubmit = trimmedName.length > 0;

  const handleSubmit = useCallback(() => {
    if (!canSubmit) {
      setTouched(true);
      return;
    }
    onSubmit({ name: trimmedName, description: desc.trim(), priority });
    onClose();
  }, [canSubmit, desc, onClose, onSubmit, priority, trimmedName]);

  const handleBackdropPress = useCallback(() => onClose(), [onClose]);
  const stopPropagation = useCallback((e: GestureResponderEvent) => e?.stopPropagation?.(), []);

  if (!open) return null;

  return (
    <Modal animationType="none" transparent visible onRequestClose={onClose} statusBarTranslucent>
      {/* karartma */}
      <Animated.View style={{ opacity: fade }} className="absolute inset-0">
        <Pressable
          onPress={handleBackdropPress}
          className="flex-1"
          style={{ backgroundColor: `rgba(0,0,0,${backdropOpacity})` }}
        />
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: 'height' })}
        className={cn(styles.backdrop, containerClassName)}
      >
        <Pressable className="flex-1" onPress={handleBackdropPress} />

        {/* glass card */}
        <Animated.View style={{ transform: [{ translateY }], opacity: fade }}>
          <BlurView
            intensity={intensity}
            tint="light"
            className={cn(styles.cardWrap, cardClassName)}
            onTouchStart={stopPropagation}
          >
            {/* blur’un üstüne koyu film (arka tarafın görünürlüğünü ciddi azaltır) */}
            <View className={styles.cardFillDark} />
            {/* hafif beyaz film (cam hissi) */}
            <View className={styles.cardFillLight} />

            <View className={styles.cardInner}>
              <Text className={styles.title}>
                {mode === 'create' ? 'Görev Ekle' : 'Görevi Düzenle'}
              </Text>

              <Text className={styles.label}>Ad *</Text>
              <TextInput
                value={name}
                onChangeText={(v) => {
                  if (!touched) setTouched(true);
                  setName(v);
                }}
                placeholder="Örn: Sepet al"
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
                className={cn(styles.input, inputClassName)}
                placeholderTextColor="rgba(229,231,235,0.7)"
              />
              {!!nameError && <Text className={styles.errorText}>{nameError}</Text>}

              <Text className={styles.label}>Açıklama</Text>
              <TextInput
                value={desc}
                onChangeText={setDesc}
                placeholder="İsteğe bağlı açıklama"
                multiline
                className={cn(styles.input, styles.inputMultiline, inputClassName)}
                placeholderTextColor="rgba(229,231,235,0.7)"
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
                <Pressable
                  onPress={onClose}
                  accessibilityRole="button"
                  accessibilityLabel="Vazgeç"
                  className={styles.cancelBtn}
                >
                  <Text className={styles.cancelText}>Vazgeç</Text>
                </Pressable>

                <Pressable
                  onPress={handleSubmit}
                  disabled={!canSubmit}
                  accessibilityRole="button"
                  accessibilityLabel={mode === 'create' ? 'Ekle' : 'Kaydet'}
                  className={styles.submitWrap}
                >
                  <LinearGradient
                    colors={['#111827', '#0b1220'] as const}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className={cn(styles.submitBtn, !canSubmit && styles.submitBtnDisabled)}
                  >
                    <Text className={styles.submitText}>
                      {mode === 'create' ? 'Ekle' : 'Kaydet'}
                    </Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          </BlurView>
        </Animated.View>

        <Pressable className="flex-1" onPress={handleBackdropPress} />
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default memo(TaskFormModal);

const styles = {
  backdrop: 'flex-1 justify-center px-6',
  cardWrap: 'rounded-3xl overflow-hidden border border-white/25',
  // koyu film: camın arkasını önemli ölçüde gizler
  cardFillDark: 'absolute inset-0 bg-black/35',
  // hafif beyaz film: glass parlaklığı
  cardFillLight: 'absolute inset-0 bg-white/12',
  cardInner: 'px-4 py-4',
  title: 'mb-2 text-base font-bold text-white',
  label: 'mb-1 font-semibold text-white',
  input: 'mb-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white',
  inputMultiline: 'min-h-[84px]',
  errorText: 'text-[12px] text-rose-300 mb-2',
  priorityLabel: 'mb-1 mt-2 font-semibold text-white',
  priorityRow: 'mb-2 flex-row',
  priorityBtn: 'mr-2 rounded-xl border px-3 py-2',
  priorityBtnActive: 'border-emerald-400 bg-emerald-500/10',
  priorityBtnInactive: 'border-white/25 bg-white/10',
  priorityTextActive: 'font-extrabold text-emerald-300',
  priorityTextInactive: 'font-semibold text-white',
  actions: 'mt-3 flex-row justify-end gap-3',
  cancelBtn: 'px-4 py-2 rounded-2xl bg-white/10 border border-white/20',
  cancelText: 'text-white font-semibold',
  submitWrap: 'rounded-2xl overflow-hidden',
  submitBtn: 'px-5 py-2 items-center justify-center',
  submitBtnDisabled: 'opacity-50',
  submitText: 'text-white font-bold',
} as const;
