// lib/api/dogs.ts
import { apiClient } from './client';
import { Dog, UpdateDogData } from '@/types';
import { AxiosError } from 'axios';

interface ApiErrorResponse {
  message?: string;
}

export const dogsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    breed?: string;
    gender?: string;
    minAge?: number;
    maxAge?: number;
    city?: string;
    county?: string;
  }): Promise<{ success: boolean; dogs: Dog[]; total: number }> => {
    try {
      const response = await apiClient.get<{ success: boolean; dogs: Dog[]; total: number }>(
        '/dogs',
        { params }
      );
      return response.data;
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      console.error('Get all dogs error:', error.response?.data);
      throw error;
    }
  },

  getMyDogs: async (): Promise<{ success: boolean; dogs: Dog[]; total: number }> => {
    try {
      const response = await apiClient.get<{ success: boolean; dogs: Dog[]; total: number }>(
        '/dogs/my-dogs'
      );
      return response.data;
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      console.error('Get my dogs error:', error.response?.data);
      throw error;
    }
  },

  getById: async (id: string): Promise<{ success: boolean; dog: Dog }> => {
    try {
      const response = await apiClient.get<{ success: boolean; dog: Dog }>(`/dogs/${id}`);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      console.error('Get dog by ID error:', error.response?.data);
      throw error;
    }
  },

  create: async (data: UpdateDogData): Promise<{ success: boolean; dog: Dog }> => {
    try {
      const response = await apiClient.post<{ success: boolean; dog: Dog }>('/dogs', data);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      console.error('Create dog error:', error.response?.data);
      throw error;
    }
  },

  update: async (id: string, data: UpdateDogData): Promise<{ success: boolean; dog: Dog }> => {
    try {
      console.log('📤 Updating dog:', id);
      console.log('📝 Update data:', data);
      
      const response = await apiClient.put<{ success: boolean; dog: Dog }>(`/dogs/${id}`, data);
      
      console.log('✅ Dog updated:', response.data);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      console.error('❌ Update dog error:', error.response?.data);
      throw error;
    }
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.delete<{ success: boolean; message: string }>(`/dogs/${id}`);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      console.error('Delete dog error:', error.response?.data);
      throw error;
    }
  },

  uploadImages: async (dogId: string, files: File[]): Promise<{ success: boolean; images: string[]; dog: Dog }> => {
    try {
      console.log('📤 Uploading', files.length, 'images for dog:', dogId);
      
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images', file);
      });

      const response = await apiClient.post<{ success: boolean; images: string[]; dog: Dog }>(
        `/dogs/${dogId}/images`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      console.log('✅ Images uploaded:', response.data.images);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      console.error('❌ Upload images error:', error.response?.data);
      throw error;
    }
  },
};