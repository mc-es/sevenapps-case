import { cn } from '@/libs/cn';
import type { ListItem } from '@/types/lists';
import { Link } from 'expo-router';
import { memo, useCallback, useMemo } from 'react';
import type { GestureResponderEvent } from 'react-native';
import { Pressable, Text, View } from 'react-native';

interface ListCardProps {
  item: ListItem;
  onLongPress?: () => void;
  onDelete?: () => void;
  cardClassName?: string;
  textClassName?: string;
  dateTextClassName?: string;
  deleteBtnClassName?: string;
  deleteTextClassName?: string;
}

const ListCard = ({
  item,
  onLongPress,
  onDelete,
  cardClassName,
  textClassName,
  deleteBtnClassName,
  deleteTextClassName,
}: ListCardProps) => {
  const createdAtText = useMemo(() => {
    if (!item?.created_at) return null;

    const d = new Date(item.created_at);

    if (isNaN(d.getTime())) return null;

    return new Intl.DateTimeFormat('tr-TR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(d);
  }, [item?.created_at]);

  const handleDelete = useCallback(
    (e: GestureResponderEvent & { preventDefault?: () => void }) => {
      e?.preventDefault?.();
      e?.stopPropagation?.();
      onDelete?.();
    },
    [onDelete],
  );

  return (
    <Link href={{ pathname: '/details', params: { id: String(item.id) } }} asChild>
      <Pressable
        onLongPress={onLongPress}
        accessibilityRole="button"
        accessibilityHint="Detayları açmak için dokun, silmek için sağdaki butona bas."
        className={cn(styles.root, cardClassName)}
        android_ripple={{ borderless: false }}
        style={({ pressed }) => [{ opacity: pressed ? 0.96 : 1 }]}
      >
        <View className={cn(styles.row)}>
          <View className={cn(styles.inlineRow)}>
            <Text numberOfLines={1} className={cn(styles.nameText, textClassName)}>
              {item.name}
            </Text>
            {!!item.created_at && (
              <Text className={cn(styles.dateText)}>oluşturma: {createdAtText}</Text>
            )}
          </View>
          <Pressable
            onPress={handleDelete}
            hitSlop={8}
            className={cn(styles.deleteBtn, deleteBtnClassName)}
            accessibilityRole="button"
            accessibilityLabel="Sil"
            accessibilityHint="Bu öğeyi sil"
          >
            <Text className={cn(styles.deleteText, deleteTextClassName)}>Sil</Text>
          </Pressable>
        </View>
      </Pressable>
    </Link>
  );
};

export default memo(ListCard);

const styles = {
  root: 'mb-3 rounded-xl border border-black/10 bg-white p-3',
  row: 'flex-row items-center justify-between',
  inlineRow: 'flex-1 pr-2',
  nameText: 'text-base font-semibold',
  dateText: 'text-xs text-black/60',
  deleteBtn: 'px-2 py-1',
  deleteText: 'font-bold text-red-500',
} as const;
