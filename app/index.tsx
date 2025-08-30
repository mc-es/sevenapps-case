import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { listsKeys } from '../queries/keys';
import {
  createList,
  deleteList,
  getAllLists,
  getRecentLists,
  searchListsByName,
  updateList,
} from '../queries/lists';

// küçük debounce helper (hook sırası sabit kalır)
function useDebouncedValue<T>(value: T, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

type ListItem = {
  id: number;
  name: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export default function IndexScreen() {
  const qc = useQueryClient();

  // --- Search state
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search, 400);

  // --- Queries (hepsi sabit sırada tanımlı; enabled ile yönet)
  const allListsQ = useQuery({
    queryKey: listsKeys.all,
    queryFn: getAllLists,
    staleTime: 10_000,
    enabled: debounced.length === 0,
  });

  const searchListsQ = useQuery({
    queryKey: [...listsKeys.all, 'search', debounced],
    queryFn: () => searchListsByName(debounced),
    enabled: debounced.length > 0,
    staleTime: 5_000,
  });

  const recentListsQ = useQuery({
    queryKey: [...listsKeys.all, 'recent', 5],
    queryFn: () => getRecentLists(5),
    staleTime: 30_000,
  });

  // --- CREATE (optimistic)
  const [counter, setCounter] = useState(1);
  const createListMutation = useMutation({
    mutationFn: (name: string) => createList(name),
    onMutate: async (name) => {
      await qc.cancelQueries({ queryKey: listsKeys.all });
      const prev = (qc.getQueryData(listsKeys.all) as ListItem[]) ?? [];
      const optimistic: ListItem[] = [
        ...prev,
        { id: Math.random(), name, created_at: new Date().toISOString(), updated_at: null },
      ];
      qc.setQueryData(listsKeys.all, optimistic);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(listsKeys.all, ctx.prev);
      Alert.alert('Hata', 'Liste ekleme başarısız oldu.');
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: listsKeys.all });
      qc.invalidateQueries({ queryKey: [...listsKeys.all, 'recent', 5] });
    },
  });

  // --- UPDATE (rename, optimistic)
  const [renameVisible, setRenameVisible] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [renameTargetId, setRenameTargetId] = useState<number | null>(null);

  const renameMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => updateList(id, name),
    onMutate: async ({ id, name }) => {
      await qc.cancelQueries({ queryKey: listsKeys.all });
      const prev = (qc.getQueryData(listsKeys.all) as ListItem[]) ?? [];
      const next = prev.map((l) =>
        l.id === id ? { ...l, name, updated_at: new Date().toISOString() } : l,
      );
      qc.setQueryData(listsKeys.all, next);
      return { prev };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(listsKeys.all, ctx.prev);
      Alert.alert('Hata', 'Yeniden adlandırma başarısız oldu.');
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: listsKeys.all });
      qc.invalidateQueries({ queryKey: [...listsKeys.all, 'recent', 5] });
    },
  });

  // --- DELETE (optimistic)
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteList(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: listsKeys.all });
      const prev = (qc.getQueryData(listsKeys.all) as ListItem[]) ?? [];
      const next = prev.filter((l) => l.id !== id);
      qc.setQueryData(listsKeys.all, next);
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(listsKeys.all, ctx.prev);
      Alert.alert('Hata', 'Silme işlemi başarısız oldu.');
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: listsKeys.all });
      qc.invalidateQueries({ queryKey: [...listsKeys.all, 'recent', 5] });
    },
  });

  // helpers
  function openRename(id: number, currentName: string) {
    setRenameTargetId(id);
    setRenameValue(currentName);
    setRenameVisible(true);
  }

  function confirmDelete(id: number) {
    Alert.alert('Listeyi sil', 'Bu liste kalıcı olarak silinecek. Emin misin?', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: () => deleteMutation.mutate(id) },
    ]);
  }

  // --- Derivations
  const isLoading = allListsQ.isLoading || searchListsQ.isLoading;
  const isError = allListsQ.isError || searchListsQ.isError;
  const lists: ListItem[] =
    (debounced.length > 0 ? (searchListsQ.data as ListItem[]) : (allListsQ.data as ListItem[])) ??
    [];

  return (
    <View style={{ flex: 1 }}>
      {/* Search Input */}
      <View style={{ padding: 16, paddingBottom: 0 }}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Listelerde ara…"
          style={{
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.12)',
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 10,
          }}
        />
      </View>

      {/* Recent strip (sadece arama yokken göster) */}
      {debounced.length === 0 && (recentListsQ.data?.length ?? 0) > 0 && (
        <View style={{ paddingTop: 12 }}>
          <Text style={{ fontWeight: '700', paddingHorizontal: 16, marginBottom: 8 }}>
            Son oluşturulanlar
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {(recentListsQ.data as ListItem[]).map((it) => (
              <Link
                key={it.id}
                href={{ pathname: '/details', params: { id: String(it.id) } }}
                asChild
              >
                <Pressable
                  style={{
                    padding: 10,
                    borderWidth: 1,
                    borderColor: 'rgba(0,0,0,0.12)',
                    borderRadius: 12,
                    marginRight: 10,
                    minWidth: 140,
                  }}
                >
                  <Text numberOfLines={1} style={{ fontWeight: '600' }}>
                    {it.name}
                  </Text>
                  {!!it.created_at && (
                    <Text style={{ opacity: 0.6, fontSize: 11 }}>
                      {new Date(it.created_at).toLocaleString()}
                    </Text>
                  )}
                </Pressable>
              </Link>
            ))}
          </ScrollView>
        </View>
      )}

      {/* List body */}
      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8 }}>Listeler yükleniyor…</Text>
        </View>
      ) : isError ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <Text style={{ fontWeight: '600', fontSize: 16, marginBottom: 8 }}>Bir hata oluştu</Text>
          <Text
            onPress={() => {
              allListsQ.refetch();
              searchListsQ.refetch();
              recentListsQ.refetch();
            }}
            style={{ marginTop: 12, color: '#3b82f6' }}
          >
            Tekrar dene
          </Text>
        </View>
      ) : (
        <FlatList
          data={lists}
          keyExtractor={(item) => String(item.id)}
          refreshControl={
            <RefreshControl
              refreshing={allListsQ.isRefetching || searchListsQ.isRefetching}
              onRefresh={() => (debounced.length ? searchListsQ.refetch() : allListsQ.refetch())}
            />
          }
          contentContainerStyle={{ padding: 16 }}
          ListHeaderComponent={
            <Pressable
              onPress={() => {
                const name = `Yeni Liste ${counter}`;
                setCounter((c) => c + 1);
                createListMutation.mutate(name);
              }}
              style={{
                padding: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: 'rgba(0,0,0,0.12)',
                marginBottom: 16,
                alignSelf: 'flex-start',
              }}
            >
              <Text style={{ fontWeight: '600' }}>+ Liste Ekle</Text>
            </Pressable>
          }
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 24 }}>Hiç liste yok.</Text>
          }
          renderItem={({ item }) => (
            <Link href={{ pathname: '/details', params: { id: String(item.id) } }} asChild>
              <Pressable
                onLongPress={() =>
                  Alert.alert(item.name, undefined, [
                    { text: 'Yeniden adlandır', onPress: () => openRename(item.id, item.name) },
                    { text: 'Sil', style: 'destructive', onPress: () => confirmDelete(item.id) },
                    { text: 'Kapat', style: 'cancel' },
                  ])
                }
                style={{
                  padding: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: 'rgba(0,0,0,0.08)',
                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text numberOfLines={1} style={{ fontWeight: '600' }}>
                      {item.name}
                    </Text>
                    {!!item.created_at && (
                      <Text style={{ opacity: 0.6, fontSize: 12 }}>
                        oluşturma: {new Date(item.created_at).toLocaleString()}
                      </Text>
                    )}
                  </View>

                  <Pressable
                    onPress={(e) => {
                      e.preventDefault();
                      confirmDelete(item.id);
                    }}
                    hitSlop={8}
                    style={{ paddingHorizontal: 8, paddingVertical: 4 }}
                  >
                    <Text style={{ color: '#ef4444', fontWeight: '700' }}>Sil</Text>
                  </Pressable>
                </View>
              </Pressable>
            </Link>
          )}
        />
      )}

      {/* Rename Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={renameVisible}
        onRequestClose={() => setRenameVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16 }}>
            <Text style={{ fontWeight: '700', fontSize: 16, marginBottom: 8 }}>
              Yeniden adlandır
            </Text>
            <TextInput
              value={renameValue}
              onChangeText={setRenameValue}
              placeholder="Yeni ad"
              autoFocus
              style={{
                borderWidth: 1,
                borderColor: 'rgba(0,0,0,0.12)',
                borderRadius: 8,
                padding: 10,
                marginBottom: 12,
              }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 16 }}>
              <Pressable onPress={() => setRenameVisible(false)}>
                <Text>Vazgeç</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (!renameTargetId || !renameValue.trim()) {
                    setRenameVisible(false);
                    return;
                  }
                  renameMutation.mutate({ id: renameTargetId, name: renameValue.trim() });
                  setRenameVisible(false);
                }}
              >
                <Text style={{ color: '#3b82f6', fontWeight: '700' }}>Kaydet</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
