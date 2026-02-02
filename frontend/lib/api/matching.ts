import { apiClient } from './client';
import { Dog } from '@/types';

export interface Match {
  dog: Dog;
  matchScore: number;
  matchReasons: string[];
  distance?: number;
}

export interface MatchResponse {
  success: boolean;
  sourceDog: {
    id: string;
    name: string;
    breed: string;
    gender: string;
    age: number;
  };
  matches: Match[];
  total: number;
}

export interface MatchStats {
  totalPotential: number;
  sameBreed: number;
  nearby: number;
  breedCompatibility: number;
}

export const matchingApi = {
  findMatches: async (
    dogId: string,
    params?: { limit?: number; minScore?: number }
  ): Promise<MatchResponse> => {
    const response = await apiClient.get(`/matching/${dogId}/matches`, { params });
    return response.data;
  },

  getStats: async (dogId: string): Promise<{ success: boolean; stats: MatchStats }> => {
    const response = await apiClient.get(`/matching/${dogId}/stats`);
    return response.data;
  },
};