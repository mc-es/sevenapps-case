import type { PropsWithChildren } from 'react';
import { SafeAreaView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@/libs';

interface ContainerProps {
  className?: string;
  padding?: { top?: number; bottom?: number; left?: number; right?: number };
  isFill?: boolean;
}

const Container = ({
  children,
  className,
  padding,
  isFill = true,
}: PropsWithChildren<ContainerProps>) => {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      className={cn(isFill && styles.container, className)}
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

export default Container;

const styles = {
  container: 'flex flex-1',
} as const;
