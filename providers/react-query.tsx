import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';
import { AppState } from 'react-native';

const queryClient = new QueryClient();

focusManager.setEventListener((handleFocus) => {
  const sub = AppState.addEventListener('change', (s) => s === 'active' && handleFocus());
  return () => sub.remove();
});

const ReactQueryProvider = ({ children }: PropsWithChildren) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

export { ReactQueryProvider };
