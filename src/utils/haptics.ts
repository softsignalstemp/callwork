import * as Haptics from 'expo-haptics';
import { ImpactFeedbackStyle, NotificationFeedbackType } from 'expo-haptics';

export { ImpactFeedbackStyle, NotificationFeedbackType };

export function hapticSelection(): void {
  Haptics.selectionAsync().catch(() => {});
}

export function hapticImpact(style: ImpactFeedbackStyle = ImpactFeedbackStyle.Medium): void {
  Haptics.impactAsync(style).catch(() => {});
}

export function hapticNotification(type: NotificationFeedbackType = NotificationFeedbackType.Success): void {
  Haptics.notificationAsync(type).catch(() => {});
}
