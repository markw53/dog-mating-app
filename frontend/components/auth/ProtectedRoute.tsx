'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, user, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (requireAdmin && user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [isAuthenticated, user, requireAdmin, router]);

  if (!isAuthenticated || (requireAdmin && user?.role !== 'ADMIN')) {
    return (
      <div className="flex justify-center items-center min-h-screen" role="status">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" aria-hidden="true" />
        <span className="sr-only">Loading</span>
      </div>
    );
  }

  return <>{children}</>;
}