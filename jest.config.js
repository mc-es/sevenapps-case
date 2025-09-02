/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.{test,spec}.{ts,tsx}'],
  clearMocks: true,
  resetMocks: false,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-.*|@react-native-.*|' +
      'expo(nent)?|expo-modules-core|expo-modules-.*|expo-router|@expo(nent)?|@expo/.*)/)',
  ],
};
