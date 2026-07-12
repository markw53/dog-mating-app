// lib/hooks/usePushNotifications.ts
import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api/client';

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const output = new Uint8Array(new ArrayBuffer(rawData.length));
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}

export function usePushNotifications() {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const isSupported =
      'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setSupported(isSupported);
    if (!isSupported) return;

    setPermission(Notification.permission);

    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => setSubscribed(Boolean(subscription)))
      .catch(() => {});
  }, []);

  const enable = useCallback(async (): Promise<boolean> => {
    if (!supported || busy) return false;
    setBusy(true);

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== 'granted') return false;

      const { data } = await apiClient.get<{ enabled: boolean; publicKey: string | null }>(
        '/push/config',
      );
      if (!data.enabled || !data.publicKey) return false;

      const registration = await navigator.serviceWorker.ready;
      const subscription =
        (await registration.pushManager.getSubscription()) ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(data.publicKey),
        }));

      await apiClient.post('/push/subscribe', subscription.toJSON());
      setSubscribed(true);
      return true;
    } catch {
      return false;
    } finally {
      setBusy(false);
    }
  }, [supported, busy]);

  return { supported, permission, subscribed, busy, enable };
}
