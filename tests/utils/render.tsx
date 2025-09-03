import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  render,
  renderHook,
  type RenderAPI,
  type RenderHookOptions,
  type RenderHookResult,
} from '@testing-library/react-native';
import React, { useRef, type PropsWithChildren } from 'react';

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

export function Providers({ children }: Readonly<PropsWithChildren>) {
  const clientRef = useRef<QueryClient>();
  clientRef.current ??= createTestQueryClient();

  return <QueryClientProvider client={clientRef.current}>{children}</QueryClientProvider>;
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Parameters<typeof render>[1],
): RenderAPI {
  return render(ui, { wrapper: Providers, ...options });
}

export function renderHookWithProviders<Result, Props>(
  callback: (initialProps: Props) => Result,
  options?: Omit<RenderHookOptions<Props>, 'wrapper'>,
): RenderHookResult<Result, Props> {
  return renderHook(callback, { wrapper: Providers, ...options });
}
