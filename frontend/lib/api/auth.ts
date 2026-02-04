// lib/api/auth.ts
import { apiClient } from './client';
import { User, UpdateProfileData } from '@/types';
import { AxiosError } from 'axios';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

interface ApiErrorResponse {
  message?: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      throw error;
    }
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getCurrentUser: async (): Promise<{ success: boolean; user: User }> => {
    try {
      const response = await apiClient.get<{ success: boolean; user: User }>('/auth/me');
      return response.data;
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      throw error;
    }
  },

  updateProfile: async (data: UpdateProfileData): Promise<{ success: boolean; user: User }> => {
    try {
      const response = await apiClient.put<{ success: boolean; user: User }>(
        '/auth/profile',
        data
      );
      
      // Update stored user data
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      throw error;
    }
  },
};