import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from 'react-native';

import Container from '@/components/Container';
import useDebouncedValue from '@/hooks/useDebouncedValue';
import { listsKeys } from '@/queries/keys';
import { getListById } from '@/queries/lists';
import type { Priority, Status, TaskItem } from '@/types/tasks';
import TaskCard from '../components/TaskCard';
import TaskFormModal from '../components/TaskFormModal';
import useTasksData from '../hooks/useTasksData';

const Tabs = ['all', 'upcoming', 'completed'] as const;
const Statuses: Status[] = ['not_started', 'in_progress', 'completed'];
const Priorities: Priority[] = ['low', 'medium', 'high'];

// nested ternary yerine map kullan
const tabLabels: Record<(typeof Tabs)[number], string> = {
  all: 'Tümü',
  upcoming: 'Yaklaşan',
  completed: 'Tamamlanan',
};

const TasksScreen = () => {
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
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<Priority | null>(null);

  const {
    displayTasks,
    completedCount,
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
    tab,
    statusFilter,
    priorityFilter,
  });

  const [createVisible, setCreateVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editing, setEditing] = useState<TaskItem | null>(null);

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
        <Text>Geçersiz id</Text>
      </View>
    );
  }

  let content: React.ReactNode;

  if (isAnyLoading && displayTasks.length === 0) {
    content = (
      <View className={styles.center}>
        <ActivityIndicator />
        <Text className={styles.centerTextGap}>Görevler yükleniyor…</Text>
      </View>
    );
  } else if (isAnyError) {
    content = (
      <View className={styles.centerPad}>
        <Text className={styles.errorTitle}>Bir hata oluştu</Text>
        <Pressable onPress={refetchAll}>
          <Text className={styles.retryBtnText}>Tekrar dene</Text>
        </Pressable>
      </View>
    );
  } else {
    content = (
      <>
        <View className={styles.headerWrap}>
          <Text className={styles.listTitle}>{listQ.data?.name ?? 'Liste'}</Text>
          <View className={styles.pillsRow}>
            {Tabs.map((t) => (
              <Pill
                key={t}
                label={tabLabels[t]} // burada artık nested ternary yok
                active={tab === t}
                onPress={() => setTab(t)}
              />
            ))}
          </View>
          <View>
            <Text className={styles.searchLabel}>Ara</Text>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Görevlerde ara…"
              className={styles.searchInput}
              placeholderTextColor="#9ca3af"
              returnKeyType="search"
            />
          </View>
        </View>
        <View className={styles.filtersWrap}>
          <View className={styles.pillsRow}>
            {Statuses.map((s) => (
              <Pill
                key={s}
                label={`durum: ${s}`}
                active={statusFilter === s}
                onPress={() => setStatusFilter(statusFilter === s ? null : s)}
              />
            ))}
          </View>
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
        <FlatList
          data={displayTasks}
          keyExtractor={(item) => String(item.id)}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetchAll} />}
          contentContainerStyle={styles.listContentPad}
          ListHeaderComponent={
            <View className={styles.listTopRow}>
              <Text className="font-bold">
                Görevler • Tamamlanan: {completedCount}/{displayTasks.length}
              </Text>
              <Pressable
                onPress={() => setCreateVisible(true)}
                className={styles.addBtn}
                style={({ pressed }) => [{ opacity: pressed ? 0.95 : 1 }]}
              >
                <Text className={styles.addBtnText}>+ Görev Ekle</Text>
              </Pressable>
            </View>
          }
          ListEmptyComponent={<Text>Görev bulunamadı.</Text>}
          renderItem={({ item }) => (
            <TaskCard
              item={item}
              onToggle={toggleTask}
              onEdit={openEdit}
              onDelete={(taskId) =>
                Alert.alert('Görevi sil', 'Bu görev kalıcı olarak silinecek. Emin misin?', [
                  { text: 'Vazgeç', style: 'cancel' },
                  { text: 'Sil', style: 'destructive', onPress: () => deleteTask(taskId) },
                ])
              }
            />
          )}
        />
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
      </>
    );
  }

  return <Container className={styles.root}>{content}</Container>;
};

export default TasksScreen;

const styles = {
  root: 'bg-white',
  center: 'flex-1 items-center justify-center',
  centerTextGap: 'mt-2',
  centerPad: 'flex-1 items-center justify-center p-4',
  errorTitle: 'mb-2 text-base font-semibold',
  retryBtnText: 'mt-3 text-blue-500',
  headerWrap: 'px-4 pt-4',
  listTitle: 'mb-2 text-lg font-extrabold',
  pillsRow: 'mb-2 flex-row',
  pill: 'mr-2 rounded-xl border px-3 py-2',
  pillActive: 'border-blue-500',
  pillInactive: 'border-black/15',
  pillTextActive: 'font-extrabold text-blue-500',
  pillTextInactive: 'font-semibold',
  searchWrap: 'px-4',
  searchLabel: 'mb-1 font-semibold',
  searchInput: 'mb-2 rounded-xl border border-black/10 bg-white px-3 py-2',
  filtersWrap: 'mb-2 px-4',
  listContentPad: { padding: 16 },
  listTopRow: 'mb-3 flex-row items-center justify-between',
  addBtn: 'rounded-xl border border-black/15 bg-white px-3 py-2',
  addBtnText: 'font-semibold',
} as const;
