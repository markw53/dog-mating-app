'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Dog } from '@/types';
import { MapPin } from 'lucide-react';
import { formatAge, formatWeight } from '@/lib/utils/formatters';
import { getImageUrl } from '@/lib/api/client';
import { useState } from 'react';

interface DogCardProps {
  dog: Dog;
}

function PlaceholderImage({ name }: { name: string }) {
  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 flex flex-col items-center justify-center">
      <svg
        className="w-20 h-20 text-gray-400 mb-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <p className="text-sm font-medium text-gray-500">{name}</p>
      <p className="text-xs text-gray-400 mt-1">No photo available</p>
    </div>
  );
}

export default function DogCard({ dog }: DogCardProps) {
  const [imageError, setImageError] = useState(false);
  const imageUrl = dog.mainImage || dog.images?.[0];
  const fullImageUrl = imageUrl ? getImageUrl(imageUrl) : null;

  console.log('DogCard - imageUrl:', imageUrl);
  console.log('DogCard - fullImageUrl:', fullImageUrl);

  return (
    <Link href={`/dogs/${dog._id || dog.id}`}>
      <div className="card hover:shadow-lg transition-shadow cursor-pointer h-full">
        <div className="relative h-48 bg-gray-200 rounded-lg overflow-hidden mb-4">
          {fullImageUrl && !imageError ? (
            <Image
              src={fullImageUrl}
              alt={dog.name}
              fill
              className="object-cover"
              onError={() => {
                console.error('Image failed to load:', fullImageUrl);
                setImageError(true);
              }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized
            />
          ) : (
            <PlaceholderImage name={dog.name} />
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{dog.name}</h3>
              <p className="text-gray-600">{dog.breed}</p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              dog.gender === 'male' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-pink-100 text-pink-800'
            }`}>
              {dog.gender}
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{dog.location?.city || dog.city}, {dog.location?.state || dog.county}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{formatAge(dog.dateOfBirth)}</span>
            <span className="text-gray-600">{formatWeight(dog.weight)}</span>
          </div>

          {(dog.breeding?.available || dog.available) && (
            <div className="pt-2 border-t">
              <span className="text-sm font-semibold text-green-600">
                Available for Breeding
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}