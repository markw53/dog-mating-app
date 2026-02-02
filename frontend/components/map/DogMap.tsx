'use client';

import dynamic from 'next/dynamic';
import { Dog } from '@/types';
import { Loader2 } from 'lucide-react';

const DogMapClient = dynamic(() => import('./DogMapClient'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-gray-200 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-2" />
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
});

interface DogMapProps {
  dogs: Dog[];
}

export default function DogMap({ dogs }: DogMapProps) {
  return <DogMapClient dogs={dogs} />;
}