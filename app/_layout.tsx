import '../global.css';

import { Stack } from 'expo-router';

import DatabaseProvider from '@/providers/database-provider';
import { ReactQueryProvider } from '@/providers/react-query';

export default function Layout() {
  return (
    <ReactQueryProvider>
      <DatabaseProvider>
        <Stack
          screenOptions={{
            headerTitleAlign: 'center',
          }}
        >
          <Stack.Screen name="index" options={{ title: 'Listeler' }} />
          <Stack.Screen name="details" options={{ title: 'Liste Detayı' }} />
        </Stack>
      </DatabaseProvider>
    </ReactQueryProvider>
  );
}
