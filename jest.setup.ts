import '@testing-library/jest-native/extend-expect';
import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper', () => ({}), { virtual: true });

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-native-safe-area-context', () => {
  const actual = jest.requireActual('react-native-safe-area-context');
  return {
    ...actual,
    SafeAreaProvider: ({ children }: any) => children,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'en', regionCode: 'US' }],
  getCalendars: () => [{ calendar: 'gregorian' }],
  getLocalesAsync: async () => [{ languageCode: 'en', regionCode: 'US' }],
}));

jest.mock('expo-router', () => ({
  Link: ({ children }: any) => children,
  router: {
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  },
  useLocalSearchParams: jest.fn(() => ({})),
}));

jest.mock('expo-blur', () => ({
  BlurView: ({ children }: any) => children,
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: any) => children,
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: (_props: any) => null,
}));

jest.mock('expo-sqlite', () => {
  return {
    SQLiteProvider: ({ children }: any) => children,
    openDatabaseSync: jest.fn(),
    useSQLiteContext: () => ({
      runAsync: jest.fn(),
      getAllAsync: jest.fn(),
      execAsync: jest.fn(),
    }),
  };
});

jest.mock('expo-haptics', () => ({
  __esModule: true,
  NotificationFeedbackType: {
    Success: 'Success',
    Warning: 'Warning',
    Error: 'Error',
  },
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  impactAsync: jest.fn().mockResolvedValue(undefined),
  selectionAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@expo/vector-icons', () => {
  const Ionicons = jest.fn(() => null);
  return { Ionicons };
});

jest.mock('react-i18next', () => {
  const i18nStore = require('./tests/utils/i18nDict');
  return {
    useTranslation: () => ({
      t: (key: string) => (i18nStore.t ? i18nStore.t(key) : key),
      i18n: { language: 'en', changeLanguage: jest.fn() },
    }),
    initReactI18next: { type: '3rdParty', init: jest.fn() },
    Trans: ({ i18nKey, children }: any) => (i18nStore.t ? i18nStore.t(i18nKey) : children),
  };
});

jest.mock('@/hooks', () => {
  const actual = jest.requireActual('@/hooks');
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    ...actual,
    useDebouncedValue: (v: string) => v,
    useTRDateTimeFormat: () => ({
      format: (d: Date) => {
        const day = pad(d.getUTCDate());
        const month = pad(d.getUTCMonth() + 1);
        const year = d.getUTCFullYear();
        const hours = pad(d.getUTCHours());
        const mins = pad(d.getUTCMinutes());
        return `${day}.${month}.${year} ${hours}:${mins}`;
      },
    }),
  };
});

jest.mock('@/validations', () => ({
  __esModule: true,
  getZodMessage: () => 'ERR',
}));

jest.mock('@/features/landing/hooks', () => {
  const { Animated } = require('react-native');
  return {
    __esModule: true,
    useLoop: () => ({
      value: new Animated.Value(0),
      start: jest.fn(),
      stop: jest.fn(),
    }),
    usePulse: () => ({
      scale: 1,
      opacity: 1,
    }),
  };
});
