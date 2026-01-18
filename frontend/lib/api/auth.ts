import { apiClient } from './client';
import { AuthResponse, User } from '@/types';
import { RegisterData } from '@/types/auth';

export const authApi = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  getMe: async (): Promise<{ success: boolean; user: User }> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<{ success: boolean; user: User }> => {
    const response = await apiClient.put('/auth/profile', data);
    return response.data;
  },
};