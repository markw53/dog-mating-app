// lib/api/breeds.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Breed {
  id: string;
  name: string;
  slug: string;
  type: string;
  height: string | null;
  weight: string | null;
  color: string;
  longevity: string | null;
  healthProblems: string | null;
  imageUrl: string | null;
  officialLink: string | null;
  kennelClubCategory: string | null;
  size: string | null;
  exerciseNeeds: string | null;
  grooming: string | null;
  temperament: string | null;
  goodWithChildren: string | null;
}

export interface BreedsResponse {
  success: boolean;
  data: Breed[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BreedTypesResponse {
  success: boolean;
  data: {
    types: { name: string; count: number }[];
    sizes: { name: string; count: number }[];
  };
}

export const breedsApi = {
  getAll(params?: {
    type?: string;
    size?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: string;
  }) {
    return axios.get<BreedsResponse>(`${API_URL}/breeds`, { params })
      .then(res => res.data);
  },

  getBySlug(slug: string) {
    return axios.get<{ success: boolean; data: Breed }>(`${API_URL}/breeds/${slug}`)
      .then(res => res.data);
  },

  search(query: string, limit?: number) {
    return axios.get<{ success: boolean; data: Breed[] }>(`${API_URL}/breeds/search`, {
      params: { q: query, limit },
    }).then(res => res.data);
  },

  getTypes() {
    return axios.get<BreedTypesResponse>(`${API_URL}/breeds/types`)
      .then(res => res.data);
  },
};