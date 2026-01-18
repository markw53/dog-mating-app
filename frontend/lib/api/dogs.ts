import { apiClient } from './client';
import { Dog, PaginatedResponse } from '@/types';

export const dogsApi = {
  getAll: async (params?: {
    breed?: string;
    gender?: string;
    minAge?: number;
    maxAge?: number;
    city?: string;
    state?: string;
    available?: boolean;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Dog>> => {
    const response = await apiClient.get('/dogs', { params });
    return response.data;
  },

  getById: async (id: string): Promise<{ success: boolean; dog: Dog }> => {
    const response = await apiClient.get(`/dogs/${id}`);
    return response.data;
  },

  getMyDogs: async (): Promise<{ success: boolean; dogs: Dog[] }> => {
    const response = await apiClient.get('/dogs/my-dogs');
    return response.data;
  },

  create: async (formData: FormData): Promise<{ success: boolean; dog: Dog }> => {
    const response = await apiClient.post('/dogs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  update: async (id: string, formData: FormData): Promise<{ success: boolean; dog: Dog }> => {
    const response = await apiClient.put(`/dogs/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/dogs/${id}`);
    return response.data;
  },

  searchNearby: async (lat: number, lng: number, maxDistance?: number): Promise<{ success: boolean; dogs: Dog[] }> => {
    const response = await apiClient.get('/dogs/nearby', {
      params: { lat, lng, maxDistance },
    });
    return response.data;
  },
};