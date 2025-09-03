import { memo, type PropsWithChildren } from 'react';
import { SafeAreaView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@/libs';

type Padding = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

interface Props {
  className?: string;
  padding?: Partial<Padding>;
  isFill?: boolean;
}

const Container = (props: PropsWithChildren<Props>) => {
  const { children, className, padding, isFill = true } = props;
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      className={cn(isFill && 'flex flex-1', className)}
      style={{
        paddingTop: (padding?.top ?? 0) + insets.top,
        paddingBottom: (padding?.bottom ?? 0) + insets.bottom,
        paddingLeft: (padding?.left ?? 0) + insets.left,
        paddingRight: (padding?.right ?? 0) + insets.right,
      }}
    >
      {children}
    </SafeAreaView>
  );
};

export default memo(Container);
