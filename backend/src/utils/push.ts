import webpush from 'web-push';
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
  url?: string;
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
