import { cn } from '@/libs/cn';
import type { TaskItem } from '@/types/tasks';
import { BlurView } from 'expo-blur';
import { memo, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

type TaskCardProps = {
  item: TaskItem;
  onToggle: (task: TaskItem) => void;
  onEdit: (task: TaskItem) => void;
  onDelete: (taskId: number) => void;
  rootClassName?: string;
  checkboxClassName?: string;
  nameClassName?: string;
  descriptionClassName?: string;
  metaClassName?: string;
  editBtnClassName?: string;
  editTextClassName?: string;
  deleteBtnClassName?: string;
  deleteTextClassName?: string;
};

const TaskCard = ({
  item,
  onToggle,
  onEdit,
  onDelete,
  rootClassName,
  checkboxClassName,
  nameClassName,
  descriptionClassName,
  metaClassName,
  editBtnClassName,
  editTextClassName,
  deleteBtnClassName,
  deleteTextClassName,
}: TaskCardProps) => {
  const done = useMemo(() => !!item.is_completed, [item.is_completed]);
  const statusLabel = useMemo(() => {
    if (done) return 'completed';
    return (item.status as string) ?? 'not_started';
  }, [done, item.status]);

  return (
    <BlurView intensity={30} tint="light" className="mb-3 overflow-hidden rounded-2xl">
      <Pressable
        onPress={() => onToggle(item)}
        accessibilityRole="button"
        accessibilityLabel={`${item.name}, durum: ${statusLabel}`}
        className={cn(styles.root, done ? styles.rootDone : styles.rootPending, rootClassName)}
        style={({ pressed }) => [{ opacity: pressed ? 0.97 : 1 }]}
      >
        <View className="flex-row items-center">
          <View
            className={cn(
              styles.checkbox,
              done ? styles.checkboxDone : styles.checkboxPending,
              checkboxClassName,
            )}
          >
            {done ? <Text className={styles.checkmark}>✓</Text> : null}
          </View>

          <View className="flex-1">
            <Text
              numberOfLines={1}
              className={cn(styles.name, done && styles.nameDone, nameClassName)}
            >
              {item.name}
            </Text>

            {!!item.description && (
              <Text
                numberOfLines={2}
                className={cn(
                  styles.description,
                  done && styles.descriptionDone,
                  descriptionClassName,
                )}
              >
                {item.description}
              </Text>
            )}

            <Text className={cn(styles.meta, metaClassName)}>
              durum: {statusLabel} • öncelik: {item.priority ?? 'none'}
            </Text>
          </View>

          <View className={styles.actions}>
            <Pressable
              onPress={() => onEdit(item)}
              hitSlop={8}
              className={cn(styles.editBtn, editBtnClassName)}
            >
              <Text className={cn(styles.editText, editTextClassName)}>Düzenle</Text>
            </Pressable>
            <Pressable
              onPress={() => onDelete(item.id)}
              hitSlop={8}
              className={cn(styles.deleteBtn, deleteBtnClassName)}
            >
              <Text className={cn(styles.deleteText, deleteTextClassName)}>Sil</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </BlurView>
  );
};

export default memo(TaskCard);

const styles = {
  root: 'bg-white/12 border border-white/20 px-3 py-3',
  rootDone: 'bg-emerald-500/10 border-emerald-400/30',
  rootPending: '',
  checkbox: 'mr-2 h-[22px] w-[22px] items-center justify-center rounded-md border-2 bg-white/10',
  checkboxDone: 'border-emerald-400',
  checkboxPending: 'border-white/40',
  checkmark: 'font-black text-emerald-400',
  name: 'font-semibold text-white',
  nameDone: 'line-through text-white/70',
  description: 'text-white/80',
  descriptionDone: 'line-through text-white/70',
  meta: 'text-[11px] text-white/70 mt-0.5',
  actions: 'ml-2 flex-row items-center',
  editBtn: 'mr-1 px-2 py-1',
  editText: 'font-bold text-emerald-300',
  deleteBtn: 'px-2 py-1',
  deleteText: 'font-bold text-rose-300',
} as const;
