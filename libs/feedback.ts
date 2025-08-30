import * as Haptics from 'expo-haptics';
export const success = (): Promise<void> =>
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

export const warn = (): Promise<void> =>
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

export const error = (): Promise<void> =>
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
