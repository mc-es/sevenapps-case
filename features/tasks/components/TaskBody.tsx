import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, RefreshControl, Text, View } from 'react-native';

import { Button } from '@/components';
import type { TaskItem } from '@/types/tasks';

import TaskCard from './TaskCard';

interface TaskBodyProps {
  tasks: TaskItem[];
  completedCount: number;
  isRefetching: boolean;
  refetchAll: () => void;
  onAdd: () => void;
  onToggle: (task: TaskItem) => void;
  onEdit: (task: TaskItem) => void;
  onDelete: (taskId: TaskItem) => void;
}

const TaskBody = (props: TaskBodyProps) => {
  const { tasks, completedCount, isRefetching, refetchAll, onAdd, onToggle, onEdit, onDelete } =
    props;
  const { t } = useTranslation();

  return (
    <FlatList
      data={tasks}
      keyExtractor={(item) => String(item.id)}
      refreshControl={
        <RefreshControl tintColor="#fff" refreshing={isRefetching} onRefresh={refetchAll} />
      }
      contentContainerStyle={{ padding: 24 }}
      ListEmptyComponent={
        <Text className="mt-6 text-center text-white/80">{t('tasks.noTaskMessage')}</Text>
      }
      renderItem={({ item }) => (
        <TaskCard item={item} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
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
