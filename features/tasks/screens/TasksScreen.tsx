import ConfirmGlassDialog from '@/components/ConfirmGlassDialog';
import Container from '@/components/Container';

import BackgroundGradient from '@/components/BackgroundGradient';
import useDebouncedValue from '@/hooks/useDebouncedValue';
import { listsKeys } from '@/queries/keys';
import { getListById } from '@/queries/lists';
import type { Priority, TaskItem } from '@/types/tasks';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
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
import TaskCard from '../components/TaskCard';
import TaskFormModal from '../components/TaskFormModal';
import useTasksData from '../hooks/useTasksData';

const Tabs = ['all', 'upcoming', 'completed'] as const;
const Priorities: Priority[] = ['low', 'medium', 'high'];

const tabLabels: Record<(typeof Tabs)[number], string> = {
  all: 'Tümü',
  upcoming: 'Yaklaşan',
  completed: 'Tamamlanan',
};

const TasksScreen = () => {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const listId = Number(id);
  const validListId = Number.isFinite(listId);

  const listQ = useQuery({
    queryKey: [...listsKeys.all, 'detail', listId],
    queryFn: () => getListById(listId),
    enabled: validListId,
    staleTime: 30_000,
  });

  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search, 400);

  const [tab, setTab] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | null>(null);

  const {
    displayTasks, // hook’un verdiği temel liste
    completedCount, // tamamlanan sayısı (tüm listeye göre)
    isAnyLoading,
    isAnyError,
    isRefetching,
    refetchAll,
    toggleTask,
    createTask,
    editTask,
    deleteTask,
  } = useTasksData({
    listId,
    search: debounced,
    tab, // hook desteklemese bile aşağıda güvenli client-side filtre var
    statusFilter: null, // status filtrelerini kaldırdık
    priorityFilter, // sadece öncelik filtresi
  });

  // Sekme davranışını garantiye almak için client-side filtre:
  const tasksForRender = useMemo(() => {
    let arr = [...displayTasks];

    // priority filtresi
    if (priorityFilter)
      arr = arr.filter((t) => (t.priority as Priority | undefined) === priorityFilter);

    const nowIso = new Date().toISOString();

    if (tab === 'upcoming') {
      // due_date > now && !is_completed
      arr = arr.filter((t) => !!t.due_date && t.due_date > nowIso && !t.is_completed);
      // yaklaşanları yakın tarihten uzağa doğru göstermek istersen:
      arr.sort((a, b) => (a.due_date! > b.due_date! ? 1 : -1));
    } else if (tab === 'completed') {
      arr = arr.filter((t) => !!t.is_completed);
      // en son tamamlananlar üstte:
      arr.sort((a, b) => (b.updated_at ?? '').localeCompare(a.updated_at ?? ''));
    }
    // tab === 'all' ise dokunma
    return arr;
  }, [displayTasks, priorityFilter, tab]);

  const [createVisible, setCreateVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editing, setEditing] = useState<TaskItem | null>(null);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<number | null>(null);

  const openEdit = useCallback((t: TaskItem) => {
    setEditing(t);
    setEditVisible(true);
  }, []);

  const Pill = useCallback(
    ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
      <Pressable
        onPress={onPress}
        className={[styles.pill, active ? styles.pillActive : styles.pillInactive].join(' ')}
        style={({ pressed }) => [{ opacity: pressed ? 0.95 : 1 }]}
      >
        <Text className={active ? styles.pillTextActive : styles.pillTextInactive}>{label}</Text>
      </Pressable>
    ),
    [],
  );

  if (!validListId) {
    return (
      <View className={styles.centerPad}>
        <Text className="text-white">Geçersiz id</Text>
      </View>
    );
  }

  let content: React.ReactNode;

  if (isAnyLoading && displayTasks.length === 0) {
    content = (
      <View className={styles.center}>
        <ActivityIndicator color="#fff" />
        <Text className={styles.centerTextGap}>Görevler yükleniyor…</Text>
      </View>
    );
  } else if (isAnyError) {
    content = (
      <View className={styles.centerPad}>
        <Text className={styles.errorTitle}>Bir hata oluştu</Text>
        <Pressable onPress={refetchAll} className={styles.retryWrap}>
          <LinearGradient
            colors={['#111827', '#0b1220'] as const}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className={styles.retryBtn}
          >
            <Text className={styles.retryText}>Tekrar dene</Text>
          </LinearGradient>
        </Pressable>
      </View>
    );
  } else {
    content = (
      <>
        {/* Header */}
        <View style={{ paddingTop: insets.top + 10 }} className={styles.headerWrap}>
          <Text className={styles.listTitle}>{listQ.data?.name ?? 'Liste'}</Text>

          {/* Tabs */}
          <View className={styles.pillsRow}>
            {Tabs.map((t) => (
              <Pill key={t} label={tabLabels[t]} active={tab === t} onPress={() => setTab(t)} />
            ))}
          </View>

          {/* Search */}
          <View>
            <Text className={styles.searchLabel}>Ara</Text>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Görevlerde ara…"
              className={styles.searchInput}
              placeholderTextColor="rgba(229,231,235,0.7)"
              returnKeyType="search"
            />
          </View>
        </View>

        {/* Filters (sadece öncelik) */}
        <View className={styles.filtersWrap}>
          <View className={styles.pillsRow}>
            {Priorities.map((p) => (
              <Pill
                key={p}
                label={`öncelik: ${p}`}
                active={priorityFilter === p}
                onPress={() => setPriorityFilter(priorityFilter === p ? null : p)}
              />
            ))}
          </View>
        </View>

        {/* List */}
        <FlatList
          data={tasksForRender}
          keyExtractor={(item) => String(item.id)}
          refreshControl={
            <RefreshControl tintColor="#fff" refreshing={isRefetching} onRefresh={refetchAll} />
          }
          contentContainerStyle={styles.listContentPad}
          ListHeaderComponent={
            <View className={styles.listTopRow}>
              <Text className="font-bold text-white">
                Görevler • Tamamlanan: {completedCount}/{tasksForRender.length}
              </Text>
              <Pressable
                onPress={() => setCreateVisible(true)}
                className={styles.addBtnWrap}
                style={({ pressed }) => [{ opacity: pressed ? 0.95 : 1 }]}
              >
                <LinearGradient
                  colors={['#111827', '#0b1220'] as const}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className={styles.addBtn}
                >
                  <Text className={styles.addBtnText}>+ Görev Ekle</Text>
                </LinearGradient>
              </Pressable>
            </View>
          }
          ListEmptyComponent={<Text className="text-white/80">Görev bulunamadı.</Text>}
          renderItem={({ item }) => (
            <TaskCard
              item={item}
              onToggle={toggleTask}
              onEdit={openEdit}
              onDelete={(taskId) => {
                setToDeleteId(taskId);
                setConfirmVisible(true);
              }}
            />
          )}
        />

        {/* Create & Edit */}
        <TaskFormModal
          visible={createVisible}
          mode="create"
          onClose={() => setCreateVisible(false)}
          onSubmit={(p) => createTask(p)}
        />
        <TaskFormModal
          visible={editVisible}
          mode="edit"
          initial={{
            name: editing?.name,
            description: editing?.description ?? '',
            priority: (editing?.priority as Priority) ?? 'medium',
          }}
          onClose={() => setEditVisible(false)}
          onSubmit={(p) => {
            if (!editing) return;
            editTask({ id: editing.id, ...p });
          }}
        />

        {/* Delete confirm */}
        <ConfirmGlassDialog
          visible={confirmVisible}
          title="Bu görev silinecek"
          message="Bu işlem geri alınamaz."
          confirmText="Sil"
          destructive
          onCancel={() => setConfirmVisible(false)}
          onConfirm={() => {
            if (toDeleteId !== null) deleteTask(toDeleteId);
          }}
        />
      </>
    );
  }

  return (
    <Container className={styles.root}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <BackgroundGradient />
      {content}
    </Container>
  );
};

