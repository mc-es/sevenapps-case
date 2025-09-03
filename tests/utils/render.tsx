import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RenderAPI, render } from '@testing-library/react-native';
import React, { type PropsWithChildren } from 'react';

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Parameters<typeof render>[1],
): RenderAPI {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  function Wrapper({ children }: Readonly<PropsWithChildren>) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  }

  return render(ui, { wrapper: Wrapper, ...options });
}
