import { BlurView } from 'expo-blur';
import { Link } from 'expo-router';
import { memo, useCallback } from 'react';
import type { ListRenderItem } from 'react-native';
import { FlatList, Pressable, Text, View } from 'react-native';

import { useTRDateTimeFormat } from '@/hooks';
import type { ListDto } from '@/validations';

interface Props {
  items: ListDto[];
  title: string;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
}

const RecentListsStrip = (props: Props) => {
  const { items, title, intensity = 25, tint = 'light' } = props;

  if (!items?.length) return null;

  const fmt = useTRDateTimeFormat();

  const renderItem: ListRenderItem<ListDto> = useCallback(({ item }) => {
    const created = item?.created_at ? fmt.format(new Date(item.created_at)) : null;

    return (
      <BlurView key={item.id} intensity={intensity} tint={tint} className={styles.blur}>
        <Link href={{ pathname: '/tasks', params: { id: String(item.id) } }} asChild>
          <Pressable
            className={styles.card}
            accessibilityRole="button"
            style={({ pressed }) => [{ opacity: pressed ? 0.96 : 1 }]}
          >
            <Text numberOfLines={1} className={styles.name}>
              {item.name}
            </Text>
            {created && <Text className={styles.date}>{created}</Text>}
          </Pressable>
        </Link>
      </BlurView>
    );
  }, []);

  return (
    <View className={styles.container}>
      <Text className={styles.title}>{title}</Text>
      <FlatList
        data={items}
        keyExtractor={(it) => String(it.id)}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        ListHeaderComponent={<View className={styles.contentContainer} />}
        ListFooterComponent={<View className={styles.contentContainer} />}
      />
    </View>
  );
};

export default memo(RecentListsStrip);

const styles = {
  container: 'mt-3 pt-3',
  title: 'font-extrabold px-6 mb-2 text-white text-xl',
  contentContainer: 'px-3',
  blur: 'mr-2 overflow-hidden rounded-2xl',
  card: 'px-3 py-2 bg-white/12 border border-white/20 gap-1.5',
  name: 'font-semibold max-w-[180px] text-white',
  date: 'text-xs text-white/70',
} as const;
