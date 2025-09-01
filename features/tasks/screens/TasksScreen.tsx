import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, View } from 'react-native';

import { BackgroundGradient, Button, ConfirmGlassDialog, Container } from '@/components';
import { useDebouncedValue } from '@/hooks';
import { getListById, listsKeys } from '@/queries';
import type { Priority, TaskItem } from '@/types/tasks';

import { Header, PriorityBar, TaskBody, TaskFormModal } from '../components';
import { useTasksData } from '../hooks';

const TasksScreen = () => {
  const { t } = useTranslation();
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
    statusFilter: null,
    priorityFilter,
  });

  const tasksForRender = useMemo(() => {
    let arr = [...displayTasks];

    if (priorityFilter)
      arr = arr.filter((task) => (task.priority as Priority | undefined) === priorityFilter);

    const nowIso = new Date().toISOString();

    if (tab === 'upcoming') {
      arr = arr.filter((task) => !!task.due_date && task.due_date > nowIso && !task.is_completed);
      arr.sort((a, b) => (a.due_date! > b.due_date! ? 1 : -1));
    } else if (tab === 'completed') {
      arr = arr.filter((task) => !!task.is_completed);
      arr.sort((a, b) => (b.updated_at ?? '').localeCompare(a.updated_at ?? ''));
    }

    return arr;
  }, [displayTasks, priorityFilter, tab]);

  const [createVisible, setCreateVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editing, setEditing] = useState<TaskItem | null>(null);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

  const openEdit = useCallback((item: TaskItem) => {
    setEditing(item);
    setEditVisible(true);
  }, []);

  if (!validListId) {
    return (
      <View className={styles.centerBox}>
        <Text className="text-white">{t('error.invalidId')}</Text>
      </View>
    );
  }

  let content: React.ReactNode;

  if (isAnyLoading && displayTasks.length === 0) {
    content = (
      <View className={styles.centerBox}>
        <ActivityIndicator color="#fff" />
        <Text className={styles.centerText}>{t('loading.tasks')}</Text>
      </View>
    );
  } else if (isAnyError) {
    content = (
      <View className={styles.errorBox}>
        <Text className={styles.errorTitle}>{t('error.message')}</Text>
        <Button title={t('error.tryAgain')} onPress={refetchAll} />
      </View>
    );
  } else {
    content = (
      <TaskBody
        tasks={tasksForRender}
        completedCount={completedCount}
        isRefetching={isRefetching}
        refetchAll={refetchAll}
        onAdd={() => setCreateVisible(true)}
        onToggle={toggleTask}
        onEdit={openEdit}
        onDelete={(item) => {
          setSelectedTask(item);
          setConfirmVisible(true);
        }}
      />
    );
  }

  return (
    <Container padding={{ top: 20 }}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <BackgroundGradient />
      <Header
        title={listQ.data?.name ?? 'Liste'}
        tab={tab}
        onChangeTab={setTab}
        search={search}
        onChangeSearch={setSearch}
      />
      <PriorityBar value={priorityFilter} onChange={setPriorityFilter} />
      {content}
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
      <ConfirmGlassDialog
        visible={confirmVisible}
        title={t('tasks.confirmDialogTitle')}
        message={t('tasks.confirmDialogMessage', { name: selectedTask?.name })}
        confirmText={t('global.delete')}
        cancelText={t('global.cancel')}
        destructive
        onCancel={() => setConfirmVisible(false)}
        onConfirm={() => {
          if (selectedTask) deleteTask(selectedTask.id);
        }}
      />
    </Container>
  );
};

export default TasksScreen;

const styles = {
  centerBox: 'flex-1 items-center justify-center',
  centerText: 'mt-2 text-white/80',
  errorBox: 'flex-1 items-center justify-center px-4',
  errorTitle: 'font-semibold text-base mb-2 text-white',
} as const;
