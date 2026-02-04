// lib/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { authApi } from '@/lib/api/auth';
import { RegisterData } from '@/types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,

      login: async (email: string, password: string) => {
        set({ loading: true });
        try {
          console.log('🔐 Login attempt:', { email });
          
          // FIX: Create credentials object
          const credentials = {
            email: email.trim(),
            password: password,
          };

          console.log('📦 Calling authApi.login with credentials object');
          
          const response = await authApi.login(credentials); // Pass object, not separate params
          
          console.log('✅ Login successful');
          
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            loading: false,
          });
        } catch (error) {
          console.error('❌ Login failed in store:', error);
          set({ loading: false });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ loading: true });
        try {
          console.log('📝 Registration attempt');
          
          const response = await authApi.register(data);
          
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            loading: false,
          });
        } catch (error) {
          console.error('❌ Registration failed:', error);
          set({ loading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      setToken: (token: string) => {
        set({ token });
      },

      checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        try {
          const response = await authApi.getCurrentUser();
          set({
            user: response.user,
            token,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error('❌ Auth check failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);