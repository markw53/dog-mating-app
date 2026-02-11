// app/(main)/dogs/[id]/matches/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { matchingApi, Match, MatchStats } from '@/lib/api/matching';
import { dogsApi } from '@/lib/api/dogs';
import { Dog } from '@/types';
import MatchCard from '@/components/matching/MatchCard';
import { Loader2, Heart, TrendingUp, MapPin, Award, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl } from '@/lib/api/client';
import { AxiosError } from 'axios';

export default function MatchesPage() {
  const params = useParams();
  const router = useRouter();
  const dogId = params.id as string;

  const { loading: authLoading, isAuthorized } = useRequireAuth();

  const [loading, setLoading] = useState(true);
  const [dog, setDog] = useState<Dog | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [stats, setStats] = useState<MatchStats | null>(null);
  
  // Filter states
  const [minScore, setMinScore] = useState(30);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Debounce filters
  const debouncedMinScore = useDebounce(minScore, 500);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  // Track if initial load is complete
  const initialLoadComplete = useRef(false);
  
  // Derive loading states
  const isFilteringScore = minScore !== debouncedMinScore;
  const isSearching = searchQuery !== debouncedSearchQuery;

  // Single effect to handle all data fetching
  useEffect(() => {
    if (!isAuthorized) return;

    const controller = new AbortController();
    
    const fetchData = async () => {
      try {
        // On initial load, fetch dog data first
        if (!initialLoadComplete.current) {
          setLoading(true);
          
          const dogData = await dogsApi.getById(dogId);
          
          if (controller.signal.aborted) return;
          
          setDog(dogData.dog);
          
          // Check if dog is available for breeding before fetching matches
          const isAvailable = dogData.dog.breeding?.available ?? dogData.dog.available ?? false;
          if (!isAvailable) {
            setLoading(false);
            initialLoadComplete.current = true;
            return;
          }
        }

        // Fetch matches with current debounced minScore
        const [matchData, statsData] = await Promise.all([
          matchingApi.findMatches(dogId, { limit: 20, minScore: debouncedMinScore }),
          matchingApi.getStats(dogId),
        ]);

        if (controller.signal.aborted) return;

        setMatches(matchData.matches);
        setStats(statsData.stats);
        
        if (!initialLoadComplete.current) {
          setLoading(false);
          initialLoadComplete.current = true;
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        
        console.error('Failed to fetch data:', error);
        const axiosError = error as AxiosError<{ message?: string }>;
        toast.error(axiosError.response?.data?.message || 'Failed to load data');
        
        if (axiosError.response?.status === 403 || axiosError.response?.status === 401) {
          router.push('/login');
        }
        
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, [isAuthorized, dogId, debouncedMinScore, router]);

  // Filter matches locally based on search query
  const filteredMatches = matches.filter(match => {
    if (!debouncedSearchQuery.trim()) return true;
    
    const searchLower = debouncedSearchQuery.toLowerCase().trim();
    const matchDog = match.dog;
    
    const ownerName = typeof matchDog.owner === 'object'
      ? `${matchDog.owner.firstName} ${matchDog.owner.lastName}`.toLowerCase()
      : '';
    
    const location = `${matchDog.city || ''} ${matchDog.county || ''} ${matchDog.location?.city || ''} ${matchDog.location?.state || ''}`.toLowerCase();
    
    return (
      matchDog.name.toLowerCase().includes(searchLower) ||
      matchDog.breed.toLowerCase().includes(searchLower) ||
      ownerName.includes(searchLower) ||
      location.includes(searchLower)
    );
  });

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authorized
  if (!isAuthorized) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Finding perfect matches...</p>
        </div>
      </div>
    );
  }

  if (!dog) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Dog not found</p>
          <Link href="/browse" className="btn-primary">
            Browse Dogs
          </Link>
        </div>
      </div>
    );
  }

  // Check if dog is available for breeding
  const isAvailableForBreeding = dog.breeding?.available ?? dog.available ?? false;
  
  if (!isAvailableForBreeding) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Not Available</h2>
          <p className="text-gray-600 mb-4">This dog is not available for breeding</p>
          <Link href={`/dogs/${dogId}`} className="btn-primary">
            Back to Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={`/dogs/${dogId}`}
            className="text-white/80 hover:text-white mb-4 inline-flex items-center gap-2 transition-colors"
          >
            ← Back to Profile
          </Link>
          
          <div className="flex items-center gap-6">
            {/* Dog Image */}
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
                {dog.breed} • {dog.gender === 'male' ? 'Male' : 'Female'} • {dog.age} years old
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
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
        )}

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

        {/* Results count */}
        {(debouncedSearchQuery || matches.length !== filteredMatches.length) && (
          <p className="text-sm text-gray-500 mb-4">
            Showing {filteredMatches.length} of {matches.length} matches
          </p>
        )}

        {/* Matches */}
        {filteredMatches.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No matches found</h3>
            <p className="text-gray-600 mb-4">
              {debouncedSearchQuery 
                ? 'Try a different search term or clear your search.'
                : 'Try lowering the minimum match score or check back later for new listings.'
              }
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
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {filteredMatches.length} {filteredMatches.length === 1 ? 'Match' : 'Matches'} Found
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMatches.map((match) => (
                <MatchCard key={match.dog.id || match.dog._id} match={match} />
              ))}
            </div>
          </>
        )}
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