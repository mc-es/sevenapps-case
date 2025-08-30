import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BackgroundGradient from '@/components/BackgroundGradient';
import Container from '@/components/Container';
import useDebouncedValue from '@/hooks/useDebouncedValue';

import ConfirmGlassDialog from '@/components/ConfirmGlassDialog';
import GlassActionSheet from '@/components/GlassActionSheet';
import ListCard from '../components/ListCard';
import RecentListsStrip from '../components/RecentListsStrip';
import RenameModal from '../components/RenameModal';
import useListsData from '../hooks/useListsData';

const ListsScreen = () => {
  const insets = useSafeAreaInsets();

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
  } = useListsData({ debouncedSearch: debounced, recentLimit: 3 });

  const [counter, setCounter] = useState(1);
  const [renameVisible, setRenameVisible] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [renameTargetId, setRenameTargetId] = useState<number | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selected, setSelected] = useState<{ id: number; name: string } | null>(null);

  function openOptions(id: number, name: string) {
    setSelected({ id, name });
    setSheetVisible(true);
  }

  let content: React.ReactNode;

  if (isLoading) {
    content = (
      <View className={styles.centerBox}>
        <ActivityIndicator color="#fff" />
        <Text className={styles.centerText}>Listeler yükleniyor…</Text>
      </View>
    );
  } else if (isError) {
    content = (
      <View className={styles.errorBox}>
        <Text className={styles.errorTitle}>Bir hata oluştu</Text>
        <Pressable onPress={refetchAll} className={styles.btnWrapper}>
          <LinearGradient
            colors={['#111827', '#0b1220'] as const}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className={styles.btn}
          >
            <Text className={styles.btnText}>Tekrar dene</Text>
          </LinearGradient>
        </Pressable>
      </View>
    );
  } else {
    content = (
      <FlatList
        data={lists}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl tintColor="#fff" refreshing={isRefetching} onRefresh={refetchAll} />
        }
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 16 }}
        ListEmptyComponent={<Text className={styles.emptyText}>Hiç liste yok.</Text>}
        renderItem={({ item }) => (
          <ListCard
            item={item}
            onLongPress={() => openOptions(item.id, item.name)}
            onDelete={() => {
              setSelected({ id: item.id, name: item.name });
              setConfirmVisible(true);
            }}
          />
        )}
        ListHeaderComponent={
          <Pressable
            onPress={() => {
              const name = `Yeni Liste ${counter}`;
              setCounter((c) => c + 1);
              createList(name);
            }}
            className={styles.addBtnWrapper}
          >
            <LinearGradient
              colors={['#111827', '#0b1220'] as const}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className={styles.addBtn}
            >
              <Text className={styles.addBtnText}>+ Liste Ekle</Text>
            </LinearGradient>
          </Pressable>
        }
      />
    );
  }

  return (
    <Container className={styles.root}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <BackgroundGradient />

      <View style={{ paddingTop: insets.top + 10 }} className={styles.headerWrap}>
        <View className={styles.headerTitleWrap}>
          <Text className={styles.headerSubtitle}>Hoş Geldin</Text>
          <Text className={styles.headerTitle}>Listelerin</Text>
        </View>

        <BlurView intensity={30} tint="light" className={styles.searchBarWrap}>
          <View className={styles.searchBarInner}>
            <View className={styles.searchInputWrap}>
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Listelerde ara…"
                placeholderTextColor="rgba(255,255,255,0.6)"
                className={styles.searchInput}
              />
            </View>

            <Pressable
              onPress={() => {
                const name = `Yeni Liste ${counter}`;
                setCounter((c) => c + 1);
                createList(name);
              }}
              className={styles.miniBtnWrapper}
            >
              <LinearGradient
                colors={['#111827', '#0b1220'] as const}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className={styles.miniBtn}
              >
                <Text className={styles.miniBtnText}>+ Ekle</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </BlurView>
      </View>

      {/* recent strip */}
      {debounced.length === 0 && (
        <View className={styles.recentWrap}>
          <RecentListsStrip title="Son oluşturulanlar" items={recentLists} />
        </View>
      )}

      {/* content */}
      {content}

      <GlassActionSheet
        visible={sheetVisible}
        title={selected?.name}
        backdropOpacity={0.75} // daha koyu arka plan
        intensity={65} // daha güçlü blur
        onClose={() => setSheetVisible(false)}
        actions={[
          {
            key: 'rename',
            label: 'Yeniden adlandır',
            onPress: () => {
              setSheetVisible(false);
              if (selected) {
                // mevcut rename modal akışın
                setRenameTargetId(selected.id);
                setRenameValue(selected.name);
                setRenameVisible(true);
              }
            },
          },
          {
            key: 'delete',
            label: 'Sil',
            destructive: true,
            onPress: () => {
              setSheetVisible(false);
              setConfirmVisible(true);
            },
          },
        ]}
      />

      {/* Silme onayı */}
      <ConfirmGlassDialog
        visible={confirmVisible}
        title="Bu liste silinecek"
        message={`“${selected?.name ?? ''}” kalıcı olarak silinecek.`}
        confirmText="Sil"
        destructive
        onCancel={() => setConfirmVisible(false)}
        onConfirm={() => {
          if (selected) deleteList(selected.id);
        }}
      />
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
  root: 'flex-1 bg-transparent',
  headerWrap: 'px-6',
  headerTitleWrap: 'mb-3',
  headerSubtitle: 'text-white/90 text-xs',
  headerTitle: 'text-white font-extrabold text-2xl',
  searchBarWrap: 'rounded-2xl overflow-hidden border border-white/20',
  searchBarInner: 'bg-white/10 px-3 py-2 flex-row items-center',
  searchInputWrap: 'flex-1',
  searchInput: 'px-2 py-2 text-white',
  miniBtnWrapper: 'rounded-2xl overflow-hidden',
  miniBtn: 'px-4 py-2 items-center justify-center',
  miniBtnText: 'text-white font-bold',
  recentWrap: 'pt-3 pb-3',
  centerBox: 'flex-1 items-center justify-center',
  centerText: 'mt-2 text-white/80',
  errorBox: 'flex-1 items-center justify-center px-4',
  errorTitle: 'font-semibold text-base mb-2 text-white',
  btnWrapper: 'rounded-2xl overflow-hidden',
  btn: 'px-4 py-3 items-center',
  btnText: 'text-white font-bold',
  addBtnWrapper: 'rounded-2xl overflow-hidden self-start mb-4',
  addBtn: 'px-4 py-3 items-center justify-center',
  addBtnText: 'text-white font-semibold',
  emptyText: 'text-center mt-6 text-white/80',
} as const;
