'use client';

import { Match } from '@/lib/api/matching';
import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl } from '@/lib/api/client';
import { MapPin, Heart, Award, TrendingUp } from 'lucide-react';
import { User } from '@/types';

interface MatchCardProps {
  match: Match;
}

// Helper to safely get owner info
function getOwnerInfo(owner: User | string | undefined): User | null {
  if (!owner || typeof owner === 'string') return null;
  return owner;
}

export default function MatchCard({ match }: MatchCardProps) {
  const { dog, matchScore, matchReasons, distance } = match;
  const imageUrl = getImageUrl(dog.mainImage || dog.images?.[0] || '');
  const ownerInfo = getOwnerInfo(dog.owner);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Great Match';
    if (score >= 40) return 'Good Match';
    return 'Fair Match';
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200">
      {/* Image */}
      <div className="relative h-48 bg-gray-200">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={dog.name}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image
          </div>
        )}

        {/* Match Score Badge */}
        <div className="absolute top-3 right-3">
          <div
            className={`px-4 py-2 rounded-full font-bold text-sm border-2 backdrop-blur-sm ${getScoreColor(
              matchScore
            )}`}
          >
            {matchScore}% Match
          </div>
        </div>

        {/* Distance Badge */}
        {distance !== undefined && (
          <div className="absolute top-3 left-3">
            <div className="bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {Math.round(distance)}km away
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{dog.name}</h3>
            <p className="text-gray-600">{dog.breed}</p>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              dog.gender === 'male'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-pink-100 text-pink-800'
            }`}
          >
            {dog.gender === 'male' ? '♂ Male' : '♀ Female'}
          </div>
        </div>

        {/* Match Score Label */}
        <div className="flex items-center gap-2 mb-3">
          <Award className={`w-5 h-5 ${matchScore >= 80 ? 'text-green-600' : 'text-blue-600'}`} />
          <span className="font-semibold text-gray-900">{getScoreLabel(matchScore)}</span>
        </div>

        {/* Match Reasons */}
        <div className="space-y-2 mb-4">
          {matchReasons.slice(0, 3).map((reason, index) => (
            <div key={index} className="flex items-start gap-2 text-sm text-gray-700">
              <TrendingUp className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
              <span>{reason}</span>
            </div>
          ))}
        </div>

        {/* Owner Info */}
        {ownerInfo && (
          <div className="border-t pt-3 mb-4">
            <p className="text-sm text-gray-600">
              Owner: {ownerInfo.firstName} {ownerInfo.lastName}
            </p>
            {(dog.location?.city || ownerInfo.city) && (
              <p className="text-sm text-gray-500">
                {dog.location?.city || ownerInfo.city}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href={`/dogs/${dog.id || dog._id}`}
            className="flex-1 btn-primary text-center text-sm py-2.5"
          >
            View Profile
          </Link>
          <button
            className="px-4 py-2.5 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition-colors border border-pink-200"
            title="Save match"
          >
            <Heart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}