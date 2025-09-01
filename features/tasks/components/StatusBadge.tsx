import { memo } from 'react';
import { Text, View } from 'react-native';

import { cn } from '@/libs';
import type { Status } from '@/types/tasks';

interface Props {
  status?: Status | null;
  showFor?: Status[];
  className?: string;
}

const getBadgeMeta = (status: Status | undefined | null) => {
  switch (status ?? 'not_started') {
    case 'in_progress':
      return { char: 'I', bg: 'bg-sky-500', text: 'text-white' };
    case 'completed':
      return { char: 'C', bg: 'bg-emerald-500', text: 'text-white' };
    default:
      return { char: 'N', bg: 'bg-gray-500', text: 'text-white' };
  }
};

const StatusBadge = (props: Props) => {
  const { status, showFor = ['in_progress'], className } = props;
  if (!status || !showFor.includes(status)) return null;

  const meta = getBadgeMeta(status);
  return (
    <View
      pointerEvents="none"
      className={cn(
        'absolute -left-1.5 -top-1 z-10 h-6 w-6 items-center justify-center rounded-full shadow ',
        meta.bg,
        className,
      )}
    >
      <Text className={cn('text-xs font-extrabold', meta.text)}>{meta.char}</Text>
    </View>
  );
};

export default memo(StatusBadge);
