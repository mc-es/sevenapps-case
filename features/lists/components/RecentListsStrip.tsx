import { cn } from '@/libs/cn';
import type { ListItem } from '@/types/lists';
import { BlurView } from 'expo-blur';
import { Link } from 'expo-router';
import { memo, useCallback, useMemo } from 'react';
import type { ListRenderItem } from 'react-native';
import { FlatList, Pressable, Text, View } from 'react-native';

type RecentListsStripProps = {
  items: ListItem[];
  title: string;
  containerClassName?: string;
  titleClassName?: string;
  contentContainerClassName?: string;
  cardClassName?: string;
  nameClassName?: string;
  dateClassName?: string;
};

const RecentListsStrip = ({
  items,
  title,
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
        <BlurView key={item.id} intensity={25} tint="light" className={cn(styles.blur)}>
          <Link href={{ pathname: '/details', params: { id: String(item.id) } }} asChild>
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
        </BlurView>
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
  blur: 'mr-2 overflow-hidden rounded-2xl',
  container: 'pt-3',
  title: 'font-extrabold px-6 mb-2 text-white',
  contentContainer: 'px-4',
  card: 'px-3 py-2 bg-white/12 border border-white/20',
  name: 'font-semibold max-w-[160px] text-white',
  date: 'text-[11px] text-white/70',
} as const;
