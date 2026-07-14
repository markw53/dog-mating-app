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

  create: async (dogData: Record<string, unknown>) => {
    const { data } = await apiClient.post<{ success: boolean; dog: Dog }>('/dogs', dogData);
    return data;
  },

  update: async (id: string, dogData: Record<string, unknown>) => {
    const { data } = await apiClient.put<{ success: boolean; dog: Dog }>(`/dogs/${id}`, dogData);
    return data;
  },

  uploadImages: async (dogId: string, images: { uri: string; mimeType?: string }[]) => {
    const formData = new FormData();
    images.forEach((image, index) => {
      const ext = image.mimeType?.split('/')[1] ?? 'jpg';
      // React Native FormData file part: {uri, name, type}
      formData.append('images', {
        uri: image.uri,
        name: `photo-${index}.${ext}`,
        type: image.mimeType ?? 'image/jpeg',
      } as unknown as Blob);
    });

    const { data } = await apiClient.post<{ success: boolean; images: string[]; dog: Dog }>(
      `/dogs/${dogId}/images`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000 },
    );
    return data;
  },
};
