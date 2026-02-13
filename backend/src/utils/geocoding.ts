// utils/geocoding.ts
import axios from 'axios';

interface GeocodingResult {
  latitude: number;
  longitude: number;
}

/**
 * Geocode an address using OpenStreetMap Nominatim (free, no API key required)
 * Rate limit: 1 request per second
 */
export async function geocodeAddress(
  address: string,
  city: string,
  county: string,
  postcode?: string,
  country: string = 'UK'
): Promise<GeocodingResult | null> {
  try {
    // Build the search query
    const searchParts = [address, city, county, postcode, country].filter(Boolean);
    const query = searchParts.join(', ');

    console.log('🗺️ Geocoding address:', query);

    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: query,
        format: 'json',
        limit: 1,
        countrycodes: 'gb', // Limit to UK
      },
      headers: {
        'User-Agent': 'DogMatchingApp/1.0', // Required by Nominatim
      },
    });

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      const coords = {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
      };
      console.log('✅ Geocoded successfully:', coords);
      return coords;
    }

    // Fallback: try with just city and county
    if (address || postcode) {
      console.log('⚠️ Retrying with city/county only...');
      const fallbackQuery = [city, county, country].filter(Boolean).join(', ');
      
      const fallbackResponse = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: fallbackQuery,
          format: 'json',
          limit: 1,
          countrycodes: 'gb',
        },
        headers: {
          'User-Agent': 'DogMatchingApp/1.0',
        },
      });

      if (fallbackResponse.data && fallbackResponse.data.length > 0) {
        const result = fallbackResponse.data[0];
        const coords = {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
        };
        console.log('✅ Geocoded with fallback:', coords);
        return coords;
      }
    }

    console.log('❌ Could not geocode address');
    return null;
  } catch (error) {
    console.error('❌ Geocoding error:', error);
    return null;
  }
}

/**
 * UK city coordinates fallback (for common cities)
 */
export const UK_CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'london': { lat: 51.5074, lng: -0.1278 },
  'manchester': { lat: 53.4808, lng: -2.2426 },
  'birmingham': { lat: 52.4862, lng: -1.8904 },
  'leeds': { lat: 53.8008, lng: -1.5491 },
  'glasgow': { lat: 55.8642, lng: -4.2518 },
  'liverpool': { lat: 53.4084, lng: -2.9916 },
  'newcastle': { lat: 54.9783, lng: -1.6178 },
  'sheffield': { lat: 53.3811, lng: -1.4701 },
  'bristol': { lat: 51.4545, lng: -2.5879 },
  'edinburgh': { lat: 55.9533, lng: -3.1883 },
  'cardiff': { lat: 51.4816, lng: -3.1791 },
  'belfast': { lat: 54.5973, lng: -5.9301 },
  'nottingham': { lat: 52.9548, lng: -1.1581 },
  'southampton': { lat: 50.9097, lng: -1.4044 },
  'portsmouth': { lat: 50.8198, lng: -1.0880 },
  'oxford': { lat: 51.7520, lng: -1.2577 },
  'cambridge': { lat: 52.2053, lng: 0.1218 },
  'york': { lat: 53.9600, lng: -1.0873 },
  'bath': { lat: 51.3811, lng: -2.3590 },
  'brighton': { lat: 50.8225, lng: -0.1372 },
};

/**
 * Get fallback coordinates for a city
 */
export function getFallbackCoordinates(city: string): GeocodingResult | null {
  const cityLower = city.toLowerCase().trim();
  const coords = UK_CITY_COORDINATES[cityLower];
  
  if (coords) {
    return {
      latitude: coords.lat,
      longitude: coords.lng,
    };
  }
  
  return null;
}