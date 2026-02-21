/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Dog } from '@/types';
import Link from 'next/link';
import { getImageUrl } from '@/lib/api/client';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Next.js
interface LeafletIconDefault extends L.Icon.Default {
  _getIconUrl?: () => string;
}

const iconDefault = L.Icon.Default.prototype as LeafletIconDefault;
delete iconDefault._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom markers for male and female dogs
const createCustomIcon = (gender: string) => {
  const isMale = gender?.toUpperCase() === 'MALE';
  const color = isMale ? '#3B82F6' : '#EC4899';

  return L.divIcon({
    className: 'custom-dog-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="transform: rotate(45deg); font-size: 14px;">
          ${isMale ? '♂' : '♀'}
        </span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

/**
 * Helper to get coordinates from a dog object.
 * Handles both Prisma flat fields (latitude/longitude)
 * and old nested format (location.coordinates.lat/lng)
 */
function getDogCoordinates(dog: Dog): [number, number] | null {
  // Prisma format: flat latitude/longitude fields
  if (dog.latitude && dog.longitude) {
    return [dog.latitude, dog.longitude];
  }

  // Legacy format: nested location.coordinates
  if (dog.location?.coordinates?.lat && dog.location?.coordinates?.lng) {
    return [dog.location.coordinates.lat, dog.location.coordinates.lng];
  }

  return null;
}

/**
 * Get the city from a dog object (handles both formats)
 */
function getDogCity(dog: Dog): string {
  return dog.city || dog.location?.city || 'Unknown';
}

interface DogMapProps {
  dogs: Dog[];
}

// Component to handle map bounds
function MapBounds({ dogs }: { dogs: { coords: [number, number] }[] }) {
  const map = useMap();

  useEffect(() => {
    if (dogs.length > 0) {
      const bounds = dogs.map((d) => d.coords);
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      }
    }
  }, [dogs, map]);

  return null;
}

export default function DogMap({ dogs }: DogMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[600px] bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-600">Loading map...</p>
      </div>
    );
  }

  // Filter dogs that have valid coordinates
  const dogsWithLocation = dogs
    .map((dog) => {
      const coords = getDogCoordinates(dog);
      return coords ? { dog, coords } : null;
    })
    .filter(Boolean) as { dog: Dog; coords: [number, number] }[];

  console.log(`🗺️ Map: ${dogsWithLocation.length}/${dogs.length} dogs have coordinates`);

  // Debug: log dogs without coordinates
  const dogsWithoutCoords = dogs.filter((d) => !getDogCoordinates(d));
  if (dogsWithoutCoords.length > 0) {
    console.log(
      '⚠️ Dogs without coordinates:',
      dogsWithoutCoords.map((d) => `${d.name} (${d.city || 'no city'})`)
    );
  }

  if (dogsWithLocation.length === 0) {
    return (
      <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🗺️</span>
          </div>
          <p className="text-gray-600 text-lg font-semibold mb-2">
            No dogs with location data
          </p>
          <p className="text-gray-500 text-sm mb-4">
            Dogs need a valid UK postcode or city to appear on the map.
            {dogs.length > 0 && (
              <span className="block mt-1">
                {dogs.length} dog{dogs.length !== 1 ? 's' : ''} found but none have coordinates.
              </span>
            )}
          </p>
          <Link href="/browse" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
            Browse dogs in list view →
          </Link>
        </div>
      </div>
    );
  }

  // Default center (UK center)
  const defaultCenter: [number, number] = [54.5, -2.0];

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden shadow-lg relative">
      <MapContainer
        center={defaultCenter}
        zoom={6}
        className="w-full h-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBounds dogs={dogsWithLocation} />

        {dogsWithLocation.map(({ dog, coords }) => (
          <Marker
            key={dog.id || dog._id}
            position={coords}
            icon={createCustomIcon(dog.gender)}
          >
            <Popup className="dog-popup" maxWidth={300}>
              <DogPopupContent dog={dog} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-[1000]">
        <h3 className="font-bold text-sm mb-2">Legend</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow"></div>
            <span className="text-sm">Male ({dogsWithLocation.filter(d => d.dog.gender?.toUpperCase() === 'MALE').length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-pink-500 rounded-full border-2 border-white shadow"></div>
            <span className="text-sm">Female ({dogsWithLocation.filter(d => d.dog.gender?.toUpperCase() === 'FEMALE').length})</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2 border-t pt-2">
          {dogsWithLocation.length} of {dogs.length} dogs shown
        </p>
      </div>
    </div>
  );
}

function DogPopupContent({ dog }: { dog: Dog }) {
  const dogId = dog.id || dog._id;
  const imageUrl = dog.mainImage
    ? getImageUrl(dog.mainImage)
    : dog.images?.[0]
    ? getImageUrl(dog.images[0])
    : null;

  const isMale = dog.gender?.toUpperCase() === 'MALE';
  const city = getDogCity(dog);

  return (
    <div className="w-64">
      {/* Image */}
      <div className="relative w-full h-40 mb-3 rounded-lg overflow-hidden bg-gray-200">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={dog.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className="w-full h-full flex items-center justify-center text-4xl"
          style={{ display: imageUrl ? 'none' : 'flex' }}
        >
          🐕
        </div>
      </div>

      {/* Info */}
      <div className="space-y-3">
        <h3 className="font-bold text-xl text-gray-900">{dog.name}</h3>

        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${
              isMale ? 'bg-blue-500 text-white' : 'bg-pink-500 text-white'
            }`}
          >
            {isMale ? '♂ Male' : '♀ Female'}
          </span>
          <span className="text-sm font-medium text-gray-700">{dog.breed}</span>
        </div>

        <div className="text-sm text-gray-700 space-y-1">
          <p className="flex items-center gap-2">
            <span className="font-medium">Age:</span>
            <span>{dog.age} years</span>
          </p>
          <p className="flex items-center gap-2">
            <span className="font-medium">Location:</span>
            <span>{city}{dog.county ? `, ${dog.county}` : ''}</span>
          </p>
          {dog.studFee && (
            <p className="flex items-center gap-2">
              <span className="font-medium">Stud Fee:</span>
              <span>£{dog.studFee}</span>
            </p>
          )}
        </div>

        {dog.available && (
          <div className="flex items-center gap-1.5 text-sm text-green-700 font-semibold bg-green-50 px-3 py-2 rounded-lg border border-green-200">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Available for breeding
          </div>
        )}

        <Link
          href={`/dogs/${dogId}`}
          className="block w-full text-center bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all font-bold text-sm mt-3 shadow-md"
        >
          View Profile →
        </Link>
      </div>
    </div>
  );
}