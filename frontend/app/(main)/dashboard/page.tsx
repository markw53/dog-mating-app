'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { dogsApi } from '@/lib/api/dogs';
import { getImageUrl } from '@/lib/api/client';
import { Dog } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { PlusCircle, Edit, Trash2, Eye, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyDogs = useCallback(async () => {
    try {
      const response = await dogsApi.getMyDogs();
      setDogs(response.dogs);
    } catch {
      toast.error('Failed to load your dogs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchMyDogs();
  }, [isAuthenticated, router, fetchMyDogs]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this dog listing?')) {
      return;
    }

    try {
      await dogsApi.delete(id);
      toast.success('Dog listing deleted successfully');
      fetchMyDogs();
    } catch {
      toast.error('Failed to delete dog listing');
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
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Dogs</h1>
            <p className="text-gray-600 mt-1">Manage your dog listings</p>
          </div>
          <Link href="/dashboard/add-dog" className="btn-primary flex items-center space-x-2">
            <PlusCircle className="h-5 w-5" />
            <span>Add New Dog</span>
          </Link>
        </div>

        {dogs.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500 text-lg mb-4">You haven&apos;t added any dogs yet</p>
            <Link href="/dashboard/add-dog" className="btn-primary inline-block">
              Add Your First Dog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dogs.map((dog) => (
              <div key={dog._id || dog.id} className="card hover:shadow-lg transition-shadow">
                <div className="aspect-w-16 aspect-h-12 bg-gray-200 rounded-lg overflow-hidden mb-4">
                  <Image
                    src={getImageUrl(dog.mainImage || dog.images?.[0] || '') || '/placeholder-dog.jpg'}
                    alt={dog.name}
                    width={400}
                    height={300}
                    className="object-cover w-full h-48"
                    unoptimized
                  />
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{dog.name}</h3>
                    <p className="text-gray-600">{dog.breed}</p>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      dog.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : dog.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {dog.status}
                    </span>
                    <div className="flex items-center text-gray-600">
                      <Eye className="h-4 w-4 mr-1" />
                      <span>{dog.views} views</span>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-3 border-t">
                    <Link
                      href={`/dogs/${dog._id || dog.id}`}
                      className="flex-1 btn-secondary text-center text-sm py-2"
                    >
                      View
                    </Link>
                    <Link
                      href={`/dashboard/edit-dog/${dog._id || dog.id}`}
                      className="flex-1 btn-primary text-center text-sm py-2 flex items-center justify-center"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(dog._id || dog.id)}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}