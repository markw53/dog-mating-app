import Link from 'next/link';
import Image from 'next/image';
import { Dog } from '@/types';
import { MapPin } from 'lucide-react';
import { formatAge } from '@/lib/utils/formatters';

interface DogCardProps {
  dog: Dog;
}

export default function DogCard({ dog }: DogCardProps) {
  return (
    <Link href={`/dogs/${dog._id}`}>
      <div className="card hover:shadow-lg transition-shadow cursor-pointer h-full">
        <div className="aspect-w-16 aspect-h-12 bg-gray-200 rounded-lg overflow-hidden mb-4">
          <Image
            src={dog.mainImage || dog.images[0] || '/placeholder-dog.jpg'}
            alt={dog.name}
            width={400}
            height={300}
            className="object-cover w-full h-48"
          />
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
            <span>{dog.location.city}, {dog.location.state}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{formatAge(dog.dateOfBirth)}</span>
            <span className="text-gray-600">{dog.weight} lbs</span>
          </div>

          {dog.breeding.available && (
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