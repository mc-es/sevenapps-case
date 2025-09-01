import '../global.css';

import { Stack } from 'expo-router';

import { DatabaseProvider, I18nProvider, ReactQueryProvider } from '@/providers';

export default function Layout() {
  return (
    <I18nProvider>
      <ReactQueryProvider>
        <DatabaseProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="lists" />
            <Stack.Screen name="tasks" />
          </Stack>
        </DatabaseProvider>
      </ReactQueryProvider>
    </I18nProvider>
  );
}
