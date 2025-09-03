import * as Haptics from 'expo-haptics';

const success = (): Promise<void> =>
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

const warn = (): Promise<void> =>
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

const error = (): Promise<void> =>
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

export { error, success, warn };
