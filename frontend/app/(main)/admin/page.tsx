'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { adminApi } from '@/lib/api/admin';
import { Dog, User } from '@/types';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import AdminStatsCards from '@/components/admin/AdminStatsCard';
import AdminTabs from '@/components/admin/AdminTabs';
import PendingDogsList from '@/components/admin/PendingDogsList';
import UsersTable from '@/components/admin/UsersTable';
import { AxiosError } from 'axios';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  // Handle Axios errors
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    return axiosError.response?.data?.message || 'An error occurred';
  }
  
  return 'An unknown error occurred';
};

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'users' | 'stats'>('pending');

  const [pendingDogs, setPendingDogs] = useState<Dog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDogs: 0,
    activeDogs: 0,
    pendingDogs: 0,
  });

  const fetchPendingDogs = useCallback(async () => {
    try {
      console.log('Fetching pending dogs...');
      const response = await adminApi.getPendingDogs();
      console.log('Pending dogs response:', response);
      setPendingDogs(response.dogs || []);
    } catch (error) {
      console.error('Failed to fetch pending dogs:', error);
      toast.error('Failed to load pending dogs');
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      console.log('Fetching users...');
      const response = await adminApi.getAllUsers();
      console.log('Users response:', response);
      setUsers(response.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      console.log('Fetching stats...');
      const response = await adminApi.getStats();
      console.log('Stats response:', response);
      setStats(response.stats || {
        totalUsers: 0,
        totalDogs: 0,
        activeDogs: 0,
        pendingDogs: 0,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      toast.error('Failed to load stats');
    }
  }, []);

  useEffect(() => {
    console.log('Admin page mounted', { isAuthenticated, user });
    
    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to login');
      router.push('/login');
      return;
    }
    
    if (user?.role !== 'ADMIN') {
      console.log('Not admin, redirecting to home', { role: user?.role });
      toast.error('You do not have admin access');
      router.push('/');
      return;
    }

    const loadData = async () => {
      console.log('Loading admin data...');
      await Promise.all([fetchPendingDogs(), fetchUsers(), fetchStats()]);
      setLoading(false);
      console.log('Admin data loaded');
    };

    loadData();
  }, [isAuthenticated, user, router, fetchPendingDogs, fetchUsers, fetchStats]);

    const handleApproveDog = async (id: string) => {
    try {
      console.log('Approving dog:', id);
      const response = await adminApi.approveDog(id);
      console.log('Approve response:', response);
      toast.success('Dog approved successfully');
      await fetchPendingDogs();
      await fetchStats();
    } catch (error) {
      console.error('Failed to approve dog:', error);
      toast.error(getErrorMessage(error));
    }
  };

  const handleRejectDog = async (id: string) => {
    try {
      console.log('Rejecting dog:', id);
      const response = await adminApi.rejectDog(id);
      console.log('Reject response:', response);
      toast.success('Dog rejected');
      await fetchPendingDogs();
      await fetchStats();
    } catch (error) {
      console.error('Failed to reject dog:', error);
      toast.error(getErrorMessage(error));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage users and dog listings</p>
          <p className="text-sm text-gray-500 mt-1">
            Logged in as: {user?.email} (Role: {user?.role})
          </p>
        </div>

        <AdminStatsCards stats={stats} />

        <AdminTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          pendingCount={pendingDogs.length}
          usersCount={users.length}
        />

        {activeTab === 'pending' && (
          <PendingDogsList
            dogs={pendingDogs}
            onApprove={handleApproveDog}
            onReject={handleRejectDog}
          />
        )}

        {activeTab === 'users' && <UsersTable users={users} />}
      </div>
    </div>
  );
}