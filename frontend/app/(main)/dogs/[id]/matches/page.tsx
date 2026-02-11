// app/(main)/dogs/[id]/matches/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useFetch } from '@/lib/hooks/useFetch';
import { matchingApi, Match, MatchStats } from '@/lib/api/matching';
import { dogsApi } from '@/lib/api/dogs';
import { Dog } from '@/types';
import MatchCard from '@/components/matching/MatchCard';
import { Card } from '@/components/ui/Card';
import {
  Loader2,
  Heart,
  TrendingUp,
  MapPin,
  Award,
  Search,
  X,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl } from '@/lib/api/client';
import { formatDogAge } from '@/lib/utils/formatters';

interface DogResponse {
  dog: Dog;
}

interface MatchesResponse {
  matches: Match[];
}

interface StatsResponse {
  stats: MatchStats;
}

export default function MatchesPage() {
  const params = useParams();
  const dogId = params.id as string;

  const { loading: authLoading, isAuthorized } = useRequireAuth();

  // Filter states
  const [minScore, setMinScore] = useState(30);
  const [searchQuery, setSearchQuery] = useState('');

  // Debounce filters
  const debouncedMinScore = useDebounce(minScore, 500);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Derive loading states for UI feedback
  const isFilteringScore = minScore !== debouncedMinScore;
  const isSearching = searchQuery !== debouncedSearchQuery;

  // Fetch dog data - only when authorized
  const {
    data: dogData,
    loading: dogLoading,
    error: dogError,
    refetch: refetchDog,
  } = useFetch<DogResponse>(
    () => dogsApi.getById(dogId),
    [dogId, isAuthorized],
    {
      onError: () => {
        toast.error('Failed to load dog profile');
      },
    }
  );

  const dog = isAuthorized ? dogData?.dog : null;
  const isAvailableForBreeding = dog?.breeding?.available ?? dog?.available ?? false;

  // Fetch matches - only when dog is available for breeding
  const {
    data: matchesData,
    loading: matchesLoading,
    error: matchesError,
    refetch: refetchMatches,
  } = useFetch<MatchesResponse>(
    () => matchingApi.findMatches(dogId, { limit: 20, minScore: debouncedMinScore }),
    [dogId, debouncedMinScore, isAvailableForBreeding],
    {
      onError: () => {
        toast.error('Failed to load matches');
      },
    }
  );

  // Fetch stats - only when dog is available for breeding
  const {
    data: statsData,
    loading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useFetch<StatsResponse>(
    () => matchingApi.getStats(dogId),
    [dogId, isAvailableForBreeding],
    {
      onError: () => {
        console.error('Failed to load match stats');
      },
    }
  );

  // Memoize matches to prevent new array reference on every render
  const matches = useMemo(() => {
    return matchesData?.matches ?? [];
  }, [matchesData?.matches]);

  const stats = statsData?.stats;

  // Filter matches locally based on search query
  const filteredMatches = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return matches;

    const searchLower = debouncedSearchQuery.toLowerCase().trim();

    return matches.filter((match) => {
      const matchDog = match.dog;

      const ownerName =
        typeof matchDog.owner === 'object'
          ? `${matchDog.owner.firstName} ${matchDog.owner.lastName}`.toLowerCase()
          : '';

      const location =
        `${matchDog.city || ''} ${matchDog.county || ''} ${matchDog.location?.city || ''} ${matchDog.location?.state || ''}`.toLowerCase();

      return (
        matchDog.name.toLowerCase().includes(searchLower) ||
        matchDog.breed.toLowerCase().includes(searchLower) ||
        ownerName.includes(searchLower) ||
        location.includes(searchLower)
      );
    });
  }, [matches, debouncedSearchQuery]);

  // Combined refetch function
  const refetchAll = () => {
    refetchDog();
    if (isAvailableForBreeding) {
      refetchMatches();
      refetchStats();
    }
  };

  // Loading: Auth check
  if (authLoading) {
    return (
      <LoadingScreen message="Checking authentication..." />
    );
  }

  // Not authorized - redirect handled by useRequireAuth
  if (!isAuthorized) {
    return (
      <LoadingScreen message="Redirecting to login..." />
    );
  }

  // Loading: Dog data
  if (dogLoading) {
    return (
      <LoadingScreen message="Loading dog profile..." />
    );
  }

  // Error: Failed to load dog
  if (dogError) {
    const is404 = dogError.response?.status === 404;

    return (
      <ErrorScreen
        title={is404 ? 'Dog Not Found' : 'Failed to Load'}
        message={
          is404
            ? "The dog you're looking for doesn't exist or has been removed."
            : 'There was an error loading the dog profile. Please try again.'
        }
        onRetry={!is404 ? refetchDog : undefined}
        backLink="/browse"
        backLabel="Browse Dogs"
      />
    );
  }

  // No dog data
  if (!dog) {
    return (
      <ErrorScreen
        title="Dog Not Found"
        message="Unable to find the requested dog."
        backLink="/browse"
        backLabel="Browse Dogs"
      />
    );
  }

  // Dog not available for breeding
  if (!isAvailableForBreeding) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Card className="text-center py-12 px-8 max-w-md">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Not Available for Breeding
          </h2>
          <p className="text-gray-600 mb-6">
            {dog.name} is not currently available for breeding matches.
          </p>
          <Link href={`/dogs/${dogId}`} className="btn-primary">
            Back to Profile
          </Link>
        </Card>
      </div>
    );
  }

  // Error: Failed to load matches
  if (matchesError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MatchesHeader dog={dog} dogId={dogId} onRefresh={refetchAll} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Failed to Load Matches
            </h3>
            <p className="text-gray-600 mb-6">
              There was an error loading potential matches. Please try again.
            </p>
            <button onClick={refetchMatches} className="btn-primary">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <MatchesHeader dog={dog} dogId={dogId} onRefresh={refetchAll} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {statsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-md p-6 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : stats && !statsError ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={<Heart className="w-6 h-6" />}
              label="Potential Matches"
              value={stats.totalPotential.toString()}
              color="bg-pink-500"
            />
            <StatCard
              icon={<Award className="w-6 h-6" />}
              label="Same Breed"
              value={stats.sameBreed.toString()}
              color="bg-blue-500"
            />
            <StatCard
              icon={<MapPin className="w-6 h-6" />}
              label="Nearby"
              value={stats.nearby.toString()}
              color="bg-green-500"
            />
            <StatCard
              icon={<TrendingUp className="w-6 h-6" />}
              label="Breed Compatibility"
              value={`${stats.breedCompatibility}%`}
              color="bg-purple-500"
            />
          </div>
        ) : null}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 space-y-4">
          {/* Minimum Score Filter */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <label className="font-medium text-gray-700 whitespace-nowrap">
              Minimum Match Score:
            </label>
            <div className="flex gap-2 flex-wrap items-center">
              {[0, 30, 50, 70].map((score) => (
                <button
                  key={score}
                  onClick={() => setMinScore(score)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    minScore === score
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {score}%+
                </button>
              ))}
              {isFilteringScore && (
                <Loader2 className="h-5 w-5 animate-spin text-primary-600 ml-2" />
              )}
            </div>
          </div>

          {/* Search Filter */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <label className="font-medium text-gray-700 whitespace-nowrap">
              Search Matches:
            </label>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, breed, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                {isSearching && (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                )}
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Loading matches */}
        {matchesLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
              <p className="text-gray-600">Finding perfect matches...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Results count */}
            {(debouncedSearchQuery ||
              matches.length !== filteredMatches.length) && (
              <p className="text-sm text-gray-500 mb-4">
                Showing {filteredMatches.length} of {matches.length} matches
              </p>
            )}

            {/* Matches Grid */}
            {filteredMatches.length === 0 ? (
              <Card hover={false} className="text-center py-12">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No matches found
                </h3>
                <p className="text-gray-600 mb-4">
                  {debouncedSearchQuery
                    ? 'Try a different search term or clear your search.'
                    : 'Try lowering the minimum match score or check back later for new listings.'}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {debouncedSearchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="btn-secondary"
                    >
                      Clear Search
                    </button>
                  )}
                  {minScore > 0 && (
                    <button
                      onClick={() => setMinScore(0)}
                      className="btn-primary"
                    >
                      Show All Potential Matches
                    </button>
                  )}
                </div>
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {filteredMatches.length}{' '}
                    {filteredMatches.length === 1 ? 'Match' : 'Matches'} Found
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMatches.map((match) => (
                    <MatchCard
                      key={match.dog.id || match.dog._id}
                      match={match}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ============ Helper Components ============

function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}

function ErrorScreen({
  title,
  message,
  onRetry,
  backLink,
  backLabel,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
  backLink: string;
  backLabel: string;
}) {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      <Card className="text-center py-12 px-8 max-w-md">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <button onClick={onRetry} className="btn-primary">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </button>
          )}
          <Link href={backLink} className="btn-secondary">
            {backLabel}
          </Link>
        </div>
      </Card>
    </div>
  );
}

function MatchesHeader({
  dog,
  dogId,
  onRefresh,
}: {
  dog: Dog;
  dogId: string;
  onRefresh: () => void;
}) {
    
  return (
    <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <Link
            href={`/dogs/${dogId}`}
            className="text-white/80 hover:text-white inline-flex items-center gap-2 transition-colors"
          >
            ← Back to Profile
          </Link>
          <button
            onClick={onRefresh}
            className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="Refresh matches"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
            {dog.mainImage || dog.images?.[0] ? (
              <Image
                src={getImageUrl(dog.mainImage || dog.images?.[0] || '')}
                alt={dog.name}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-white/20 flex items-center justify-center">
                <Heart className="w-8 h-8" />
              </div>
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-2">
              Find Matches for {dog.name}
            </h1>
            <p className="text-primary-100">
              {dog.breed} • {dog.gender === 'male' ? 'Male' : 'Female'} •{' '}
              {formatDogAge(dog)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${color} p-3 rounded-lg text-white`}>{icon}</div>
      </div>
    </div>
  );
}