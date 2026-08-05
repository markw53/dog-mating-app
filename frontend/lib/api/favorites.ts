import { apiClient } from './client';
import { Dog } from '@/types';

export const favoritesApi = {
  // Toggle: saves if unsaved, unsaves if saved
  toggle: async (dogId: string): Promise<{ success: boolean; favorited: boolean; count: number }> => {
    const response = await apiClient.post(`/favorites/${dogId}`);
    return response.data;
  },

  getAll: async (): Promise<{ success: boolean; dogs: Dog[]; total: number }> => {
    const response = await apiClient.get('/favorites');
    return response.data;
  },

  getIds: async (): Promise<{ success: boolean; ids: string[] }> => {
    const response = await apiClient.get('/favorites/ids');
    return response.data;
  },
};
