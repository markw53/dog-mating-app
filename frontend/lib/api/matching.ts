import { apiClient } from './client';
import { Dog } from '@/types';
import { AxiosError } from 'axios';

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

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

export const matchingApi = {
  findMatches: async (
    dogId: string,
    params?: { limit?: number; minScore?: number }
  ): Promise<MatchResponse> => {
    try {
      console.log('🔍 Finding matches for dogId:', dogId);
      console.log('📊 Params:', params);
      console.log('🌐 Full URL will be:', `${process.env.NEXT_PUBLIC_API_URL}/matching/${dogId}/matches`);
      
      const response = await apiClient.get<MatchResponse>(`/matching/${dogId}/matches`, { params });
      
      console.log('✅ Matches response:', response.data);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      console.error('❌ Find matches error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
      });
      throw error;
    }
  },

  getStats: async (dogId: string): Promise<{ success: boolean; stats: MatchStats }> => {
    try {
      console.log('📈 Getting stats for dogId:', dogId);
      const response = await apiClient.get<{ success: boolean; stats: MatchStats }>(
        `/matching/${dogId}/stats`
      );
      console.log('✅ Stats response:', response.data);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      console.error('❌ Get stats error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },
};