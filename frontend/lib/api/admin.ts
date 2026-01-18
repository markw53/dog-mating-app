import { apiClient } from './client';
import { Dog, User } from '@/types';

export const adminApi = {
  getPendingDogs: async (): Promise<{ success: boolean; dogs: Dog[] }> => {
    const response = await apiClient.get('/admin/dogs/pending');
    return response.data;
  },

  approveDog: async (id: string): Promise<{ success: boolean; dog: Dog }> => {
    const response = await apiClient.put(`/admin/dogs/${id}/approve`);
    return response.data;
  },

  rejectDog: async (id: string): Promise<{ success: boolean; dog: Dog }> => {
    const response = await apiClient.put(`/admin/dogs/${id}/reject`);
    return response.data;
  },

  getAllUsers: async (): Promise<{ success: boolean; users: User[] }> => {
    const response = await apiClient.get('/admin/users');
    return response.data;
  },

  getStats: async (): Promise<{
    success: boolean;
    stats: {
      totalUsers: number;
      totalDogs: number;
      activeDogs: number;
      pendingDogs: number;
    };
  }> => {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  },
};