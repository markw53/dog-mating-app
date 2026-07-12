'use client';

import { useState } from 'react';
import { Bell, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePushNotifications } from '@/lib/hooks/usePushNotifications';

const DISMISS_KEY = 'push-banner-dismissed';

export default function EnableNotificationsBanner() {
  const { supported, permission, subscribed, busy, enable } = usePushNotifications();
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(DISMISS_KEY) === 'true';
  });

  if (!supported || subscribed || permission === 'denied' || dismissed) {
    return null;
  }

  const handleEnable = async () => {
    const ok = await enable();
    if (ok) {
      toast.success("Notifications enabled - you'll be alerted about new messages");
    } else if (Notification.permission === 'denied') {
      toast.error('Notifications are blocked in your browser settings');
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, 'true');
    setDismissed(true);
  };

  return (
    <div className="flex items-center gap-3 bg-primary-50 border border-primary-200 rounded-xl px-4 py-3 mb-4">
      <Bell className="h-5 w-5 text-primary-600 flex-shrink-0" />
      <p className="flex-1 text-sm text-primary-900">
        Get notified when you receive new messages, even when DogMate is closed.
      </p>
      <button
        onClick={handleEnable}
        disabled={busy}
        className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
      >
        {busy ? 'Enabling...' : 'Enable'}
      </button>
      <button
        onClick={handleDismiss}
        className="p-1 text-primary-400 hover:text-primary-600 transition-colors"
        title="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
