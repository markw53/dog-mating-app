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
      const response = await adminApi.getPendingDogs();
      setPendingDogs(response.dogs);
    } catch {
      toast.error('Failed to load pending dogs');
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await adminApi.getAllUsers();
      setUsers(response.users);
    } catch {
      toast.error('Failed to load users');
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await adminApi.getStats();
      setStats(response.stats);
    } catch {
      toast.error('Failed to load stats');
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/');
      return;
    }

    const loadData = async () => {
      await Promise.all([fetchPendingDogs(), fetchUsers(), fetchStats()]);
      setLoading(false);
    };

    loadData();
  }, [isAuthenticated, user, router, fetchPendingDogs, fetchUsers, fetchStats]);

  const handleApproveDog = async (id: string) => {
    try {
      await adminApi.approveDog(id);
      toast.success('Dog approved successfully');
      fetchPendingDogs();
      fetchStats();
    } catch {
      toast.error('Failed to approve dog');
    }
  };

  const handleRejectDog = async (id: string) => {
    try {
      await adminApi.rejectDog(id);
      toast.success('Dog rejected');
      fetchPendingDogs();
      fetchStats();
    } catch {
      toast.error('Failed to reject dog');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage users and dog listings</p>
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