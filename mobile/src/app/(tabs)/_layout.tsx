import { useEffect, useState, useCallback } from 'react';
import { Tabs, Link } from 'expo-router';
import { TouchableOpacity, AppState } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/lib/store/authStore';
import { messagesApi } from '@/lib/api/messages';

// Unread badge for the Messages tab: refreshed on mount, when the app
// returns to the foreground, and on a slow poll while it's active. Chat
// screens mark conversations read server-side; the next refresh clears it.
function useUnreadCount(): number {
  const status = useAuthStore((s) => s.status);
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const { count: fresh } = await messagesApi.getUnreadCount();
      setCount(fresh);
    } catch {
      // Best-effort — keep last known value
    }
  }, []);

  useEffect(() => {
    if (status !== 'signedIn') {
      setCount(0);
      return;
    }

    refresh();
    const interval = setInterval(refresh, 60_000);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });

    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, [status, refresh]);

  return count;
}

export default function TabsLayout() {
  const unreadCount = useUnreadCount();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary600,
        tabBarInactiveTintColor: colors.gray400,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Browse',
          headerTitle: 'DogMate',
          tabBarIcon: ({ color, size }) => <Ionicons name="paw" size={size} color={color} />,
          headerRight: () => (
            <Link href="/add-dog" asChild>
              <TouchableOpacity style={{ marginRight: 16 }} hitSlop={8}>
                <Ionicons name="add-circle" size={28} color={colors.primary600} />
              </TouchableOpacity>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: 'Matches',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" size={size} color={color} />
          ),
          tabBarBadge: unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : undefined,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
