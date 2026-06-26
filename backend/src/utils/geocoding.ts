import axios from 'axios';
import logger from './logger';

interface GeocodingResult {
  latitude: number;
  longitude: number;
}

async function geocodePostcode(postcode: string): Promise<GeocodingResult | null> {
  if (!postcode?.trim()) return null;

  try {
    const cleaned = postcode.trim().replace(/\s+/g, '');
    const response = await axios.get(
      `https://api.postcodes.io/postcodes/${encodeURIComponent(cleaned)}`,
      { timeout: 5000 },
    );

    if (response.data?.status === 200 && response.data?.result) {
      const { latitude, longitude } = response.data.result;
      if (latitude && longitude) return { latitude, longitude };
    }
    return null;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      // Invalid postcode — not worth logging
    } else {
      logger.warn({ err: error }, 'postcodes.io geocoding failed');
    }
    return null;
  }
}

async function geocodeNominatim(query: string): Promise<GeocodingResult | null> {
  if (!query?.trim()) return null;

  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: { q: query, format: 'json', limit: 1, countrycodes: 'gb' },
      headers: { 'User-Agent': 'DogMate/1.0 (dog-breeding-website)' },
      timeout: 5000,
    });

    if (response.data?.length > 0) {
      const latitude = parseFloat(response.data[0].lat);
      const longitude = parseFloat(response.data[0].lon);
      if (!isNaN(latitude) && !isNaN(longitude)) return { latitude, longitude };
    }
    return null;
  } catch (error) {
    logger.warn({ err: error }, 'Nominatim geocoding failed');
    return null;
  }
}

export async function geocodeAddress(
  address: string | null | undefined,
  city: string,
  county: string | null | undefined,
  postcode?: string | null,
  country: string = 'UK',
): Promise<GeocodingResult | null> {
  if (postcode) {
    const result = await geocodePostcode(postcode);
    if (result) return result;
  }

  if (address) {
    const fullQuery = [address, city, county, country].filter(Boolean).join(', ');
    const result = await geocodeNominatim(fullQuery);
    if (result) return result;
    await new Promise((r) => setTimeout(r, 1100));
  }

  if (city && county) {
    const result = await geocodeNominatim([city, county, country].filter(Boolean).join(', '));
    if (result) return result;
    await new Promise((r) => setTimeout(r, 1100));
  }

  if (city) {
    const result = await geocodeNominatim([city, country].filter(Boolean).join(', '));
    if (result) return result;
  }

  logger.debug({ city, county, postcode }, 'All geocoding strategies failed');
  return null;
}

const UK_CITY_COORDINATES: Record<string, GeocodingResult> = {
  'london': { latitude: 51.5074, longitude: -0.1278 },
  'manchester': { latitude: 53.4808, longitude: -2.2426 },
  'birmingham': { latitude: 52.4862, longitude: -1.8904 },
  'leeds': { latitude: 53.8008, longitude: -1.5491 },
  'glasgow': { latitude: 55.8642, longitude: -4.2518 },
  'liverpool': { latitude: 53.4084, longitude: -2.9916 },
  'edinburgh': { latitude: 55.9533, longitude: -3.1883 },
  'bristol': { latitude: 51.4545, longitude: -2.5879 },
  'sheffield': { latitude: 53.3811, longitude: -1.4701 },
  'newcastle': { latitude: 54.9783, longitude: -1.6178 },
  'nottingham': { latitude: 52.9548, longitude: -1.1581 },
  'cardiff': { latitude: 51.4816, longitude: -3.1791 },
  'belfast': { latitude: 54.5973, longitude: -5.9301 },
  'leicester': { latitude: 52.6369, longitude: -1.1398 },
  'coventry': { latitude: 52.4068, longitude: -1.5197 },
  'bradford': { latitude: 53.7960, longitude: -1.7594 },
  'southampton': { latitude: 50.9097, longitude: -1.4044 },
  'portsmouth': { latitude: 50.8198, longitude: -1.0880 },
  'brighton': { latitude: 50.8225, longitude: -0.1372 },
  'plymouth': { latitude: 50.3755, longitude: -4.1427 },
  'reading': { latitude: 51.4543, longitude: -0.9781 },
  'derby': { latitude: 52.9225, longitude: -1.4746 },
  'wolverhampton': { latitude: 52.5870, longitude: -2.1288 },
  'swansea': { latitude: 51.6214, longitude: -3.9436 },
  'aberdeen': { latitude: 57.1497, longitude: -2.0943 },
  'cambridge': { latitude: 52.2053, longitude: 0.1218 },
  'oxford': { latitude: 51.7520, longitude: -1.2577 },
  'york': { latitude: 53.9600, longitude: -1.0873 },
  'bath': { latitude: 51.3811, longitude: -2.3590 },
  'exeter': { latitude: 50.7184, longitude: -3.5339 },
  'norwich': { latitude: 52.6309, longitude: 1.2974 },
  'chester': { latitude: 53.1930, longitude: -2.8931 },
  'canterbury': { latitude: 51.2802, longitude: 1.0789 },
  'dundee': { latitude: 56.4620, longitude: -2.9707 },
  'inverness': { latitude: 57.4778, longitude: -4.2247 },
  'worcester': { latitude: 52.1936, longitude: -2.2216 },
  'gloucester': { latitude: 51.8642, longitude: -2.2382 },
  'lincoln': { latitude: 53.2307, longitude: -0.5406 },
  'peterborough': { latitude: 52.5695, longitude: -0.2405 },
  'ipswich': { latitude: 52.0567, longitude: 1.1482 },
  'stoke-on-trent': { latitude: 53.0027, longitude: -2.1794 },
  'sunderland': { latitude: 54.9069, longitude: -1.3838 },
  'hull': { latitude: 53.7676, longitude: -0.3274 },
  'middlesbrough': { latitude: 54.5742, longitude: -1.2350 },
  'blackpool': { latitude: 53.8175, longitude: -3.0357 },
  'bolton': { latitude: 53.5785, longitude: -2.4299 },
  'bournemouth': { latitude: 50.7192, longitude: -1.8808 },
  'stockport': { latitude: 53.4106, longitude: -2.1575 },
  'warrington': { latitude: 53.3900, longitude: -2.5970 },
  'slough': { latitude: 51.5105, longitude: -0.5950 },
  'luton': { latitude: 51.8787, longitude: -0.4200 },
  'colchester': { latitude: 51.8959, longitude: 0.8919 },
  'crawley': { latitude: 51.1092, longitude: -0.1872 },
  'cheltenham': { latitude: 51.8994, longitude: -2.0783 },
};

export function getFallbackCoordinates(city: string | null | undefined): GeocodingResult | null {
  if (!city?.trim()) return null;

  const normalized = city.trim().toLowerCase();
  const exact = UK_CITY_COORDINATES[normalized];
  if (exact) return exact;

  for (const [key, coords] of Object.entries(UK_CITY_COORDINATES)) {
    if (normalized.includes(key) || key.includes(normalized)) return coords;
  }

  return null;
}
