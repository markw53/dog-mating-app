// lib/providers/AuthProvider.tsx
'use client';

import { useEffect, createContext, useContext, ReactNode } from 'react';
import { useAuthStore } from '@/lib/store/authStore';

interface AuthContextType {
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType>({ isInitialized: false });

export function AuthProvider({ children }: { children: ReactNode }) {
  const { checkAuth, token } = useAuthStore();

  useEffect(() => {
    // Validate token on app load
    if (token) {
      checkAuth();
    }
  }, [token, checkAuth]);

  // Listen for storage changes (logout from another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth-storage' || e.key === 'token') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [checkAuth]);

  return (
    <AuthContext.Provider value={{ isInitialized: true }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);