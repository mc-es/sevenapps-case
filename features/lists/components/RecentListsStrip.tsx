import { cn } from '@/libs/cn';
import type { ListItem } from '@/types/lists';
import { Link } from 'expo-router';
import { memo, useCallback, useMemo } from 'react';
import type { ListRenderItem } from 'react-native';
import { FlatList, Pressable, Text, View } from 'react-native';

type RecentListsStripProps = {
  items: ListItem[];
  title?: string;
  containerClassName?: string;
  titleClassName?: string;
  contentContainerClassName?: string;
  cardClassName?: string;
  nameClassName?: string;
  dateClassName?: string;
};

const RecentListsStrip = ({
  items,
  title = 'Son oluşturulanlar',
  containerClassName,
  titleClassName,
  contentContainerClassName,
  cardClassName,
  nameClassName,
  dateClassName,
}: RecentListsStripProps) => {
  if (!items?.length) return null;

  const fmt = useMemo(
    () =>
      new Intl.DateTimeFormat('tr-TR', {
        dateStyle: 'short',
        timeStyle: 'short',
      }),
    [],
  );

  const renderItem: ListRenderItem<ListItem> = useCallback(
    ({ item }) => {
      const created = item?.created_at ? fmt.format(new Date(item.created_at)) : null;

      return (
        <Link
          key={item.id}
          href={{ pathname: '/details', params: { id: String(item.id) } }}
          asChild
        >
          <Pressable
            className={cn(styles.card, cardClassName)}
            accessibilityRole="button"
            accessibilityHint="Detayları aç"
            style={({ pressed }) => [{ opacity: pressed ? 0.96 : 1 }]}
          >
            <Text numberOfLines={1} className={cn(styles.name, nameClassName)}>
              {item.name}
            </Text>
            {created && <Text className={cn(styles.date, dateClassName)}>{created}</Text>}
          </Pressable>
        </Link>
      );
    },
    [cardClassName, dateClassName, fmt, nameClassName],
  );

  return (
    <View className={cn(styles.container, containerClassName)}>
      <Text className={cn(styles.title, titleClassName)}>{title}</Text>

      <FlatList
        data={items}
        keyExtractor={(it) => String(it.id)}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        ListHeaderComponent={
          <View className={cn(contentContainerClassName, styles.contentContainer)} />
        }
        ListFooterComponent={
          <View className={cn(contentContainerClassName, styles.contentContainer)} />
        }
      />
    </View>
  );
};

export default memo(RecentListsStrip);

const styles = {
  container: 'pt-3',
  title: 'mb-2 px-4 font-extrabold',
  contentContainer: 'px-4',
  card: 'mr-2 rounded-xl border border-black/10 bg-white px-3 py-2',
  name: 'max-w-[160px] font-semibold',
  date: 'text-[11px] text-black/60',
} as const;
