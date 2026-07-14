import webpush from 'web-push';
import axios from 'axios';
import prisma from '../config/database';
import logger from './logger';

// Web push is enabled only when VAPID keys are configured:
//   VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY  — generate once with:
//     npx web-push generate-vapid-keys
//   VAPID_SUBJECT — a mailto: or https: contact URL for push services
const configured = Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);

if (configured) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@example.com',
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
}

export const pushEnabled = configured;

export interface PushPayload {
  title: string;
  body: string;
  // Web push: path to open on notification click
  url?: string;
  // Native push: arbitrary data for the app's tap handler
  data?: Record<string, string>;
}

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

// Native (Expo) push — needs no keys; Expo's service routes to APNs/FCM.
// Best-effort like web push: failures are logged, dead tokens pruned.
export function sendExpoPushToUser(userId: string, payload: PushPayload): void {
  void (async () => {
    try {
      const tokens = await prisma.devicePushToken.findMany({ where: { userId } });
      if (tokens.length === 0) return;

      const messages = tokens.map((t) => ({
        to: t.token,
        title: payload.title,
        body: payload.body,
        sound: 'default',
        data: payload.data ?? {},
      }));

      const { data: response } = await axios.post(EXPO_PUSH_URL, messages, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      });

      // Tickets come back index-aligned with the messages we sent
      const tickets: Array<{ status: string; details?: { error?: string } }> =
        response?.data ?? [];
      await Promise.all(
        tickets.map((ticket, index) => {
          if (ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered') {
            return prisma.devicePushToken
              .delete({ where: { id: tokens[index].id } })
              .catch(() => {});
          }
          return Promise.resolve();
        }),
      );
    } catch (err) {
      logger.warn({ err, userId }, 'Expo push send failed');
    }
  })();
}

// One call notifies every channel the user has: web push subscriptions
// and native device tokens
export function pushToUser(userId: string, payload: PushPayload): void {
  sendPushToUser(userId, payload);
  sendExpoPushToUser(userId, payload);
}

// Best-effort, fire-and-forget: sends to every subscription the user has
// registered (each browser/device is one subscription) and prunes the ones
// the push service reports as gone (unsubscribed/expired).
export function sendPushToUser(userId: string, payload: PushPayload): void {
  if (!configured) return;

  void (async () => {
    try {
      const subscriptions = await prisma.pushSubscription.findMany({
        where: { userId },
      });

      const body = JSON.stringify(payload);

      await Promise.all(
        subscriptions.map(async (sub) => {
          try {
            await webpush.sendNotification(
              {
                endpoint: sub.endpoint,
                keys: { p256dh: sub.p256dh, auth: sub.auth },
              },
              body,
            );
          } catch (err: any) {
            if (err?.statusCode === 404 || err?.statusCode === 410) {
              await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
            } else {
              logger.warn({ err, userId }, 'Push delivery failed');
            }
          }
        }),
      );
    } catch (err) {
      logger.warn({ err, userId }, 'Push send failed');
    }
  })();
}
