import { useTranslation } from 'react-i18next';
import { FlatList, RefreshControl, Text } from 'react-native';

import Button from '@/components/Button';
import type { ListItem } from '@/types/lists';

import ListCard from './ListCard';

interface ListBodyProps {
  lists: ListItem[];
  isRefetching: boolean;
  refetchAll: () => void;
  onButtonPress: () => void;
  onLongPressItem: (item: ListItem) => void;
  onDeleteItem: (item: ListItem) => void;
}

const ListBody = (props: ListBodyProps) => {
  const { lists, isRefetching, refetchAll, onButtonPress, onLongPressItem, onDeleteItem } = props;
  const { t } = useTranslation();

  return (
    <FlatList
      data={lists}
      keyExtractor={(item) => String(item.id)}
      refreshControl={
        <RefreshControl tintColor="#fff" refreshing={isRefetching} onRefresh={refetchAll} />
      }
      contentContainerStyle={{ padding: 16 }}
      ListEmptyComponent={
        <Text className="mt-6 text-center text-white/80">{t('lists.noListMessage')}</Text>
      }
      renderItem={({ item }) => (
        <ListCard
          item={item}
          onLongPress={() => onLongPressItem(item)}
          onDelete={() => onDeleteItem(item)}
        />
      )}
      ListHeaderComponent={
        <Button
          title={`+ ${t('lists.addToListBtn')}`}
          size="sm"
          onPress={onButtonPress}
          rootClassName="self-start mb-4"
        />
      }
    />
  );
};

export default ListBody;
