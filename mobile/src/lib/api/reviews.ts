import apiClient from './client';
import { Review } from '../types';

export const reviewsApi = {
  getDogReviews: async (dogId: string) => {
    const { data } = await apiClient.get<{
      success: boolean;
      reviews: Review[];
      stats: { total: number; avgRating: number };
    }>(`/reviews/dog/${dogId}`);
    return data;
  },

  createReview: async (dogId: string, rating: number, comment: string) => {
    const { data } = await apiClient.post<{ success: boolean; review: Review }>('/reviews', {
      dogId,
      rating,
      comment,
    });
    return data;
  },
};
