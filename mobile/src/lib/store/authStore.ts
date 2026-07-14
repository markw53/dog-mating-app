import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import apiClient, { TOKEN_KEY } from '../api/client';
import { User } from '../types';

interface AuthState {
  user: User | null;
  // 'loading' until the stored token has been checked on app start
  status: 'loading' | 'signedIn' | 'signedOut';

  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => void;
  bootstrap: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'loading',

  login: async (email, password) => {
    const { data } = await apiClient.post('/auth/login', {
      email: email.trim(),
      password,
    });
    await SecureStore.setItemAsync(TOKEN_KEY, data.token);
    set({ user: data.user, status: 'signedIn' });
  },

  register: async (payload) => {
    const { data } = await apiClient.post('/auth/register', payload);
    await SecureStore.setItemAsync(TOKEN_KEY, data.token);
    set({ user: data.user, status: 'signedIn' });
  },

  logout: () => {
    void SecureStore.deleteItemAsync(TOKEN_KEY);
    set({ user: null, status: 'signedOut' });
  },

  // Called once at app start: restore the session from the stored token
  bootstrap: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!token) {
        set({ status: 'signedOut' });
        return;
      }
      const { data } = await apiClient.get('/auth/me');
      set({ user: data.user, status: 'signedIn' });
    } catch {
      await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
      set({ user: null, status: 'signedOut' });
    }
  },
}));
