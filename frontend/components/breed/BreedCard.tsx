/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { Breed } from '@/lib/api/breeds';
import { Card } from '@/components/ui/Card';
import {
  Ruler,
  Weight,
  Clock,
  Activity,
  Scissors,
  Baby,
  ExternalLink,
} from 'lucide-react';

const typeColors: Record<string, string> = {
  Sporting: 'bg-green-100 text-green-800',
  Hound: 'bg-amber-100 text-amber-800',
  Herding: 'bg-blue-100 text-blue-800',
  Terrier: 'bg-red-100 text-red-800',
  Toy: 'bg-pink-100 text-pink-800',
  'Non-Sporting': 'bg-purple-100 text-purple-800',
  Working: 'bg-orange-100 text-orange-800',
};

const sizeColors: Record<string, string> = {
  Small: 'bg-sky-100 text-sky-800',
  Medium: 'bg-teal-100 text-teal-800',
  Large: 'bg-indigo-100 text-indigo-800',
};

interface BreedCardProps {
  breed: Breed;
}

function getSizeLabel(size: string | null): string | null {
  if (!size) return null;
  const lower = size.toLowerCase();
  if (lower.includes('small')) return 'Small';
  if (lower.includes('medium')) return 'Medium';
  if (lower.includes('large') || lower.includes('giant')) return 'Large';
  return size;
}

export default function BreedCard({ breed }: BreedCardProps) {
  const sizeLabel = getSizeLabel(breed.size);
  const typeColor = typeColors[breed.type] || 'bg-gray-100 text-gray-800';
  const sizeColor = sizeLabel
    ? sizeColors[sizeLabel] || 'bg-gray-100 text-gray-800'
    : '';

  // Only show KC category if it differs from the mapped type
  // e.g. "Gundog" vs "Sporting", "Pastoral" vs "Herding"
  const showKcBadge =
    breed.kennelClubCategory &&
    breed.kennelClubCategory.toLowerCase() !== breed.type.toLowerCase();

  return (
    <Link href={`/breeds/${breed.slug}`}>
      <Card className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
        {/* Image */}
        <div className="relative h-52 overflow-hidden bg-gray-100">
          {breed.imageUrl ? (
            <img
              src={breed.imageUrl}
              alt={breed.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget
                  .nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100"
            style={{ display: breed.imageUrl ? 'none' : 'flex' }}
          >
            <span className="text-6xl">🐕</span>
          </div>

          {/* Single row of badges at bottom of image - no overlap possible */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/50 to-transparent">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${typeColor}`}
              >
                {breed.type}
              </span>
              {sizeLabel && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${sizeColor}`}
                >
                  {sizeLabel}
                </span>
              )}
              {showKcBadge && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/90 text-gray-700">
                  KC: {breed.kennelClubCategory}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-3">
            {breed.name}
          </h3>

          {/* Quick stats grid */}
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4 flex-1">
            {breed.longevity && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                <span className="truncate">{breed.longevity}</span>
              </div>
            )}
            {breed.height && (
              <div className="flex items-center gap-1.5">
                <Ruler className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                <span className="truncate">{breed.height}</span>
              </div>
            )}
            {breed.weight && (
              <div className="flex items-center gap-1.5">
                <Weight className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                <span className="truncate">{breed.weight}</span>
              </div>
            )}
            {breed.exerciseNeeds && (
              <div className="flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                <span className="truncate">{breed.exerciseNeeds}</span>
              </div>
            )}
            {breed.grooming && (
              <div className="flex items-center gap-1.5">
                <Scissors className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                <span className="truncate">{breed.grooming}</span>
              </div>
            )}
            {breed.goodWithChildren && (
              <div className="flex items-center gap-1.5">
                <Baby className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                <span className="truncate">{breed.goodWithChildren}</span>
              </div>
            )}
          </div>

          {/* Temperament snippet */}
          {breed.temperament && (
            <p className="text-xs text-gray-500 line-clamp-2 mb-3">
              {breed.temperament}
            </p>
          )}

          {/* Footer */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-auto">
            <span className="text-primary-600 text-sm font-semibold group-hover:underline">
              View Details →
            </span>
            {breed.officialLink && (
              <ExternalLink className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}