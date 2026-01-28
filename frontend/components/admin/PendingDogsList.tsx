'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import type { Dog } from '@/types';

interface PendingDogsListProps {
  dogs: Dog[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export default function PendingDogsList({
  dogs,
  onApprove,
  onReject,
}: PendingDogsListProps) {
  if (dogs.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500">No pending dogs to review</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {dogs.map((dog) => (
        <div key={dog._id} className="card">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-48 h-48 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={dog.mainImage || dog.images[0] || '/placeholder-dog.jpg'}
                alt={dog.name}
                width={200}
                height={200}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{dog.name}</h3>
                  <p className="text-gray-600">{dog.breed}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Owner: {dog.owner.firstName} {dog.owner.lastName}
                  </p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                  Pending
                </span>
              </div>

              <p className="text-gray-700 mb-4 line-clamp-2">{dog.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-600">Gender:</span>
                  <span className="font-semibold ml-2 capitalize">{dog.gender}</span>
                </div>
                <div>
                  <span className="text-gray-600">Age:</span>
                  <span className="font-semibold ml-2">{dog.age} years</span>
                </div>
                <div>
                  <span className="text-gray-600">Weight:</span>
                  <span className="font-semibold ml-2">{dog.weight} lbs</span>
                </div>
                <div>
                  <span className="text-gray-600">Location:</span>
                  <span className="font-semibold ml-2">{dog.location.city}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => onApprove(dog.id)}
                  className="btn-primary flex items-center"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </button>
                <button
                  onClick={() => onReject(dog.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </button>
                <Link
                  href={`/dogs/${dog.id}`}
                  className="btn-secondary flex items-center"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}