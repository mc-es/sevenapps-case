import '../global.css';

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback } from 'react';
import { View } from 'react-native';

import { DatabaseProvider, I18nProvider, ReactQueryProvider } from '@/providers';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function Layout() {
  const onLayoutRootView = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);

  return (
    <I18nProvider>
      <ReactQueryProvider>
        <DatabaseProvider>
          <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="lists" />
              <Stack.Screen name="tasks" />
            </Stack>
          </View>
        </DatabaseProvider>
      </ReactQueryProvider>
    </I18nProvider>
  );
}
