import apiClient from './client';
import { Dog } from '../types';

export interface DogFilters {
  page?: number;
  limit?: number;
  breed?: string;
  gender?: string;
  city?: string;
  county?: string;
  available?: boolean;
}

export const dogsApi = {
  getAll: async (filters: DogFilters = {}) => {
    const { data } = await apiClient.get<{
      success: boolean;
      dogs: Dog[];
      total: number;
      page: number;
      totalPages: number;
    }>('/dogs', { params: filters });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<{ success: boolean; dog: Dog }>(`/dogs/${id}`);
    return data;
  },

  getMyDogs: async () => {
    const { data } = await apiClient.get<{ success: boolean; dogs: Dog[]; total: number }>(
      '/dogs/my-dogs',
    );
    return data;
  },
};
