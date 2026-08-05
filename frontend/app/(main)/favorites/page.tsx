'use client';

import Link from 'next/link';
import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { useFetch } from '@/lib/hooks/useFetch';
import { useFavoritesStore } from '@/lib/store/favoritesStore';
import { favoritesApi } from '@/lib/api/favorites';
import { Dog } from '@/types';
import DogCard from '@/components/dog/DogCard';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Heart, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface FavoritesResponse {
  dogs: Dog[];
}

export default function FavoritesPage() {
  const { loading: authLoading, isAuthorized } = useRequireAuth();
  // Re-render the grid live as hearts are toggled on this page
  const savedIds = useFavoritesStore((s) => s.ids);

  const { data, loading, error, refetch } = useFetch<FavoritesResponse>(
    () => favoritesApi.getAll(),
    [isAuthorized],
    {
      cacheKey: 'favorites',
      onError: () => {
        toast.error('Failed to load saved dogs');
      },
    }
  );

  // Unhearting a dog on this page removes its card immediately
  const dogs = (isAuthorized ? data?.dogs || [] : []).filter((dog) =>
    savedIds.has(dog.id || dog._id || '')
  );

  if (authLoading || !isAuthorized) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" role="status">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" aria-hidden="true" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <Section variant="primary" className="py-12 md:py-16">
        <header className="text-center">
          <p className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
            <span className="text-white font-semibold text-sm">💗 Your Shortlist</span>
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Saved Dogs</h1>
          <p className="text-lg text-primary-100 max-w-2xl mx-auto">
            Dogs you&apos;ve saved while browsing — tap the heart on any card to update
          </p>
        </header>
      </Section>

      <section className="py-8 -mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <Card hover={false} className="text-center py-12">
              <p className="text-gray-600 mb-6">
                There was an error loading your saved dogs.
              </p>
              <button onClick={refetch} className="btn-primary">
                <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
                Try Again
              </button>
            </Card>
          )}

          {loading && !error && (
            <div className="flex justify-center items-center py-20" role="status">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" aria-hidden="true" />
                <p className="text-gray-600">Loading saved dogs...</p>
              </div>
            </div>
          )}

          {!loading && !error && dogs.length === 0 && (
            <Card hover={false} className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                  <Heart className="h-10 w-10 text-pink-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  No saved dogs yet
                </h2>
                <p className="text-gray-600 mb-6">
                  Tap the heart on any dog while browsing and it&apos;ll appear here.
                </p>
                <Link href="/browse" className="btn-primary inline-flex items-center justify-center px-6 py-3">
                  Browse Dogs
                </Link>
              </div>
            </Card>
          )}

          {!loading && !error && dogs.length > 0 && (
            <>
              <header className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {dogs.length} saved {dogs.length === 1 ? 'dog' : 'dogs'}
                </h2>
              </header>
              <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {dogs.map((dog) => (
                  <li key={dog.id || dog._id}>
                    <DogCard dog={dog} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
