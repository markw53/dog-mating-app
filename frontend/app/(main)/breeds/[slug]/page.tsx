'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { breedsApi, Breed } from '@/lib/api/breeds';
import { Card } from '@/components/ui/Card';
import {
  ArrowLeft,
  ExternalLink,
  Ruler,
  Weight,
  Clock,
  Activity,
  Scissors,
  Baby,
  Heart,
  AlertTriangle,
  Loader2,
  Dog,
} from 'lucide-react';

// Badge colors by breed type
const typeColors: Record<string, string> = {
  Sporting: 'bg-green-100 text-green-800',
  Hound: 'bg-amber-100 text-amber-800',
  Herding: 'bg-blue-100 text-blue-800',
  Terrier: 'bg-red-100 text-red-800',
  Toy: 'bg-pink-100 text-pink-800',
  'Non-Sporting': 'bg-purple-100 text-purple-800',
  Working: 'bg-orange-100 text-orange-800',
};

interface BreedWithDogs extends Breed {
  dogs?: {
    id: string;
    name: string;
    gender: string;
    age: number;
    mainImage: string | null;
    city: string;
    county: string;
    available: boolean;
  }[];
}

export default function BreedDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [breed, setBreed] = useState<BreedWithDogs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchBreed = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await breedsApi.getBySlug(slug);
        setBreed(response.data as BreedWithDogs);
      } catch (err) {
        setError('Breed not found');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBreed();
  }, [slug]);

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading breed information...</p>
        </div>
      </div>
    );
  }

  // Error / Not found
  if (error || !breed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card hover={false} className="text-center py-16 px-8 max-w-md mx-auto">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🐕</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Breed Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            We couldn&apos;t find information for this breed.
          </p>
          <Link href="/breeds" className="btn-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Breeds
          </Link>
        </Card>
      </div>
    );
  }

  const typeColor = typeColors[breed.type] || 'bg-gray-100 text-gray-800';

  // Build info items
  const infoItems = [
    { icon: Ruler, label: 'Height', value: breed.height },
    { icon: Weight, label: 'Weight', value: breed.weight },
    { icon: Clock, label: 'Lifespan', value: breed.longevity },
    { icon: Activity, label: 'Exercise Needs', value: breed.exerciseNeeds },
    { icon: Scissors, label: 'Grooming', value: breed.grooming },
    { icon: Baby, label: 'Good with Children', value: breed.goodWithChildren },
    { icon: Heart, label: 'Colour', value: breed.color },
  ].filter((item) => item.value);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero / Header */}
      <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Back button */}
          <div className="pt-6">
            <Link
              href="/breeds"
              className="inline-flex items-center text-primary-100 hover:text-white transition-colors text-sm font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Breeds
            </Link>
          </div>

          <div className="py-12 md:py-16 flex flex-col md:flex-row items-center gap-8">
            {/* Breed image */}
            <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 flex-shrink-0">
              {breed.imageUrl ? (
                <Image
                  src={breed.imageUrl}
                  alt={breed.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary-500 flex items-center justify-center">
                  <span className="text-7xl">🐕</span>
                </div>
              )}
            </div>

            {/* Breed title info */}
            <div className="text-center md:text-left">
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${typeColor}`}
                >
                  {breed.type}
                </span>
                {breed.kennelClubCategory && (
                  <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                    KC Group: {breed.kennelClubCategory}
                  </span>
                )}
                {breed.size && (
                  <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                    {breed.size}
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-3">
                {breed.name}
              </h1>

              {breed.longevity && (
                <p className="text-primary-100 text-lg">
                  Average Lifespan: {breed.longevity}
                </p>
              )}

              {/* Official link */}
              {breed.officialLink && (
                <a
                  href={breed.officialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-4 text-sm bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  View on Royal Kennel Club
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Stats Grid */}
            <Card hover={false} className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Ruler className="h-5 w-5 text-primary-600" />
                Breed Overview
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {infoItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">
                        {item.label}
                      </p>
                      <p className="text-gray-900 font-semibold">
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Temperament */}
            {breed.temperament && (
              <Card hover={false} className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary-600" />
                  Temperament
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {breed.temperament}
                </p>
              </Card>
            )}

            {/* Health */}
            {breed.healthProblems &&
              breed.healthProblems !== 'Varies by breed - consult veterinarian' && (
                <Card hover={false} className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Health Information
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    {breed.healthProblems}
                  </p>
                </Card>
              )}

            {/* Available Dogs of this Breed */}
            {breed.dogs && breed.dogs.length > 0 && (
              <Card hover={false} className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Dog className="h-5 w-5 text-primary-600" />
                    Available {breed.name}s on DogMate
                  </h2>
                  <Link
                    href={`/browse?breed=${encodeURIComponent(breed.name)}`}
                    className="text-primary-600 hover:text-primary-700 text-sm font-semibold"
                  >
                    View All →
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {breed.dogs.map((dog) => (
                    <Link
                      key={dog.id}
                      href={`/dogs/${dog.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
                    >
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {dog.mainImage ? (
                          <Image
                            src={dog.mainImage}
                            alt={dog.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">
                            🐕
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {dog.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {dog.gender} · {dog.age} years · {dog.city},{' '}
                          {dog.county}
                        </p>
                      </div>
                      {dog.available && (
                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0">
                          Available
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card hover={false} className="p-6">
              <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href={`/browse?breed=${encodeURIComponent(breed.name)}`}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <Dog className="h-4 w-4" />
                  Find {breed.name}s
                </Link>

                {breed.officialLink && (
                  <a
                    href={breed.officialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full btn-secondary flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    KC Breed Standard
                  </a>
                )}
              </div>
            </Card>

            {/* At a Glance */}
            <Card hover={false} className="p-6">
              <h3 className="font-bold text-gray-900 mb-4">At a Glance</h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Group</dt>
                  <dd className="text-sm font-semibold text-gray-900">
                    {breed.type}
                  </dd>
                </div>
                {breed.kennelClubCategory && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">KC Group</dt>
                    <dd className="text-sm font-semibold text-gray-900">
                      {breed.kennelClubCategory}
                    </dd>
                  </div>
                )}
                {breed.size && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Size</dt>
                    <dd className="text-sm font-semibold text-gray-900">
                      {breed.size}
                    </dd>
                  </div>
                )}
                {breed.longevity && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Lifespan</dt>
                    <dd className="text-sm font-semibold text-gray-900">
                      {breed.longevity}
                    </dd>
                  </div>
                )}
                {breed.exerciseNeeds && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Exercise</dt>
                    <dd className="text-sm font-semibold text-gray-900">
                      {breed.exerciseNeeds}
                    </dd>
                  </div>
                )}
                {breed.grooming && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Grooming</dt>
                    <dd className="text-sm font-semibold text-gray-900">
                      {breed.grooming}
                    </dd>
                  </div>
                )}
              </dl>
            </Card>

            {/* Disclaimer */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-xs text-amber-800">
                <strong>⚠️ Disclaimer:</strong> Breed information sourced from
                The Royal Kennel Club. For official breed standards, visit{' '}
                <a
                  href="https://www.royalkennelclub.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-semibold hover:text-amber-900"
                >
                  royalkennelclub.com
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}