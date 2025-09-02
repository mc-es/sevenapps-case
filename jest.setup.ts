import '@testing-library/jest-native/extend-expect';
import 'react-native-gesture-handler/jestSetup';

// react-native
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper', () => ({}), { virtual: true });

// react-native-reanimated
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

// expo-router
jest.mock('expo-router', () => ({
  Link: ({ children }: any) => children,
  router: {
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  },
  useLocalSearchParams: jest.fn(() => ({})),
}));

// expo-blur
jest.mock('expo-blur', () => ({
  BlurView: ({ children }: any) => children,
}));

// expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: any) => children,
}));

// utils
jest.mock('@/queries/utils', () => ({
  simulateNetworkLatency: () => Promise.resolve(),
}));
