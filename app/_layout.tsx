import '../global.css';

import { Stack } from 'expo-router';

import DatabaseProvider from '@/providers/database-provider';
import { ReactQueryProvider } from '@/providers/react-query';

export default function Layout() {
  return (
    <ReactQueryProvider>
      <DatabaseProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ title: 'Landing' }} />
          <Stack.Screen name="lists" options={{ title: 'Listeler' }} />
          <Stack.Screen name="details" options={{ title: 'Liste Detayı' }} />
        </Stack>
      </DatabaseProvider>
    </ReactQueryProvider>
  );
}
