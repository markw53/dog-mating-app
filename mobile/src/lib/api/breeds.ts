import apiClient from './client';
import { Breed, BreedDetail } from '../types';

export const breedsApi = {
  getAll: async () => {
    const { data } = await apiClient.get<{
      success: boolean;
      data: Breed[];
      pagination: { total: number };
    }>('/breeds', { params: { limit: 300, sortBy: 'name', order: 'asc' } });
    return data;
  },

  getBySlug: async (slug: string) => {
    const { data } = await apiClient.get<{ success: boolean; data: BreedDetail }>(
      `/breeds/${slug}`,
    );
    return data;
  },
};
