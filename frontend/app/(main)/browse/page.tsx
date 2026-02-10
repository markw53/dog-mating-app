'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { dogsApi } from '@/lib/api/dogs';
import { Dog } from '@/types';
import DogCard from '@/components/dog/DogCard';
import DogFilters from '@/components/dog/DogFilters';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Loader2, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';

interface Filters {
  breed: string;
  gender: string;
  minAge: string;
  maxAge: string;
  city: string;
  county: string;
  available: boolean;
}

export default function BrowsePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    breed: searchParams.get('breed') || '',
    gender: searchParams.get('gender') || '',
    minAge: searchParams.get('minAge') || '',
    maxAge: searchParams.get('maxAge') || '',
    city: searchParams.get('city') || '',
    county: searchParams.get('county') || '',
    available: searchParams.get('available') === 'true',
  });

  const fetchDogs = useCallback(async () => {
    setLoading(true);
    try {
      // Convert string ages to numbers for API
      const apiFilters: Record<string, string | number | boolean | undefined> = {
        breed: filters.breed || undefined,
        gender: filters.gender || undefined,
        minAge: filters.minAge ? Number(filters.minAge) : undefined,
        maxAge: filters.maxAge ? Number(filters.maxAge) : undefined,
        city: filters.city || undefined,
        county: filters.county || undefined,
        available: filters.available || undefined,
      };

      // Filter out undefined values
      const cleanFilters = Object.fromEntries(
        Object.entries(apiFilters).filter(([, value]) => value !== undefined)
      );
      
      const response = await dogsApi.getAll(cleanFilters);
      setDogs(response.dogs || []);
    } catch {
      toast.error('Failed to load dogs');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDogs();
  }, [fetchDogs]);

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== '' && value !== false) {
        params.set(key, value.toString());
      }
    });
    const queryString = params.toString();
    router.push(queryString ? `/browse?${queryString}` : '/browse');
  };

  const clearFilters = () => {
    handleFilterChange({
      breed: '',
      gender: '',
      minAge: '',
      maxAge: '',
      city: '',
      county: '',
      available: false,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <Section variant="primary" className="py-16 md:py-20">
        <div className="text-center">
          <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
            🔍 Discover Your Perfect Match
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            Browse Available Dogs
          </h1>
          <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto">
            Find verified dogs available for breeding from trusted owners
          </p>
        </div>
      </Section>

      {/* Main Content */}
      <section className="py-12 -mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar - Desktop */}
            <aside className="hidden lg:block lg:col-span-1">
              <DogFilters 
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </aside>

            {/* Mobile Filter Button */}
            <div className="lg:hidden col-span-1">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full btn-primary flex items-center justify-center mb-4"
              >
                <SlidersHorizontal className="h-5 w-5 mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>

              {showFilters && (
                <DogFilters 
                  filters={filters}
                  onFilterChange={handleFilterChange}
                />
              )}
            </div>

            {/* Dogs Grid */}
            <main className="lg:col-span-3">
              <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
                <div>
                  <p className="text-gray-600">
                    <span className="font-semibold text-gray-900">{dogs.length}</span> dogs found
                  </p>
                </div>
                {(filters.breed || filters.gender || filters.city || filters.county || filters.available || filters.minAge || filters.maxAge) && (
                  <button
                    onClick={clearFilters}
                    className="text-primary-600 hover:text-primary-700 font-semibold text-sm"
                  >
                    Clear all filters
                  </button>
                )}
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
                </div>
              ) : dogs.length === 0 ? (
                <Card hover={false} className="text-center py-16">
                  <div className="max-w-md mx-auto">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <SlidersHorizontal className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No dogs found</h3>
                    <p className="text-gray-600 mb-6">
                      Try adjusting your filters to see more results
                    </p>
                    <button
                      onClick={clearFilters}
                      className="btn-secondary"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {dogs.map((dog) => (
                    <DogCard key={dog.id || dog._id} dog={dog} />
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </section>
    </div>
  );
}