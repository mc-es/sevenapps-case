import { BlurView } from 'expo-blur';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { GestureResponderEvent } from 'react-native';
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';

import { Button, InputBox } from '@/components';
import { cn } from '@/libs';
import type { Priority, TaskItem } from '@/types/tasks';

import { useModalInOutAnimation } from '../hooks';

type Mode = 'create' | 'edit';

interface TaskFormModalProps {
  visible: boolean;
  mode: Mode;
  onClose: () => void;
  onSubmit: (payload: { name: string; description?: string; priority: Priority }) => void;
  initial?: Partial<Pick<TaskItem, 'name' | 'description' | 'priority'>>;
  backdropOpacity?: number;
  intensity?: number;
}

const defaults: Required<Pick<TaskFormModalProps, 'backdropOpacity' | 'intensity'>> = {
  backdropOpacity: 0.85,
  intensity: 80,
};

const PRIORITIES: Priority[] = ['low', 'medium', 'high'];
const IN_DURATION = 220;
const OUT_DURATION = 180;

const TaskFormModal = (props: TaskFormModalProps) => {
  const { visible, mode, initial, onClose, onSubmit, backdropOpacity, intensity } = {
    ...defaults,
    ...props,
  };
  const { t } = useTranslation();
  const [name, setName] = useState(initial?.name ?? '');
  const [desc, setDesc] = useState(initial?.description ?? '');
  const [priority, setPriority] = useState<Priority>((initial?.priority as Priority) ?? 'medium');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(initial?.name ?? '');
      setDesc(initial?.description ?? '');
      setPriority((initial?.priority as Priority) ?? 'medium');
      setTouched(false);
    }
  }, [visible, initial?.name, initial?.description, initial?.priority]);

  const { open, backdropStyle, cardStyle } = useModalInOutAnimation({
    visible,
    translateY: { from: 20, to: 0 },
    inDuration: IN_DURATION,
    outDuration: OUT_DURATION,
  });

  const trimmedName = name.trim();
  const nameError = useMemo(
    () => (touched && trimmedName.length === 0 ? t('alert.requiredName') : ''),
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
      <Animated.View style={backdropStyle} className="absolute inset-0">
        <Pressable
          onPress={handleBackdropPress}
          className="flex-1"
          style={{ backgroundColor: `rgba(0,0,0,${backdropOpacity})` }}
        />
      </Animated.View>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: 'height' })}
        className={styles.backdrop}
      >
        <Pressable className="flex-1" onPress={handleBackdropPress} />
        <Animated.View style={cardStyle}>
          <BlurView
            intensity={intensity}
            tint="light"
            className={styles.cardWrap}
            onTouchStart={stopPropagation}
          >
            <View className={styles.cardFillDark} />
            <View className={styles.cardFillLight} />
            <View className={styles.cardInner}>
              <Text className={styles.title}>
                {mode === 'create' ? t('tasks.formModalTitle1') : t('tasks.formModalTitle2')}
              </Text>
              <Text className={styles.label}>{t('global.name')} *</Text>
              <InputBox
                value={name}
                onChangeText={(v) => {
                  if (!touched) setTouched(true);
                  setName(v);
                }}
                placeholder={t('placeholder.newTaskTitle')}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
                className={styles.input}
                placeholderTextColor="rgba(229,231,235,0.7)"
              />
              {!!nameError && <Text className={styles.errorText}>{nameError}</Text>}
              <Text className={styles.label}>{t('global.description')}</Text>
              <InputBox
                value={desc}
                onChangeText={setDesc}
                placeholder={t('placeholder.newTaskDescription')}
                multiline
                className={cn(styles.input, styles.inputMultiline)}
                placeholderTextColor="rgba(229,231,235,0.7)"
              />
              <Text className={styles.priorityLabel}>{t('global.priority')}</Text>
              <View className={styles.priorityRow}>
                {PRIORITIES.map((p) => {
                  const active = priority === p;
                  return (
                    <Button
                      key={p}
                      title={t(`global.${p}`)}
                      variant="outline"
                      onPress={() => setPriority(p)}
                      rootClassName={styles.priorityBtn}
                      textClassName={cn(
                        active ? styles.priorityTextActive : styles.priorityTextInactive,
                      )}
                    />
                  );
                })}
              </View>
              <View className={styles.actions}>
                <Button
                  title={t('global.cancel')}
                  onPress={onClose}
                  colors={['#374151', '#1f2937']}
                  textClassName="text-gray-200"
                />
                <Button
                  title={mode === 'create' ? t('global.add') : t('global.save')}
                  onPress={handleSubmit}
                  disabled={!canSubmit}
                  colors={['#10b981', '#059669']}
                  textClassName="text-white font-semibold"
                />
              </View>
            </View>
          </BlurView>
        </Animated.View>
        <Pressable className="flex-1" onPress={handleBackdropPress} />
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default memo(TaskFormModal);

const styles = {
  backdrop: 'flex-1 justify-center px-6',
  cardWrap: 'rounded-3xl overflow-hidden border border-white/25',
  cardFillDark: 'absolute inset-0 bg-black/35',
  cardFillLight: 'absolute inset-0 bg-white/12',
  cardInner: 'px-4 py-4',
  title: 'mb-2 text-base font-bold text-white',
  label: 'mb-1 font-semibold text-white',
  input: 'w-full mb-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white',
  inputMultiline: 'min-h-[84px]',
  errorText: 'text-[12px] text-rose-300 mb-2',
  priorityLabel: 'mb-1 mt-2 font-semibold text-white',
  priorityRow: 'mb-2 flex-row',
  priorityBtn: 'mr-2 px-3 py-2',
  priorityTextActive: 'font-extrabold text-emerald-300',
  priorityTextInactive: 'font-semibold text-white',
  actions: 'mt-3 flex-row justify-end gap-3',
} as const;
