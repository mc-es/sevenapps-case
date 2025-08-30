// components/GlassActionSheet.tsx
import { BlurView } from 'expo-blur';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, Pressable, Text, View } from 'react-native';

type Action = { key: string; label: string; destructive?: boolean; onPress: () => void };

type Props = {
  visible: boolean; // dışarıdan kontrol
  title?: string;
  actions: Action[];
  onClose: () => void; // backdrop veya "Kapat" tıklandığında çağrılır (parent visible=false yapar)
  backdropOpacity?: number; // 0–1
  intensity?: number; // 0–100
};

const IN_DURATION = 220;
const OUT_DURATION = 180;

const GlassActionSheet = ({
  visible,
  title,
  actions,
  onClose,
  backdropOpacity = 0.65,
  intensity = 65,
}: Props) => {
  // Modal kapatmayı animasyon sonuna ertelemek için internal open state
  const [open, setOpen] = useState(visible);

  // anim değerleri
  const translateY = useRef(new Animated.Value(60)).current;
  const fade = useRef(new Animated.Value(0)).current;

  // dış visible değişince: giriş/çıkış animasyonları
  useEffect(() => {
    if (visible) {
      // modal'ı hemen aç, sonra animasyonla içeri getir
      if (!open) setOpen(true);
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
      // çıkış animasyonu; bitince modal'ı kapat
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 60,
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
  }, [visible, open, translateY, fade]);

  if (!open) return null; // kapalıyken hiç render etme

  return (
    <Modal animationType="none" transparent visible onRequestClose={onClose}>
      {/* Backdrop */}
      <Animated.View style={{ opacity: fade }} className="absolute inset-0">
        <Pressable
          onPress={onClose}
          style={{ backgroundColor: `rgba(0,0,0,${backdropOpacity})` }}
          className="flex-1"
        />
      </Animated.View>

      {/* Sheet */}
      <Animated.View style={{ transform: [{ translateY }] }} className={styles.sheetWrap}>
        <BlurView intensity={intensity} tint="light" className={styles.sheetBlur}>
          {/* ek cam dolgusu */}
          <View className={styles.sheetFill} />
          <View className={styles.sheetInner}>
            {!!title && <Text className={styles.sheetTitle}>{title}</Text>}

            {actions.map((a) => (
              <Pressable
                key={a.key}
                onPress={() => {
                  onClose();
                  requestAnimationFrame(a.onPress);
                }}
                className={[
                  styles.actionBtn,
                  a.destructive ? styles.actionBtnDestructive : '',
                ].join(' ')}
              >
                <Text
                  className={[
                    styles.actionText,
                    a.destructive ? styles.actionTextDestructive : '',
                  ].join(' ')}
                >
                  {a.label}
                </Text>
              </Pressable>
            ))}

            <Pressable onPress={onClose} className={styles.cancelBtn}>
              <Text className={styles.cancelText}>Kapat</Text>
            </Pressable>
          </View>
        </BlurView>
      </Animated.View>
    </Modal>
  );
};

export default GlassActionSheet;

const styles = {
  sheetWrap: 'absolute left-0 right-0 bottom-0 px-4 pb-6',
  sheetBlur: 'rounded-3xl overflow-hidden border border-white/25',
  sheetFill: 'absolute inset-0 bg-white/22',
  sheetInner: 'px-4 pt-4 pb-2',
  sheetTitle: 'text-white font-bold text-base mb-3',
  actionBtn: 'px-3 py-3 rounded-2xl bg-white/14 border border-white/25 mb-2 items-center',
  actionBtnDestructive: 'bg-rose-500/18 border-rose-400/40',
  actionText: 'text-white font-semibold',
  actionTextDestructive: 'text-rose-100',
  cancelBtn: 'px-3 py-3 rounded-2xl items-center mt-1 bg-white/12 border border-white/25',
  cancelText: 'text-white/90 font-semibold',
} as const;
