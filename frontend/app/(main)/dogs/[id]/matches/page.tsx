'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { matchingApi, Match, MatchStats } from '@/lib/api/matching';
import { dogsApi } from '@/lib/api/dogs';
import { Dog } from '@/types';
import MatchCard from '@/components/matching/MatchCard';
import { Loader2, Heart, TrendingUp, MapPin, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl } from '@/lib/api/client';
import { AxiosError } from 'axios';

export default function MatchesPage() {
  const params = useParams();
  const router = useRouter();
  const dogId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [dog, setDog] = useState<Dog | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [stats, setStats] = useState<MatchStats | null>(null);
  const [minScore, setMinScore] = useState(30);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [dogData, matchData, statsData] = await Promise.all([
        dogsApi.getById(dogId),
        matchingApi.findMatches(dogId, { limit: 20, minScore }),
        matchingApi.getStats(dogId),
      ]);

      setDog(dogData.dog);
      setMatches(matchData.matches);
      setStats(statsData.stats);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(axiosError.response?.data?.message || 'Failed to load matches');
      if (axiosError.response?.status === 403 || axiosError.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [dogId, minScore, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Finding perfect matches...</p>
        </div>
      </div>
    );
  }

  if (!dog) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600">Dog not found</p>
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
            className="text-white/80 hover:text-white mb-4 inline-flex items-center gap-2"
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

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <label className="font-medium text-gray-700">Minimum Match Score:</label>
            <div className="flex gap-2 flex-wrap">
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
            </div>
          </div>
        </div>

        {/* Matches */}
        {matches.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No matches found</h3>
            <p className="text-gray-600 mb-4">
              Try lowering the minimum match score or check back later for new listings.
            </p>
            <button
              onClick={() => setMinScore(0)}
              className="btn-primary"
            >
              Show All Potential Matches
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {matches.length} {matches.length === 1 ? 'Match' : 'Matches'} Found
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map((match) => (
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