import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from 'react-native';
import { z } from 'zod';
import { listsKeys, tasksKeys } from '../queries/keys';
import { getListById } from '../queries/lists';
import {
  createTask,
  deleteTask,
  getCompletedTasks,
  getTasksByListId,
  getTasksByPriority,
  getTasksByStatus,
  getUpcomingTasks,
  searchTasksByName,
  toggleTaskCompletion,
  updateTask,
} from '../queries/tasks';

type Priority = 'low' | 'medium' | 'high';

type TaskItem = {
  id: number;
  name: string;
  description?: string | null;
  status?: string | null;
  priority?: Priority | null;
  is_completed?: boolean | null;
  due_date?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
  list_id: number;
};

type ListItem = { id: number; name: string };

function useDebouncedValue<T>(value: T, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

const TaskFormSchema = z.object({
  name: z.string().min(1, 'Ad zorunlu').max(120, 'En fazla 120 karakter'),
  description: z.string().max(500, 'En fazla 500 karakter').optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const listId = Number(id);
  const validListId = Number.isFinite(listId);
  const qc = useQueryClient();

  // ---- Header için liste bilgisi
  const listQ = useQuery({
    queryKey: [...listsKeys.all, 'detail', listId],
    queryFn: () => getListById(listId),
    enabled: validListId,
    staleTime: 30_000,
  });

  // ---- Arama & Filtre & Sekme
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search, 400);

  const [tab, setTab] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [statusFilter, setStatusFilter] = useState<string | null>(null); // not_started | in_progress | completed
  const [priorityFilter, setPriorityFilter] = useState<Priority | null>(null);

  // ---- Base list tasks
  const listTasksQ = useQuery({
    queryKey: tasksKeys.byList(listId),
    queryFn: () => getTasksByListId(listId),
    enabled: validListId,
    staleTime: 10_000,
  });

  // ---- Search tasks (global) + listId filtre
  const searchTasksQ = useQuery({
    queryKey: [...tasksKeys.byList(listId), 'search', debounced],
    queryFn: () => searchTasksByName(debounced),
    enabled: validListId && debounced.length > 0,
    staleTime: 5_000,
  });

  // ---- Status & Priority (global) + listId filtre
  const statusTasksQ = useQuery({
    queryKey: [...tasksKeys.byList(listId), 'status', statusFilter],
    queryFn: () => getTasksByStatus(statusFilter as string),
    enabled: validListId && !!statusFilter,
    staleTime: 10_000,
  });

  const priorityTasksQ = useQuery({
    queryKey: [...tasksKeys.byList(listId), 'priority', priorityFilter],
    queryFn: () => getTasksByPriority(priorityFilter as string),
    enabled: validListId && !!priorityFilter,
    staleTime: 10_000,
  });

  // ---- Tabs: upcoming & completed (global) + listId filtre
  const upcomingQ = useQuery({
    queryKey: [...tasksKeys.byList(listId), 'upcoming'],
    queryFn: getUpcomingTasks,
    enabled: validListId && tab === 'upcoming',
    staleTime: 10_000,
  });

  const completedQ = useQuery({
    queryKey: [...tasksKeys.byList(listId), 'completed'],
    queryFn: getCompletedTasks,
    enabled: validListId && tab === 'completed',
    staleTime: 10_000,
  });

  // ---- Mutations (toggle/create/delete/edit) — (ÖNCEKİ V1’DEKİ GİBİ)
  const toggleMutation = useMutation({
    mutationFn: ({ taskId, nextCompleted }: { taskId: number; nextCompleted: boolean }) =>
      toggleTaskCompletion(taskId, nextCompleted),
    onMutate: async ({ taskId, nextCompleted }) => {
      const key = tasksKeys.byList(listId);
      await qc.cancelQueries({ queryKey: key });
      const prev = (qc.getQueryData(key) as TaskItem[]) ?? [];
      const next = prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              is_completed: nextCompleted,
              status: nextCompleted ? 'completed' : (t.status ?? 'not_started'),
              updated_at: new Date().toISOString(),
            }
          : t,
      );
      qc.setQueryData(key, next);
      return { key, prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.key && ctx?.prev) qc.setQueryData(ctx.key, ctx.prev);
      Alert.alert('Hata', 'Görev durumu güncellenemedi.');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: tasksKeys.byList(listId) }),
  });

  function onTogglePress(task: TaskItem) {
    const current = !!task.is_completed;
    toggleMutation.mutate({ taskId: task.id, nextCompleted: !current });
  }

  const [createVisible, setCreateVisible] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPriority, setFormPriority] = useState<Priority>('medium');

  const createMutation = useMutation({
    mutationFn: (payload: { name: string; description?: string; priority: Priority }) =>
      createTask({
        name: payload.name,
        description: payload.description?.trim() ? payload.description.trim() : undefined,
        priority: payload.priority,
        status: 'not_started',
        is_completed: false,
        list_id: listId,
      }),
    onMutate: async (payload) => {
      const key = tasksKeys.byList(listId);
      await qc.cancelQueries({ queryKey: key });
      const prev = (qc.getQueryData(key) as TaskItem[]) ?? [];
      const optimisticTask: TaskItem = {
        id: Math.floor(Math.random() * 1e9),
        name: payload.name,
        description: payload.description ?? null,
        status: 'not_started',
        priority: payload.priority,
        is_completed: false,
        due_date: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        list_id: listId,
      };
      qc.setQueryData(key, [...prev, optimisticTask]);
      return { key, prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.key && ctx?.prev) qc.setQueryData(ctx.key, ctx.prev);
      Alert.alert('Hata', 'Görev ekleme başarısız oldu.');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: tasksKeys.byList(listId) }),
  });

  function submitCreate() {
    const parsed = TaskFormSchema.safeParse({
      name: formName.trim(),
      description: formDesc,
      priority: formPriority,
    });
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? 'Form hatası';
      Alert.alert('Form Hatası', msg);
      return;
    }
    createMutation.mutate(parsed.data);
    setCreateVisible(false);
    setFormName('');
    setFormDesc('');
    setFormPriority('medium');
  }

  const deleteMutation = useMutation({
    mutationFn: (taskId: number) => deleteTask(taskId),
    onMutate: async (taskId) => {
      const key = tasksKeys.byList(listId);
      await qc.cancelQueries({ queryKey: key });
      const prev = (qc.getQueryData(key) as TaskItem[]) ?? [];
      const next = prev.filter((t) => t.id !== taskId);
      qc.setQueryData(key, next);
      return { key, prev };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.key && ctx?.prev) qc.setQueryData(ctx.key, ctx.prev);
      Alert.alert('Hata', 'Silme işlemi başarısız oldu.');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: tasksKeys.byList(listId) }),
  });

  function confirmDelete(taskId: number) {
    Alert.alert('Görevi sil', 'Bu görev kalıcı olarak silinecek. Emin misin?', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: () => deleteMutation.mutate(taskId) },
    ]);
  }

  const [editVisible, setEditVisible] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPriority, setEditPriority] = useState<Priority>('medium');

  function openEdit(t: TaskItem) {
    setEditId(t.id);
    setEditName(t.name);
    setEditDesc(t.description ?? '');
    setEditPriority((t.priority as Priority) || 'medium');
    setEditVisible(true);
  }

  const editMutation = useMutation({
    mutationFn: (payload: { id: number; name: string; description?: string; priority: Priority }) =>
      updateTask(payload.id, {
        name: payload.name,
        description: payload.description?.trim() ? payload.description.trim() : undefined,
        priority: payload.priority,
      }),
    onMutate: async (payload) => {
      const key = tasksKeys.byList(listId);
      await qc.cancelQueries({ queryKey: key });
      const prev = (qc.getQueryData(key) as TaskItem[]) ?? [];
      const next = prev.map((t) =>
        t.id === payload.id
          ? {
              ...t,
              name: payload.name,
              description: payload.description ?? null,
              priority: payload.priority,
              updated_at: new Date().toISOString(),
            }
          : t,
      );
      qc.setQueryData(key, next);
      return { key, prev };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.key && ctx?.prev) qc.setQueryData(ctx.key, ctx.prev);
      Alert.alert('Hata', 'Görev güncellenemedi.');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: tasksKeys.byList(listId) }),
  });

  function submitEdit() {
    const parsed = TaskFormSchema.safeParse({
      name: editName.trim(),
      description: editDesc,
      priority: editPriority,
    });
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? 'Form hatası';
      Alert.alert('Form Hatası', msg);
      return;
    }
    if (!editId) return;
    editMutation.mutate({ id: editId, ...parsed.data });
    setEditVisible(false);
  }

  // ---- Derivations (tek noktada display veri seti seçimi)
  const baseTasks = (listTasksQ.data as TaskItem[]) ?? [];
  const searchSet = ((searchTasksQ.data as TaskItem[]) ?? []).filter((t) => t.list_id === listId);
  const statusSet = ((statusTasksQ.data as TaskItem[]) ?? []).filter((t) => t.list_id === listId);
  const prioritySet = ((priorityTasksQ.data as TaskItem[]) ?? []).filter(
    (t) => t.list_id === listId,
  );
  const upcomingSet = ((upcomingQ.data as TaskItem[]) ?? []).filter((t) => t.list_id === listId);
  const completedSet = ((completedQ.data as TaskItem[]) ?? []).filter((t) => t.list_id === listId);

  const displayTasks: TaskItem[] = useMemo(() => {
    // 1) Öncelik: Sekme “Yaklaşan/Tamamlanan”
    if (tab === 'upcoming') return upcomingSet;
    if (tab === 'completed') return completedSet;

    // 2) Arama aktifse
    if (debounced.length > 0) return searchSet;

    // 3) Filtreler
    if (statusFilter && priorityFilter) {
      // iki setin kesişimi
      const ids = new Set(prioritySet.map((t) => t.id));
      return statusSet.filter((t) => ids.has(t.id));
    }
    if (statusFilter) return statusSet;
    if (priorityFilter) return prioritySet;

    // 4) Varsayılan
    return baseTasks;
  }, [
    tab,
    debounced,
    statusFilter,
    priorityFilter,
    baseTasks,
    searchSet,
    statusSet,
    prioritySet,
    upcomingSet,
    completedSet,
  ]);

  const completedCount = useMemo(
    () => displayTasks.filter((t) => t.is_completed).length,
    [displayTasks],
  );

  function getStatusLabel(t: TaskItem) {
    if (t.is_completed) return 'completed';
    return (t.status as string) ?? 'not_started';
  }

  // ---- UI
  const isAnyLoading =
    listTasksQ.isLoading ||
    searchTasksQ.isLoading ||
    statusTasksQ.isLoading ||
    priorityTasksQ.isLoading ||
    upcomingQ.isLoading ||
    completedQ.isLoading;

  const isAnyError =
    listTasksQ.isError ||
    searchTasksQ.isError ||
    statusTasksQ.isError ||
    priorityTasksQ.isError ||
    upcomingQ.isError ||
    completedQ.isError;

  return (
    <View style={{ flex: 1 }}>
      {!validListId ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <Text>Geçersiz id</Text>
        </View>
      ) : isAnyLoading && displayTasks.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8 }}>Görevler yükleniyor…</Text>
        </View>
      ) : isAnyError ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <Text style={{ fontWeight: '600', fontSize: 16, marginBottom: 8 }}>Bir hata oluştu</Text>
          <Text
            onPress={() => {
              listTasksQ.refetch();
              searchTasksQ.refetch();
              statusTasksQ.refetch();
              priorityTasksQ.refetch();
              upcomingQ.refetch();
              completedQ.refetch();
            }}
            style={{ marginTop: 12, color: '#3b82f6' }}
          >
            Tekrar dene
          </Text>
        </View>
      ) : (
        <>
          {/* Header: Liste adı + Sekmeler + Arama + Filtreler */}
          <View style={{ padding: 16, paddingBottom: 0 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', marginBottom: 8 }}>
              {(listQ.data as ListItem)?.name ?? 'Liste'}
            </Text>

            {/* Sekmeler */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
              {(['all', 'upcoming', 'completed'] as const).map((t) => {
                const active = tab === t;
                const label = t === 'all' ? 'Tümü' : t === 'upcoming' ? 'Yaklaşan' : 'Tamamlanan';
                return (
                  <Pressable
                    key={t}
                    onPress={() => setTab(t)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: active ? '#3b82f6' : 'rgba(0,0,0,0.15)',
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: active ? '800' : '600',
                        color: active ? '#3b82f6' : undefined,
                      }}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Arama */}
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Görevlerde ara…"
              style={{
                borderWidth: 1,
                borderColor: 'rgba(0,0,0,0.12)',
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 10,
                marginBottom: 8,
              }}
            />

            {/* Filtreler */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
              {(['not_started', 'in_progress', 'completed'] as const).map((s) => {
                const active = statusFilter === s;
                return (
                  <Pressable
                    key={s}
                    onPress={() => setStatusFilter(active ? null : s)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: active ? '#3b82f6' : 'rgba(0,0,0,0.15)',
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: active ? '800' : '600',
                        color: active ? '#3b82f6' : undefined,
                      }}
                    >
                      durum: {s}
                    </Text>
                  </Pressable>
                );
              })}

              {(['low', 'medium', 'high'] as Priority[]).map((p) => {
                const active = priorityFilter === p;
                return (
                  <Pressable
                    key={p}
                    onPress={() => setPriorityFilter(active ? null : p)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: active ? '#3b82f6' : 'rgba(0,0,0,0.15)',
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: active ? '800' : '600',
                        color: active ? '#3b82f6' : undefined,
                      }}
                    >
                      öncelik: {p}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <FlatList
            data={displayTasks}
            keyExtractor={(item) => String(item.id)}
            refreshControl={
              <RefreshControl
                refreshing={listTasksQ.isRefetching}
                onRefresh={() => listTasksQ.refetch()}
              />
            }
            contentContainerStyle={{ padding: 16 }}
            ListHeaderComponent={
              <View
                style={{ marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between' }}
              >
                <Text style={{ fontWeight: '700' }}>
                  Görevler • Tamamlanan: {completedCount}/{displayTasks.length}
                </Text>
                <Pressable
                  onPress={() => setCreateVisible(true)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: 'rgba(0,0,0,0.15)',
                  }}
                >
                  <Text style={{ fontWeight: '600' }}>+ Görev Ekle</Text>
                </Pressable>
              </View>
            }
            ListEmptyComponent={<Text>Görev bulunamadı.</Text>}
            renderItem={({ item }) => {
              const done = !!item.is_completed;
              const statusLabel = getStatusLabel(item);
              return (
                <Pressable
                  onPress={() => onTogglePress(item)}
                  onLongPress={() =>
                    Alert.alert(item.name, undefined, [
                      { text: done ? 'Geri Al' : 'Tamamla', onPress: () => onTogglePress(item) },
                      { text: 'Düzenle', onPress: () => openEdit(item) },
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
                    backgroundColor: done ? 'rgba(16,185,129,0.06)' : 'white',
                    opacity: toggleMutation.isPending ? 0.9 : 1,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 6,
                        borderWidth: 2,
                        borderColor: done ? '#10b981' : 'rgba(0,0,0,0.25)',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 10,
                      }}
                    >
                      {done ? <Text style={{ fontWeight: '900', color: '#10b981' }}>✓</Text> : null}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        numberOfLines={1}
                        style={{
                          fontWeight: '600',
                          textDecorationLine: done ? 'line-through' : 'none',
                          opacity: done ? 0.6 : 1,
                        }}
                      >
                        {item.name}
                      </Text>
                      {!!item.description && (
                        <Text
                          numberOfLines={2}
                          style={{
                            opacity: 0.8,
                            textDecorationLine: done ? 'line-through' : 'none',
                          }}
                        >
                          {item.description}
                        </Text>
                      )}
                      <Text style={{ opacity: 0.6, fontSize: 12 }}>
                        durum: {statusLabel} • öncelik: {item.priority ?? 'none'}
                      </Text>
                    </View>

                    <Pressable
                      onPress={() => confirmDelete(item.id)}
                      hitSlop={8}
                      style={{ paddingHorizontal: 8, paddingVertical: 4 }}
                    >
                      <Text style={{ color: '#ef4444', fontWeight: '700' }}>Sil</Text>
                    </Pressable>
                  </View>
                </Pressable>
              );
            }}
          />

          {/* Create Modal */}
          <Modal
            animationType="fade"
            transparent
            visible={createVisible}
            onRequestClose={() => setCreateVisible(false)}
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
                <Text style={{ fontWeight: '700', fontSize: 16, marginBottom: 8 }}>Görev Ekle</Text>

                <Text style={{ fontWeight: '600', marginBottom: 6 }}>Ad *</Text>
                <TextInput
                  value={formName}
                  onChangeText={setFormName}
                  placeholder="Örn: Sepet al"
                  autoFocus
                  style={{
                    borderWidth: 1,
                    borderColor: 'rgba(0,0,0,0.12)',
                    borderRadius: 8,
                    padding: 10,
                    marginBottom: 12,
                  }}
                />

                <Text style={{ fontWeight: '600', marginBottom: 6 }}>Açıklama</Text>
                <TextInput
                  value={formDesc}
                  onChangeText={setFormDesc}
                  placeholder="İsteğe bağlı açıklama"
                  multiline
                  style={{
                    borderWidth: 1,
                    borderColor: 'rgba(0,0,0,0.12)',
                    borderRadius: 8,
                    padding: 10,
                    minHeight: 80,
                  }}
                />

                <Text style={{ fontWeight: '600', marginTop: 12, marginBottom: 6 }}>Öncelik</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                  {(['low', 'medium', 'high'] as Priority[]).map((p) => {
                    const active = formPriority === p;
                    return (
                      <Pressable
                        key={p}
                        onPress={() => setFormPriority(p)}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: active ? '#3b82f6' : 'rgba(0,0,0,0.15)',
                        }}
                      >
                        <Text
                          style={{
                            fontWeight: active ? '800' : '600',
                            color: active ? '#3b82f6' : undefined,
                          }}
                        >
                          {p}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    marginTop: 10,
                    gap: 16,
                  }}
                >
                  <Pressable onPress={() => setCreateVisible(false)}>
                    <Text>Vazgeç</Text>
                  </Pressable>
                  <Pressable onPress={submitCreate}>
                    <Text style={{ color: '#3b82f6', fontWeight: '700' }}>Ekle</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>

          {/* Edit Modal */}
          <Modal
            animationType="fade"
            transparent
            visible={editVisible}
            onRequestClose={() => setEditVisible(false)}
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
                  Görevi Düzenle
                </Text>

                <Text style={{ fontWeight: '600', marginBottom: 6 }}>Ad *</Text>
                <TextInput
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Görev adı"
                  autoFocus
                  style={{
                    borderWidth: 1,
                    borderColor: 'rgba(0,0,0,0.12)',
                    borderRadius: 8,
                    padding: 10,
                    marginBottom: 12,
                  }}
                />

                <Text style={{ fontWeight: '600', marginBottom: 6 }}>Açıklama</Text>
                <TextInput
                  value={editDesc}
                  onChangeText={setEditDesc}
                  placeholder="İsteğe bağlı açıklama"
                  multiline
                  style={{
                    borderWidth: 1,
                    borderColor: 'rgba(0,0,0,0.12)',
                    borderRadius: 8,
                    padding: 10,
                    minHeight: 80,
                  }}
                />

                <Text style={{ fontWeight: '600', marginTop: 12, marginBottom: 6 }}>Öncelik</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                  {(['low', 'medium', 'high'] as Priority[]).map((p) => {
                    const active = editPriority === p;
                    return (
                      <Pressable
                        key={p}
                        onPress={() => setEditPriority(p)}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: active ? '#3b82f6' : 'rgba(0,0,0,0.15)',
                        }}
                      >
                        <Text
                          style={{
                            fontWeight: active ? '800' : '600',
                            color: active ? '#3b82f6' : undefined,
                          }}
                        >
                          {p}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    marginTop: 10,
                    gap: 16,
                  }}
                >
                  <Pressable onPress={() => setEditVisible(false)}>
                    <Text>Vazgeç</Text>
                  </Pressable>
                  <Pressable onPress={submitEdit}>
                    <Text style={{ color: '#3b82f6', fontWeight: '700' }}>Kaydet</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
}
