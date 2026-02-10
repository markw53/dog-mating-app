// lib/hooks/useRequireAuth.ts
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';

interface UseRequireAuthOptions {
  redirectTo?: string;
  requiredRole?: 'ADMIN' | 'BREEDER' | 'USER';
}

export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const { redirectTo = '/login', requiredRole } = options;
  const router = useRouter();
  
  const { user, isAuthenticated, loading, checkAuth } = useAuthStore();

  useEffect(() => {
    // Check auth on mount
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      // Store the current path to redirect back after login
      const currentPath = window.location.pathname;
      const searchParams = new URLSearchParams();
      searchParams.set('redirect', currentPath);
      router.push(`${redirectTo}?${searchParams.toString()}`);
      return;
    }

    // Check role requirement
    if (requiredRole && user?.role !== requiredRole) {
      router.push('/unauthorized');
    }
  }, [isAuthenticated, loading, user, requiredRole, redirectTo, router]);

  return {
    user,
    isAuthenticated,
    loading,
    isAuthorized: isAuthenticated && (!requiredRole || user?.role === requiredRole),
  };
}