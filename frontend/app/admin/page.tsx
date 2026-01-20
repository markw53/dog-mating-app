'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { adminApi } from '@/lib/api/admin';
import { Dog, User } from '@/types';
import Image from 'next/image';
import { CheckCircle, XCircle, Users, DogIcon, Eye, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <DogIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Dogs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDogs}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active Dogs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeDogs}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Eye className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingDogs}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending Dogs ({pendingDogs.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Users ({users.length})
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'pending' && (
          <div className="space-y-4">
            {pendingDogs.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-500">No pending dogs to review</p>
              </div>
            ) : (
              pendingDogs.map((dog) => (
                <div key={dog._id} className="card">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-48 h-48 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={dog.mainImage || dog.images[0] || '/placeholder-dog.jpg'}
                        alt={dog.name}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{dog.name}</h3>
                          <p className="text-gray-600">{dog.breed}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Owner: {dog.owner.firstName} {dog.owner.lastName}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                          Pending
                        </span>
                      </div>

                      <p className="text-gray-700 mb-4 line-clamp-2">{dog.description}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                        <div>
                          <span className="text-gray-600">Gender:</span>
                          <span className="font-semibold ml-2 capitalize">{dog.gender}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Age:</span>
                          <span className="font-semibold ml-2">{dog.age} years</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Weight:</span>
                          <span className="font-semibold ml-2">{dog.weight} lbs</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Location:</span>
                          <span className="font-semibold ml-2">
                            {dog.location.city}
                          </span>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleApproveDog(dog._id)}
                          className="btn-primary flex items-center"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectDog(dog._id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </button>
                        <Link
                          href={`/dogs/${dog._id}`}
                          className="btn-secondary flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="card overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id || user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.avatar ? (
                          <Image
                            src={user.avatar}
                            alt={user.firstName}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.location?.city}, {user.location?.state}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.verified
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.verified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}