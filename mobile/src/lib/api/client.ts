import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Configure per environment: EXPO_PUBLIC_API_URL in .env / eas.json.
// Note for local dev: Android emulators reach the host machine via
// http://10.0.2.2:5000/api, iOS simulators via http://localhost:5000/api.
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

export const TOKEN_KEY = 'dogmate_token';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401s clear the stored session; navigation back to login is handled by the
// auth store subscriber in the root layout, not by the HTTP layer
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const requestUrl: string = error.config?.url ?? '';
    const isAuthAttempt =
      requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');

    if (error.response?.status === 401 && !isAuthAttempt) {
      const { useAuthStore } = await import('../store/authStore');
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);

export function getSocketUrl(): string {
  return process.env.EXPO_PUBLIC_SOCKET_URL || API_URL.replace(/\/api$/, '');
}

export default apiClient;