export default TasksScreen;

const styles = {
  root: 'flex-1 bg-transparent',
  center: 'flex-1 items-center justify-center',
  centerTextGap: 'mt-2 text-white/80',
  centerPad: 'flex-1 items-center justify-center p-4',
  errorTitle: 'mb-2 text-base font-semibold text-white',
  retryWrap: 'rounded-2xl overflow-hidden',
  retryBtn: 'px-4 py-3 items-center',
  retryText: 'text-white font-bold',

  headerWrap: 'px-4 pt-4',
  listTitle: 'mb-2 text-lg font-extrabold text-white',
  pillsRow: 'mb-2 flex-row',
  pill: 'mr-2 rounded-xl border px-3 py-2',
  pillActive: 'border-emerald-400 bg-emerald-500/10',
  pillInactive: 'border-white/25 bg-white/10',
  pillTextActive: 'font-extrabold text-emerald-300',
  pillTextInactive: 'font-semibold text-white',

  searchLabel: 'mb-1 font-semibold text-white',
  searchInput: 'mb-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white',

  filtersWrap: 'mb-2 px-4',

  listContentPad: { padding: 16 } as const,
  listTopRow: 'mb-3 flex-row items-center justify-between',
  addBtnWrap: 'rounded-2xl overflow-hidden',
  addBtn: 'px-4 py-3 items-center justify-center',
  addBtnText: 'font-semibold text-white',
} as const;
