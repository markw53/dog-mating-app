import apiClient from './client';

// The matching endpoint returns a custom-shaped dog payload (location is
// nested, gender is lowercase) — distinct from the standard Dog type
export interface MatchDog {
  id: string;
  name: string;
  breed: string;
  gender: string;
  age: number;
  mainImage?: string | null;
  images?: string[];
  location?: {
    city?: string;
    state?: string;
  };
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  breeding?: {
    available: boolean;
    studFee?: number | null;
  };
}

export interface Match {
  dog: MatchDog;
  matchScore: number;
  matchReasons: string[];
  distance?: number;
}

export const matchingApi = {
  findMatches: async (dogId: string, params?: { limit?: number; minScore?: number }) => {
    const { data } = await apiClient.get<{
      success: boolean;
      sourceDog: { id: string; name: string; breed: string };
      matches: Match[];
      total: number;
    }>(`/matching/${dogId}/matches`, { params });
    return data;
  },
};
