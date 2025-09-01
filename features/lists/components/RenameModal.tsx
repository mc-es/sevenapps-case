import { BlurView } from 'expo-blur';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { GestureResponderEvent } from 'react-native';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button, InputBox } from '@/components';

interface RenameModalProps {
  title: string;
  placeholder: string;
  visible: boolean;
  value: string;
  onChangeText: (t: string) => void;
  onCancel: () => void;
  onSave: () => void;
  backdropBlurIntensity?: number;
  backdropBlurTint?: 'light' | 'dark' | 'default';
  cardBlurIntensity?: number;
  cardBlurTint?: 'light' | 'dark' | 'default';
}

const defaults: Required<
  Pick<
    RenameModalProps,
    'backdropBlurIntensity' | 'backdropBlurTint' | 'cardBlurIntensity' | 'cardBlurTint'
  >
> = {
  backdropBlurIntensity: 100,
  backdropBlurTint: 'dark',
  cardBlurIntensity: 100,
  cardBlurTint: 'dark',
};

const RenameModal = (props: RenameModalProps) => {
  const {
    title,
    placeholder,
    visible,
    value,
    onChangeText,
    onCancel,
    onSave,
    backdropBlurIntensity,
    backdropBlurTint,
    cardBlurIntensity,
    cardBlurTint,
  } = { ...defaults, ...props };
  const { t } = useTranslation();
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
        className={styles.backdrop}
      >
        <BlurView
          intensity={backdropBlurIntensity}
          tint={backdropBlurTint}
          style={styles.blurOverlay}
        />
        <Pressable onPress={handleBackdropPress} className="flex-1" />
        <Pressable onPress={stopPropagation} className="px-6">
          <BlurView intensity={cardBlurIntensity} tint={cardBlurTint} className={styles.card}>
            <View className={styles.inlineCard}>
              <Text className={styles.title}>{title}</Text>
              <InputBox
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                autoFocus
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleSave}
                variant="glass"
                containerClassName="w-full"
                inputClassName="mb-3"
              />
              <View className={styles.actions}>
                <Button
                  title={t('global.cancel')}
                  variant="solid"
                  onPress={onCancel}
                  colors={['#374151', '#1f2937']}
                  textClassName="text-gray-200"
                />
                <Button
                  title={t('global.save')}
                  onPress={handleSave}
                  disabled={!canSave}
                  colors={['#10b981', '#059669']}
                  textClassName="text-white font-semibold"
                />
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
  inlineCard: 'rounded-2xl border border-white/20 bg-white/20 p-4',
  title: 'mb-2 text-base font-bold text-white',
  actions: 'flex-row justify-end gap-4 mt-1',
} as const;
