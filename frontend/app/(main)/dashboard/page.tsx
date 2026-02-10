'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { dogsApi } from '@/lib/api/dogs';
import { getImageUrl } from '@/lib/api/client';
import { Dog } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { 
  PlusCircle, Edit, Trash2, Eye, Loader2, Dog as DogIcon, 
  AlertCircle, CheckCircle, Clock 
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Section } from '@/components/ui/Section';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  // Use the auth hook - handles redirect automatically if not authenticated
  const { user, loading: authLoading, isAuthorized } = useRequireAuth();
  
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

  // Fetch dogs only when authorized
  useEffect(() => {
    if (isAuthorized) {
      fetchMyDogs();
    }
  }, [isAuthorized, fetchMyDogs]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this dog listing? This action cannot be undone.')) {
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

  // Calculate stats
  const stats = {
    total: dogs.length,
    active: dogs.filter(d => d.status === 'active').length,
    pending: dogs.filter(d => d.status === 'pending').length,
    totalViews: dogs.reduce((sum, d) => sum + (d.views || 0), 0),
  };

  // Show loading while checking auth or fetching data
  if (authLoading || !isAuthorized || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">
            {authLoading ? 'Checking authentication...' : 'Loading your dashboard...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <Section variant="primary" className="py-12 md:py-16">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Welcome back, {user?.firstName}! 👋
            </h1>
            <p className="text-lg text-primary-100">
              Manage your dog listings and track their performance
            </p>
          </div>
          <Link 
            href="/dashboard/add-dog" 
            className="group bg-white text-primary-700 px-6 py-3 rounded-xl font-bold hover:bg-primary-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-flex items-center justify-center"
          >
            <PlusCircle className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform" />
            Add New Dog
          </Link>
        </div>
      </Section>

      {/* Stats Section */}
      <section className="py-8 -mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={<DogIcon className="h-8 w-8" />}
              label="Total Dogs"
              value={stats.total.toString()}
              color="from-blue-500 to-blue-600"
              bgColor="bg-blue-50"
            />
            <StatCard
              icon={<CheckCircle className="h-8 w-8" />}
              label="Active Listings"
              value={stats.active.toString()}
              color="from-green-500 to-green-600"
              bgColor="bg-green-50"
            />
            <StatCard
              icon={<Clock className="h-8 w-8" />}
              label="Pending Review"
              value={stats.pending.toString()}
              color="from-yellow-500 to-yellow-600"
              bgColor="bg-yellow-50"
            />
            <StatCard
              icon={<Eye className="h-8 w-8" />}
              label="Total Views"
              value={stats.totalViews.toString()}
              color="from-purple-500 to-purple-600"
              bgColor="bg-purple-50"
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {dogs.length === 0 ? (
            <Card className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <DogIcon className="h-12 w-12 text-primary-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  No Dogs Listed Yet
                </h3>
                <p className="text-gray-600 mb-8 text-lg">
                  Start by adding your first dog to connect with potential breeding partners
                </p>
                <Link 
                  href="/dashboard/add-dog" 
                  className="btn-primary inline-flex items-center text-lg px-8 py-4"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Add Your First Dog
                </Link>
              </div>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Your Dogs ({dogs.length})
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dogs.map((dog) => (
                  <DogCard 
                    key={dog._id || dog.id} 
                    dog={dog} 
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

// StatCard and DogCard components remain the same...
function StatCard({ 
  icon, 
  label, 
  value, 
  color, 
  bgColor 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  color: string;
  bgColor: string;
}) {
  return (
    <Card className="relative overflow-hidden group hover:scale-105 transition-transform">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${bgColor} p-4 rounded-2xl`}>
          <div className={`bg-gradient-to-br ${color} text-white p-3 rounded-xl shadow-lg`}>
            {icon}
          </div>
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${color} transform scale-x-0 group-hover:scale-x-100 transition-transform`}></div>
    </Card>
  );
}

function DogCard({ dog, onDelete }: { dog: Dog; onDelete: (id: string) => void }) {
  const getStatusStyles = () => {
    switch (dog.status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (dog.status) {
      case 'active':
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case 'pending':
        return <Clock className="h-3 w-3 mr-1" />;
      default:
        return <AlertCircle className="h-3 w-3 mr-1" />;
    }
  };

  return (
    <Card className="group overflow-hidden">
      <div className="relative bg-gray-200 rounded-xl overflow-hidden mb-4 h-48">
        <Image
          src={getImageUrl(dog.mainImage || dog.images?.[0] || '') || '/placeholder-dog.jpg'}
          alt={dog.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
          unoptimized
        />
        
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 backdrop-blur-sm ${getStatusStyles()} flex items-center`}>
            {getStatusIcon()}
            {dog.status.toUpperCase()}
          </span>
        </div>

        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
          <Eye className="h-3 w-3 mr-1" />
          {dog.views || 0} views
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
            {dog.name}
          </h3>
          <p className="text-gray-600">{dog.breed}</p>
        </div>

        {dog.breeding?.available && (
          <div className="flex items-center text-sm text-green-600 font-medium">
            <CheckCircle className="h-4 w-4 mr-1" />
            Available for breeding
          </div>
        )}

        <div className="flex gap-2 pt-3 border-t border-gray-200">
          <Link
            href={`/dogs/${dog._id || dog.id}`}
            className="flex-1 btn-secondary text-center text-sm py-2 flex items-center justify-center"
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Link>
          <Link
            href={`/dogs/${dog._id || dog.id}/edit`}
            className="flex-1 btn-primary text-center text-sm py-2 flex items-center justify-center"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Link>
          <button
            onClick={() => onDelete(dog._id || dog.id)}
            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all transform hover:scale-105 shadow-sm hover:shadow-md"
            title="Delete dog"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}