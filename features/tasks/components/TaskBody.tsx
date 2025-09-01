import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, RefreshControl, Text, View } from 'react-native';

import { Button } from '@/components';
import type { Status, TaskItem } from '@/types/tasks';

import StatusBadge from './StatusBadge';
import TaskCard from './TaskCard';

interface Props {
  tasks: TaskItem[];
  tab: 'all' | 'upcoming' | 'completed';
  completedCount: number;
  isRefetching: boolean;
  refetchAll: () => void;
  onToggle: (task: TaskItem) => void;
  onEdit: (task: TaskItem) => void;
  onDelete: (task: TaskItem) => void;
  onSetStatus: (task: TaskItem, status: Status) => void;
  onAdd?: () => void;
}

const TaskBody = (props: Props) => {
  const {
    tasks,
    tab,
    completedCount,
    isRefetching,
    refetchAll,
    onToggle,
    onEdit,
    onDelete,
    onSetStatus,
    onAdd,
  } = props;
  const { t } = useTranslation();

  let text: string;

  if (tab === 'upcoming') text = t('tasks.noUpcomingHint');
  else if (tab === 'completed' && tasks.length === 0) text = t('tasks.noCompletedHint');
  else text = t('tasks.noTaskHint');

  return (
    <FlatList
      data={tasks}
      keyExtractor={(item) => String(item.id)}
      refreshControl={
        <RefreshControl tintColor="#fff" refreshing={isRefetching} onRefresh={refetchAll} />
      }
      contentContainerStyle={{ padding: 24 }}
      ListEmptyComponent={<Text className="mt-6 text-center text-white/80">{text}</Text>}
      renderItem={({ item }) => (
        <View className="relative">
          <StatusBadge
            status={item.status as Status}
            showFor={['in_progress', 'completed', 'not_started']}
          />
          <TaskCard
            item={item}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
            onSetStatus={onSetStatus}
          />
        </View>
      )}
      ListHeaderComponent={
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="font-bold text-white">
            {t('tasks.title')} • {t('global.completed')}: {completedCount}/{tasks.length}
          </Text>
          <Button title={`+ ${t('tasks.addToTaskBtn')}`} size="md" onPress={onAdd} />
        </View>
      }
    />
  );
};

export default memo(TaskBody);
