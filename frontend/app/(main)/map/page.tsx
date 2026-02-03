'use client';

import { useState, useEffect } from 'react';
import { dogsApi } from '@/lib/api/dogs';
import { Dog } from '@/types';
import DogMap from '@/components/map/DogMapClient';
import { Loader2, Map as MapIcon, List } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function MapPage() {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDogs();
  }, []);

  const fetchDogs = async () => {
    try {
      // Remove status filter or adjust based on your API
      const response = await dogsApi.getAll({});
      setDogs(response.dogs || []); // Add fallback to empty array
    } catch (error) {
      console.error('Failed to fetch dogs:', error);
      toast.error('Failed to load dogs');
      setDogs([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <MapIcon className="h-8 w-8 text-primary-600" />
                Dog Map
              </h1>
              <p className="text-gray-600 mt-2">
                Explore dogs near you • {dogs.length} dogs available
              </p>
            </div>
            <Link
              href="/browse"
              className="btn-secondary flex items-center gap-2"
            >
              <List className="h-4 w-4" />
              List View
            </Link>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DogMap dogs={dogs} />
        
        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-900">How to use the map</h3>
              <p className="mt-1 text-sm text-blue-700">
                Click on any pin to see dog details. Blue pins represent male dogs, pink pins represent female dogs. Click &quot;View Profile&quot; to see full details and contact the owner.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}