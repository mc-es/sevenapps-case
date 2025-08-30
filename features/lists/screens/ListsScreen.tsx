import Container from '@/components/Container';
import SearchInput from '@/components/SearchInput';
import useDebouncedValue from '@/hooks/useDebouncedValue';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import ListCard from '../components/ListCard';
import RecentListsStrip from '../components/RecentListsStrip';
import RenameModal from '../components/RenameModal';
import useListsData from '../hooks/useListsData';

const ListsScreen = () => {
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search, 400);

  const {
    lists,
    recentLists,
    isLoading,
    isError,
    isRefetching,
    refetchAll,
    createList,
    renameList,
    deleteList,
  } = useListsData({ debouncedSearch: debounced, recentLimit: 5 });

  const [counter, setCounter] = useState(1);
  const [renameVisible, setRenameVisible] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [renameTargetId, setRenameTargetId] = useState<number | null>(null);

  function openRename(id: number, currentName: string) {
    setRenameTargetId(id);
    setRenameValue(currentName);
    setRenameVisible(true);
  }

  let content: React.ReactNode;

  if (isLoading) {
    content = (
      <View className={styles.loadingContainer}>
        <ActivityIndicator />
        <Text className={styles.loadingText}>Listeler yükleniyor…</Text>
      </View>
    );
  } else if (isError) {
    content = (
      <View className={styles.errorContainer}>
        <Text className={styles.errorTitle}>Bir hata oluştu</Text>
        <Pressable onPress={refetchAll} className={styles.retryBtn}>
          <Text className={styles.retryText}>Tekrar dene</Text>
        </Pressable>
      </View>
    );
  } else {
    content = (
      <FlatList
        data={lists}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetchAll} />}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <Pressable
            onPress={() => {
              const name = `Yeni Liste ${counter}`;
              setCounter((c) => c + 1);
              createList(name);
            }}
            className={styles.addListBtn}
          >
            <Text className={styles.addListText}>+ Liste Ekle</Text>
          </Pressable>
        }
        ListEmptyComponent={<Text className={styles.emptyText}>Hiç liste yok.</Text>}
        renderItem={({ item }) => (
          <ListCard
            item={item}
            onLongPress={() =>
              Alert.alert(item.name, '', [
                { text: 'Yeniden adlandır', onPress: () => openRename(item.id, item.name) },
                { text: 'Sil', style: 'destructive', onPress: () => deleteList(item.id) },
                { text: 'Kapat', style: 'cancel' },
              ])
            }
            onDelete={() => deleteList(item.id)}
          />
        )}
      />
    );
  }

  return (
    <Container className={styles.root}>
      <SearchInput
        value={search}
        onChangeText={setSearch}
        placeholder="Listelerde ara…"
        containerClassName={styles.searchContainer}
      />

      {debounced.length === 0 && <RecentListsStrip items={recentLists} />}

      {content}

      <RenameModal
        visible={renameVisible}
        value={renameValue}
        onChangeText={setRenameValue}
        onCancel={() => setRenameVisible(false)}
        onSave={() => {
          if (!renameTargetId || !renameValue.trim()) {
            setRenameVisible(false);
            return;
          }
          renameList(renameTargetId, renameValue.trim());
          setRenameVisible(false);
        }}
      />
    </Container>
  );
};

export default ListsScreen;

const styles = {
  root: 'bg-white',
  searchContainer: 'px-4 pt-4',
  loadingContainer: 'flex-1 items-center justify-center',
  loadingText: 'mt-2',
  errorContainer: 'flex-1 items-center justify-center px-4',
  errorTitle: 'font-semibold text-base mb-2',
  retryBtn: 'px-3 py-2 rounded-xl border border-black/10 self-start bg-white',
  retryText: 'text-blue-500 mt-3',
  addListBtn: 'px-3 py-2 rounded-xl border border-black/10 mb-4 self-start bg-white',
  addListText: 'font-semibold',
  emptyText: 'text-center mt-6',
} as const;
