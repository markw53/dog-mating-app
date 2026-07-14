import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/lib/store/authStore';
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
      </Stack>
    </>
  );
}
