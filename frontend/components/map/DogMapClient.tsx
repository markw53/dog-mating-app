'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Dog } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
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
const createCustomIcon = (gender: 'male' | 'female') => {
  const color = gender === 'male' ? '#3B82F6' : '#EC4899'; // blue for male, pink for female
  
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
        <svg 
          style="transform: rotate(45deg); width: 18px; height: 18px;" 
          fill="white" 
          viewBox="0 0 24 24"
        >
          ${gender === 'male' 
            ? '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>'
            : '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-5h2v2h-2zm0-8h2v6h-2z"/>'
          }
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

interface DogMapProps {
  dogs: Dog[];
}

// Component to handle map bounds
function MapBounds({ dogs }: { dogs: Dog[] }) {
  const map = useMap();

  useEffect(() => {
    if (dogs.length > 0) {
      const bounds = dogs
        .filter(dog => dog.location?.coordinates?.lat && dog.location?.coordinates?.lng)
        .map(dog => [
          dog.location!.coordinates!.lat,
          dog.location!.coordinates!.lng
        ] as [number, number]);

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [dogs, map]);

  return null;
}

export default function DogMap({ dogs }: DogMapProps) {
  const [mounted, setMounted] = useState(false);

  // Only render map on client side - using layout effect pattern
  useEffect(() => {
    // This is intentional for client-side only rendering
    // The effect runs once to hydrate the component
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[600px] bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-600">Loading map...</p>
      </div>
    );
  }

  // Filter dogs that have valid coordinates
  const dogsWithLocation = dogs.filter(
    dog => dog.location?.coordinates?.lat && dog.location?.coordinates?.lng
  );

  if (dogsWithLocation.length === 0) {
    return (
      <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-2">No dogs with location data available</p>
          <p className="text-gray-500 text-sm">Dogs need to have coordinates to appear on the map</p>
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

        {dogsWithLocation.map((dog) => (
          <Marker
            key={dog.id || dog._id}
            position={[
              dog.location!.coordinates!.lat,
              dog.location!.coordinates!.lng
            ]}
            icon={createCustomIcon(dog.gender as 'male' | 'female')}
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
            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
            <span className="text-sm">Male</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-pink-500 rounded-full border-2 border-white"></div>
            <span className="text-sm">Female</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DogPopupContent({ dog }: { dog: Dog }) {
  const dogId = dog.id || dog._id;
  const imageUrl = getImageUrl(dog.mainImage || dog.images?.[0] || '');

  return (
    <div className="w-64">
      {/* Image */}
      <div className="relative w-full h-40 mb-3 rounded-lg overflow-hidden bg-gray-200">
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
      </div>

      {/* Info */}
      <div className="space-y-3">
        <h3 className="font-bold text-xl text-gray-900">{dog.name}</h3>
        
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${
            dog.gender === 'male' 
              ? 'bg-blue-500 text-white' 
              : 'bg-pink-500 text-white'
          }`}>
            {dog.gender === 'male' ? '♂ Male' : '♀ Female'}
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
            <span>{dog.location?.city || 'Unknown'}</span>
          </p>
        </div>

        {dog.breeding?.available && (
          <div className="flex items-center gap-1.5 text-sm text-green-700 font-semibold bg-green-50 px-3 py-2 rounded-lg border border-green-200">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Available for breeding
          </div>
        )}

        <Link
          href={`/dogs/${dogId}`}
          className="group block w-full text-center bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3.5 px-4 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all font-bold text-base mt-4 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
        >
          <span className="flex items-center justify-center gap-2">
            View Profile
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </Link>
      </div>
    </div>
  );
}