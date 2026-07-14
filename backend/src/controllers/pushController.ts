import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { pushEnabled } from '../utils/push';
import logger from '../utils/logger';

// Exposes whether push is configured plus the public VAPID key the browser
// needs to subscribe — keeps the key out of the frontend build entirely
export const getPushConfig = (_req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    enabled: pushEnabled,
    publicKey: pushEnabled ? process.env.VAPID_PUBLIC_KEY : null,
  });
};

export const subscribe = async (req: AuthRequest, res: Response) => {
  try {
    const { endpoint, keys } = req.body ?? {};

    if (typeof endpoint !== 'string' || !endpoint.startsWith('https://') ||
        typeof keys?.p256dh !== 'string' || typeof keys?.auth !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid subscription' });
    }

    // A browser re-subscribing (or a different account on the same browser)
    // reuses the endpoint — always attach it to the current user
    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: { p256dh: keys.p256dh, auth: keys.auth, userId: req.user!.id },
      create: { endpoint, p256dh: keys.p256dh, auth: keys.auth, userId: req.user!.id },
    });

    res.status(201).json({ success: true });
  } catch (error) {
    logger.error({ err: error }, 'Push subscribe error');
    res.status(500).json({ success: false, message: 'Failed to save subscription' });
  }
};

// Expo device tokens for the native app
const EXPO_TOKEN_PATTERN = /^Expo(nent)?PushToken\[.+\]$/;

export const registerDeviceToken = async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.body ?? {};

    if (typeof token !== 'string' || !EXPO_TOKEN_PATTERN.test(token)) {
      return res.status(400).json({ success: false, message: 'Invalid device token' });
    }

    // Same device re-registering (or a different account on it) reuses the
    // token — always attach it to the current user
    await prisma.devicePushToken.upsert({
      where: { token },
      update: { userId: req.user!.id },
      create: { token, userId: req.user!.id },
    });

    res.status(201).json({ success: true });
  } catch (error) {
    logger.error({ err: error }, 'Device token register error');
    res.status(500).json({ success: false, message: 'Failed to save device token' });
  }
};

export const removeDeviceToken = async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.body ?? {};

    if (typeof token !== 'string') {
      return res.status(400).json({ success: false, message: 'Token is required' });
    }

    await prisma.devicePushToken.deleteMany({
      where: { token, userId: req.user!.id },
    });

    res.json({ success: true });
  } catch (error) {
    logger.error({ err: error }, 'Device token remove error');
    res.status(500).json({ success: false, message: 'Failed to remove device token' });
  }
};

export const unsubscribe = async (req: AuthRequest, res: Response) => {
  try {
    const { endpoint } = req.body ?? {};

    if (typeof endpoint !== 'string') {
      return res.status(400).json({ success: false, message: 'Endpoint is required' });
    }

    // Scoped to the caller so one user can't remove another's subscription
    await prisma.pushSubscription.deleteMany({
      where: { endpoint, userId: req.user!.id },
    });

    res.json({ success: true });
  } catch (error) {
    logger.error({ err: error }, 'Push unsubscribe error');
    res.status(500).json({ success: false, message: 'Failed to remove subscription' });
  }
};
