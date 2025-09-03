import { BlurView } from 'expo-blur';
import { Link } from 'expo-router';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { GestureResponderEvent } from 'react-native';
import { Pressable, Text, View } from 'react-native';

import { Button } from '@/components';
import { useTRDateTimeFormat } from '@/hooks';
import type { ListDto } from '@/validations';

interface Props {
  item: ListDto;
  onLongPress?: () => void;
  onDelete?: () => void;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
}

const ListCard = (props: Props) => {
  const { item, onLongPress, onDelete, intensity = 40, tint = 'light' } = props;
  const { t } = useTranslation();
  const fmt = useTRDateTimeFormat();

  const createdAtText = useMemo(() => {
    if (!item?.created_at) return null;
    const d = new Date(item.created_at);
    return isNaN(d.getTime()) ? null : fmt.format(d);
  }, [item?.created_at, fmt]);

  const handleDelete = useCallback(
    (e?: GestureResponderEvent & { preventDefault?: () => void }) => {
      e?.preventDefault?.();
      e?.stopPropagation?.();
      onDelete?.();
    },
    [onDelete],
  );

  return (
    <BlurView intensity={intensity} tint={tint} className={styles.blur}>
      <Link href={{ pathname: '/tasks', params: { id: String(item.id) } }} asChild>
        <Pressable
          onLongPress={onLongPress}
          accessibilityRole="button"
          className={styles.root}
          android_ripple={{ borderless: false }}
          style={({ pressed }) => [{ opacity: pressed ? 0.96 : 1 }]}
        >
          <View className={styles.row}>
            <View className={styles.inlineRow}>
              <Text numberOfLines={1} className={styles.nameText}>
                {item.name}
              </Text>
              {!!item.created_at && (
                <Text className={styles.dateText}>
                  {t('global.creation')}: {createdAtText}
                </Text>
              )}
            </View>
            <Button
              title={t('global.delete')}
              variant="solid"
              size="sm"
              onPress={handleDelete}
              textClassName={styles.deleteText}
              colors={['#ec4899', '#8b5cf6']}
            />
          </View>
        </Pressable>
      </Link>
    </BlurView>
  );
};

export default memo(ListCard);

const styles = {
  blur: 'mb-3 overflow-hidden rounded-2xl',
  root: 'px-4 py-3 border border-white/20',
  row: 'flex-row items-center justify-between',
  inlineRow: 'gap-1',
  nameText: 'font-semibold text-white text-lg',
  dateText: 'text-xs text-white/70 mt-0.5',
  deleteText: 'text-rose-200 font-bold text-lg',
} as const;
