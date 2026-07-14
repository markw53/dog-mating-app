import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import apiClient from './api/client';

// Show notifications when the app is foregrounded too — the server only
// pushes when the user has no live chat socket, so these aren't duplicates
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Remembered so logout can unregister this device
let currentToken: string | null = null;

// Registers this device for push and stores the Expo token on the backend.
// Silently no-ops where push isn't possible (simulator, no EAS projectId,
// permission denied) — push is an enhancement, never a blocker.
export async function registerForPushNotifications(): Promise<void> {
  try {
    if (!Device.isDevice) return;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    let status = existing;
    if (existing !== 'granted') {
      const request = await Notifications.requestPermissionsAsync();
      status = request.status;
    }
    if (status !== 'granted') return;

    // Requires an EAS project (npx eas init); absent in plain Expo Go dev
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

    const { data: token } = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );

    await apiClient.post('/push/device-token', { token });
    currentToken = token;
  } catch {
    // No push on this device/build — fine
  }
}

// Fire-and-forget device unregistration; called on logout while the auth
// token is still valid
export function unregisterDevicePush(): Promise<void> {
  const token = currentToken;
  currentToken = null;
  if (!token) return Promise.resolve();

  return apiClient
    .post('/push/device-token/remove', { token })
    .then(() => undefined)
    .catch(() => undefined);
}
