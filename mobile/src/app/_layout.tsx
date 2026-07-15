import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { useAuthStore } from '@/lib/store/authStore';
import { registerForPushNotifications } from '@/lib/notifications';
import { colors } from '@/constants/colors';

export default function RootLayout() {
  const { status, bootstrap } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  // Auth gate: signed-out users can only see login/register, signed-in
  // users skip them
  useEffect(() => {
    if (status === 'loading') return;

    const inAuthScreen = segments[0] === 'login' || segments[0] === 'register';

    if (status === 'signedOut' && !inAuthScreen) {
      router.replace('/login');
    } else if (status === 'signedIn' && inAuthScreen) {
      router.replace('/');
    }
  }, [status, segments, router]);

  // Register this device for push once signed in
  useEffect(() => {
    if (status === 'signedIn') {
      void registerForPushNotifications();
    }
  }, [status]);

  // Tapping a message notification opens that conversation
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const conversationId = response.notification.request.content.data?.conversationId;
      if (typeof conversationId === 'string' && conversationId) {
        router.push(`/chat/${conversationId}`);
      }
    });
    return () => subscription.remove();
  }, [router]);

  if (status === 'loading') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary600} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="dog/[id]" options={{ title: 'Dog Details' }} />
        <Stack.Screen name="chat/[id]" options={{ title: 'Chat' }} />
        <Stack.Screen name="add-dog" options={{ title: 'Add Your Dog', presentation: 'modal' }} />
        <Stack.Screen name="edit-dog/[id]" options={{ title: 'Edit Dog', presentation: 'modal' }} />
        <Stack.Screen name="breeds/index" options={{ title: 'Breed Directory' }} />
        <Stack.Screen name="breeds/[slug]" options={{ title: 'Breed' }} />
      </Stack>
    </>
  );
}
