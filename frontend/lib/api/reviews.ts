import { apiClient } from './client';
import { Review } from '@/types';

export const reviewsApi = {
  create: async (dogId: string, rating: number, comment: string): Promise<{ success: boolean; review: Review }> => {
    const response = await apiClient.post('/reviews', { dogId, rating, comment });
    return response.data;
  },

  getDogReviews: async (dogId: string): Promise<{ success: boolean; reviews: Review[]; stats: { total: number; avgRating: number } }> => {
    const response = await apiClient.get(`/reviews/dog/${dogId}`);
    return response.data;
  },
};