// lib/api/matching.ts
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
      const url = `/matching/${dogId}/matches`;
      const baseURL = apiClient.defaults.baseURL;
      const fullURL = `${baseURL}${url}`;
      
      console.log('🔍 findMatches request:');
      console.log('   dogId:', dogId);
      console.log('   params:', params);
      console.log('   url:', url);
      console.log('   baseURL:', baseURL);
      console.log('   fullURL:', fullURL);
      console.log('   token:', localStorage.getItem('token') ? 'Present' : 'Missing');
      
      const response = await apiClient.get<MatchResponse>(url, { params });
      
      console.log('✅ findMatches response:', response.data);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      console.error('❌ findMatches error:');
      console.error('   Status:', error.response?.status);
      console.error('   StatusText:', error.response?.statusText);
      console.error('   Data:', error.response?.data);
      console.error('   URL:', error.config?.url);
      console.error('   Method:', error.config?.method);
      console.error('   BaseURL:', error.config?.baseURL);
      console.error('   Full error:', error);
      throw error;
    }
  },

  getStats: async (dogId: string): Promise<{ success: boolean; stats: MatchStats }> => {
    try {
      console.log('📈 getStats request for dogId:', dogId);
      const response = await apiClient.get<{ success: boolean; stats: MatchStats }>(
        `/matching/${dogId}/stats`
      );
      console.log('✅ getStats response:', response.data);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      console.error('❌ getStats error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },
};