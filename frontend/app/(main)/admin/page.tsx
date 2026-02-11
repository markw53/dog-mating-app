// app/(admin)/admin/page.tsx
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { adminApi } from '@/lib/api/admin';
import { Dog, User } from '@/types';
import toast from 'react-hot-toast';
import { Loader2, ShieldAlert, Search, X } from 'lucide-react';
import AdminStatsCards from '@/components/admin/AdminStatsCard';
import AdminTabs from '@/components/admin/AdminTabs';
import PendingDogsList from '@/components/admin/PendingDogsList';
import UsersTable from '@/components/admin/UsersTable';
import { AxiosError } from 'axios';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    return axiosError.response?.data?.message || 'An error occurred';
  }
  
  return 'An unknown error occurred';
};

export default function AdminPage() {
  const { user, loading: authLoading, isAuthorized } = useRequireAuth({
    requiredRole: 'ADMIN',
    redirectTo: '/login',
  });

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

  // Search states
  const [userSearch, setUserSearch] = useState('');
  const [dogSearch, setDogSearch] = useState('');

  // Debounce search terms
  const debouncedUserSearch = useDebounce(userSearch, 300);
  const debouncedDogSearch = useDebounce(dogSearch, 300);

  // Derive if searching (for loading indicators)
  const isSearchingUsers = userSearch !== debouncedUserSearch;
  const isSearchingDogs = dogSearch !== debouncedDogSearch;

  // Filter users based on debounced search
  const filteredUsers = useMemo(() => {
    if (!debouncedUserSearch.trim()) return users;
    
    const searchLower = debouncedUserSearch.toLowerCase().trim();
    return users.filter(user => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const email = user.email.toLowerCase();
      const role = user.role.toLowerCase();
      const location = `${user.city || ''} ${user.county || ''}`.toLowerCase();
      
      return (
        fullName.includes(searchLower) ||
        email.includes(searchLower) ||
        role.includes(searchLower) ||
        location.includes(searchLower)
      );
    });
  }, [users, debouncedUserSearch]);

  // Filter pending dogs based on debounced search
  const filteredPendingDogs = useMemo(() => {
    if (!debouncedDogSearch.trim()) return pendingDogs;
    
    const searchLower = debouncedDogSearch.toLowerCase().trim();
    return pendingDogs.filter(dog => {
      const ownerName = typeof dog.owner === 'object' 
        ? `${dog.owner.firstName} ${dog.owner.lastName}`.toLowerCase()
        : '';
      const location = `${dog.city || ''} ${dog.county || ''}`.toLowerCase();
      
      return (
        dog.name.toLowerCase().includes(searchLower) ||
        dog.breed.toLowerCase().includes(searchLower) ||
        ownerName.includes(searchLower) ||
        location.includes(searchLower)
      );
    });
  }, [pendingDogs, debouncedDogSearch]);

  const fetchPendingDogs = useCallback(async () => {
    try {
      const response = await adminApi.getPendingDogs();
      setPendingDogs(response.dogs || []);
    } catch (error) {
      console.error('Failed to fetch pending dogs:', error);
      toast.error('Failed to load pending dogs');
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await adminApi.getAllUsers();
      setUsers(response.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await adminApi.getStats();
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
    if (!isAuthorized) return;

    const loadData = async () => {
      await Promise.all([fetchPendingDogs(), fetchUsers(), fetchStats()]);
      setLoading(false);
    };

    loadData();
  }, [isAuthorized, fetchPendingDogs, fetchUsers, fetchStats]);

  const handleApproveDog = async (id: string) => {
    try {
      await adminApi.approveDog(id);
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
      await adminApi.rejectDog(id);
      toast.success('Dog rejected');
      await fetchPendingDogs();
      await fetchStats();
    } catch (error) {
      console.error('Failed to reject dog:', error);
      toast.error(getErrorMessage(error));
    }
  };

  // Clear search when switching tabs
  const handleTabChange = (tab: 'pending' | 'users' | 'stats') => {
    setActiveTab(tab);
    // Optionally clear search when switching tabs
    // setUserSearch('');
    // setDogSearch('');
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <ShieldAlert className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don&apos;t have permission to access this page.</p>
          <p className="text-sm text-gray-500 mt-2">Redirecting...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
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
          onTabChange={handleTabChange}
          pendingCount={pendingDogs.length}
          usersCount={users.length}
        />

        {/* Search Bar - Contextual based on active tab */}
        {activeTab !== 'stats' && (
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={
                  activeTab === 'pending' 
                    ? 'Search pending dogs by name, breed, owner...' 
                    : 'Search users by name, email, role...'
                }
                value={activeTab === 'pending' ? dogSearch : userSearch}
                onChange={(e) => {
                  if (activeTab === 'pending') {
                    setDogSearch(e.target.value);
                  } else {
                    setUserSearch(e.target.value);
                  }
                }}
                className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all bg-white"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                {/* Loading indicator while debouncing */}
                {((activeTab === 'pending' && isSearchingDogs) || 
                  (activeTab === 'users' && isSearchingUsers)) && (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                )}
                {/* Clear button */}
                {((activeTab === 'pending' && dogSearch) || 
                  (activeTab === 'users' && userSearch)) && (
                  <button
                    onClick={() => {
                      if (activeTab === 'pending') {
                        setDogSearch('');
                      } else {
                        setUserSearch('');
                      }
                    }}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Search results count */}
            {activeTab === 'pending' && debouncedDogSearch && (
              <p className="text-sm text-gray-500 mt-2">
                Showing {filteredPendingDogs.length} of {pendingDogs.length} pending dogs
              </p>
            )}
            {activeTab === 'users' && debouncedUserSearch && (
              <p className="text-sm text-gray-500 mt-2">
                Showing {filteredUsers.length} of {users.length} users
              </p>
            )}
          </div>
        )}

        {activeTab === 'pending' && (
          <PendingDogsList
            dogs={filteredPendingDogs}
            onApprove={handleApproveDog}
            onReject={handleRejectDog}
          />
        )}

        {activeTab === 'users' && <UsersTable users={filteredUsers} />}
      </div>
    </div>
  );
}