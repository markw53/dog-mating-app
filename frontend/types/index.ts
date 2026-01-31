export interface User {
  id: string;
  _id?: string; // For backwards compatibility
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN';
  phone?: string;
  location?: {
    address?: string;
    city?: string;
    county?: string;
    postcode?: string;
    country?: string;
  };
  avatar?: string;
  verified: boolean;
  createdAt: string;
}

export interface Dog {
  id: string;
  _id?: string;
  name: string;
  breed: string;
  age: number;
  gender: 'male' | 'female';
  description?: string;
  mainImage?: string;
  images?: string[];
  status: 'pending' | 'active' | 'rejected';
  views?: number;
  owner: string | {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  location?: {
    city?: string;
    county?: string;
    country?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  breeding?: {
    available: boolean;
    fee?: number;
    experience?: string;
  };
  health?: {
    vaccinated: boolean;
    neutered: boolean;
    healthIssues?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}
export interface Message {
  id: string;
  _id?: string;
  conversation: string;
  conversationId?: string;
  sender: User;
  receiver: User;
  content: string;
  read: boolean;
  createdAt: string;
}
export interface Conversation {
  id: string;
  _id?: string;
  participants: User[];
  dogReference?: Dog;
  dog?: Dog;
  lastMessage?: string;
  lastMessageAt: string;
  createdAt: string;
}

export interface Review {
  id: string;
  _id?: string;
  dog?: string;
  dogId?: string;
  reviewer: User;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  dogs?: T[];
  users?: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
