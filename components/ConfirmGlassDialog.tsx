import { BlurView } from 'expo-blur';
import { Modal, Pressable, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
};

const ConfirmGlassDialog = ({
  visible,
  title = 'Emin misin?',
  message,
  confirmText = 'Onayla',
  cancelText = 'Vazgeç',
  onConfirm,
  onCancel,
  destructive,
}: Props) => (
  <Modal animationType="fade" transparent visible={visible} onRequestClose={onCancel}>
    <Pressable className={styles.backdrop} onPress={onCancel} />
    <View className={styles.center}>
      <BlurView intensity={50} tint="light" className={styles.card}>
        <Text className={styles.title}>{title}</Text>
        {!!message && <Text className={styles.msg}>{message}</Text>}

        <View className={styles.row}>
          <Pressable onPress={onCancel} className={styles.btnGhost}>
            <Text className={styles.btnGhostText}>{cancelText}</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              onCancel();
              requestAnimationFrame(onConfirm);
            }}
            className={[styles.btnSolid, destructive ? styles.btnSolidDestructive : ''].join(' ')}
          >
            <Text className={styles.btnSolidText}>{confirmText}</Text>
          </Pressable>
        </View>
      </BlurView>
    </View>
  </Modal>
);

export default ConfirmGlassDialog;

const styles = {
  backdrop: 'flex-1 bg-black/40',
  center: 'absolute inset-0 px-6 items-center justify-center',
  card: 'w-full rounded-3xl overflow-hidden border border-white/25 bg-white/15 px-4 py-4',
  title: 'text-white font-bold text-base mb-1',
  msg: 'text-white/80 mb-4',
  row: 'flex-row justify-end space-x-3',
  btnGhost: 'px-4 py-2 rounded-2xl bg-white/10 border border-white/20',
  btnGhostText: 'text-white font-semibold',
  btnSolid: 'px-4 py-2 rounded-2xl bg-white/20 border border-white/20',
  btnSolidDestructive: 'bg-rose-500/20 border-rose-400/40',
  btnSolidText: 'text-white font-bold',
} as const;
