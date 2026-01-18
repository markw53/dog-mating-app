export interface User {
  _id: string;
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  phone?: string;
  location?: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  avatar?: string;
  verified: boolean;
  createdAt: string;
}

export interface Dog {
  _id: string;
  owner: User;
  name: string;
  breed: string;
  gender: 'male' | 'female';
  dateOfBirth: string;
  age: number;
  weight: number;
  color: string;
  description: string;
  images: string[];
  mainImage: string;
  
  healthInfo: {
    vaccinated: boolean;
    neutered: boolean;
    healthCertificates: string[];
    veterinarian?: {
      name: string;
      contact: string;
    };
    medicalHistory?: string;
  };
  
  pedigree: {
    registered: boolean;
    registrationNumber?: string;
    registry?: string;
    sire?: string;
    dam?: string;
    pedigreeDocument?: string;
  };
  
  breeding: {
    available: boolean;
    studFee?: number;
    studFeeNegotiable: boolean;
    previousLitters: number;
    temperament: string[];
  };
  
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  
  status: 'active' | 'inactive' | 'pending';
  views: number;
  favorites: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  conversation: string;
  sender: User;
  receiver: User;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  participants: User[];
  dogReference?: Dog;
  lastMessage?: string;
  lastMessageAt: string;
  createdAt: string;
}

export interface Review {
  _id: string;
  dog: string;
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