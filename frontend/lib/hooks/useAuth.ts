// lib/hooks/useAuth.ts
import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';

export function useAuth() {
  const router = useRouter();
  
  const {
    user,
    token,
    loading,
    isAuthenticated,
    login: storeLogin,
    register: storeRegister,
    logout: storeLogout,
    checkAuth,
    setUser,
  } = useAuthStore();

  // Check auth status on mount
  useEffect(() => {
    if (!isAuthenticated && token) {
      checkAuth();
    }
  }, [isAuthenticated, token, checkAuth]);

  // Logout with redirect
  const logout = useCallback((redirectTo: string = '/login') => {
    storeLogout();
    router.push(redirectTo);
  }, [storeLogout, router]);

  // Login with optional redirect
  const login = useCallback(async (
    email: string, 
    password: string, 
    redirectTo: string = '/browse'
  ) => {
    await storeLogin(email, password);
    router.push(redirectTo);
  }, [storeLogin, router]);

  // Register with optional redirect
  const register = useCallback(async (
    data: Parameters<typeof storeRegister>[0],
    redirectTo: string = '/browse'
  ) => {
    await storeRegister(data);
    router.push(redirectTo);
  }, [storeRegister, router]);

  return {
    // State
    user,
    token,
    loading,
    isAuthenticated,
    
    // Computed
    isAdmin: user?.role === 'ADMIN',
    isBreeder: user?.role === 'BREEDER',
    isVerified: user?.verified ?? false,
    
    // Actions
    login,
    register,
    logout,
    checkAuth,
    setUser,
  };
}