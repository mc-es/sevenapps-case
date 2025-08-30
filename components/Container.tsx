import { cn } from '@/libs/cn';
import type { PropsWithChildren } from 'react';
import { SafeAreaView } from 'react-native';

interface ContainerProps {
  className?: string;
}

const Container = ({ children, className }: PropsWithChildren<ContainerProps>) => (
  <SafeAreaView className={cn(styles.container, className)}>{children}</SafeAreaView>
);

export default Container;

const styles = {
  container: 'flex flex-1',
} as const;
