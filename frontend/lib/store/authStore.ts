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
          const response = await authApi.login(email, password);
          localStorage.setItem('token', response.token);
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            loading: false,
          });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ loading: true });
        try {
          const response = await authApi.register(data);
          localStorage.setItem('token', response.token);
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            loading: false,
          });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      setUser: (user: User) => {
        set({ user });
      },

      checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        try {
          const response = await authApi.getMe();
          set({
            user: response.user,
            token,
            isAuthenticated: true,
          });
        } catch {
          localStorage.removeItem('token');
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