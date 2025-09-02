import { BlurView } from 'expo-blur';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { Button } from '@/components';
import { cn } from '@/libs';
import type { Status, TaskDto } from '@/validations';

interface Props {
  item: TaskDto;
  onToggle: (task: TaskDto) => void;
  onEdit: (task: TaskDto) => void;
  onDelete: (task: TaskDto) => void;
  onSetStatus: (task: TaskDto, status: Status) => void;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
}

const TaskCard = (props: Props) => {
  const { item, onToggle, onEdit, onDelete, onSetStatus, intensity = 30, tint = 'light' } = props;
  const { t } = useTranslation();

  const done = useMemo(() => !!item.is_completed, [item.is_completed]);

  return (
    <BlurView intensity={intensity} tint={tint} className={styles.blur}>
      <Pressable
        onPress={() => onToggle(item)}
        accessibilityRole="button"
        className={cn(styles.root, done ? styles.rootDone : '')}
        style={({ pressed }) => [{ opacity: pressed ? 0.96 : 1 }]}
      >
        <View className={styles.row}>
          <View
            className={cn(styles.checkbox, done ? styles.checkboxDone : styles.checkboxPending)}
          >
            {done ? <Text className={styles.checkmark}>✓</Text> : null}
          </View>
          <View className={styles.content}>
            <Text numberOfLines={1} className={cn(styles.name, done && styles.nameDone)}>
              {item.name}
            </Text>
            {!!item.description && (
              <Text
                numberOfLines={2}
                className={cn(styles.description, done && styles.descriptionDone)}
              >
                {item.description}
              </Text>
            )}
          </View>
          <View className={styles.actions}>
            {!done && (
              <Button
                title={item.status === 'in_progress' ? t('global.pause') : t('global.start')}
                variant="solid"
                size="sm"
                onPress={() =>
                  onSetStatus(item, item.status === 'in_progress' ? 'not_started' : 'in_progress')
                }
                textClassName="text-white font-bold"
                colors={['#3b82f6', '#2563eb']}
              />
            )}
            <Button
              title={t('global.edit')}
              variant="solid"
              size="sm"
              onPress={() => onEdit(item)}
              textClassName={styles.editText}
              colors={['#f59e0b', '#d97706']}
            />
            <Button
              title={t('global.delete')}
              variant="solid"
              size="sm"
              onPress={() => onDelete(item)}
              textClassName={styles.deleteText}
              colors={['#ec4899', '#8b5cf6']}
            />
          </View>
        </View>
      </Pressable>
    </BlurView>
  );
};

export default memo(TaskCard);

const styles = {
  blur: 'mb-3 overflow-hidden rounded-2xl',
  root: 'bg-white/12 border border-white/20 px-3 py-3',
  rootDone: 'bg-emerald-500/10 border-emerald-400/30',
  row: 'flex-row items-center',
  checkbox: 'mr-2 h-[22px] w-[22px] items-center justify-center rounded-md border-2 bg-white/10',
  checkboxDone: 'border-emerald-400',
  checkboxPending: 'border-white/40',
  checkmark: 'font-black text-emerald-400',
  content: 'flex-1',
  name: 'font-semibold text-white',
  nameDone: 'line-through text-white/70',
  description: 'text-white/80',
  descriptionDone: 'line-through text-white/70',
  actions: 'flex-row items-center gap-2',
  editText: 'font-bold text-emerald-300 text-lg',
  deleteText: 'text-rose-200 font-bold text-lg',
} as const;
