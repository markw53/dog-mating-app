// lib/hooks/useUnreadMessages.ts
'use client';

import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/lib/store/authStore';
import { messagesApi } from '@/lib/api/messages';

// Unread-message count for the navbar badge. Kept fresh three ways:
//  - the 'newMessage' socket event (instant while the app is open)
//  - window focus (returning to the tab)
//  - the 'dogmate:unread-refresh' event fired after markAsRead
export function useUnreadMessages(): number {
  const { isAuthenticated } = useAuthStore();
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const { count: fresh } = await messagesApi.getUnreadCount();
      setCount(fresh);
    } catch {
      // Badge is best-effort — keep the last known value on failure
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setCount(0);
      return;
    }

    refresh();

    const handleFocus = () => refresh();
    window.addEventListener('focus', handleFocus);
    window.addEventListener('dogmate:unread-refresh', handleFocus);

    // Live updates: bump the badge the moment a message lands
    let socket: Socket | undefined;
    const token = localStorage.getItem('token');
    if (token) {
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
      socket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        auth: { token },
      });
      socket.on('newMessage', () => refresh());
    }

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('dogmate:unread-refresh', handleFocus);
      socket?.disconnect();
    };
  }, [isAuthenticated, refresh]);

  return count;
}
