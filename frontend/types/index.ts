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
  _id?: string; // For backwards compatibility
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
  mainImage: string | null;
  
  healthInfo?: {
    vaccinated: boolean;
    neutered: boolean;
    healthCertificates?: string[];
    veterinarian?: {
      name: string;
      contact: string;
    };
    medicalHistory?: string;
  };
  
  // Flatten health info for Prisma
  vaccinated: boolean;
  neutered: boolean;
  vetName?: string;
  vetContact?: string;
  medicalHistory?: string;
  
  pedigree?: {
    registered: boolean;
    registrationNumber?: string;
    registry?: string;
    sire?: string;
    dam?: string;
    pedigreeDocument?: string;
  };
  
  // Flatten pedigree for Prisma
  registered: boolean;
  registrationNumber?: string;
  registry?: string;
  sire?: string;
  dam?: string;
  
  breeding?: {
    available: boolean;
    studFee?: number;
    studFeeNegotiable: boolean;
    previousLitters: number;
    temperament: string[];
  };
  
  // Flatten breeding for Prisma
  available: boolean;
  studFee?: number;
  studFeeNegotiable: boolean;
  previousLitters: number;
  temperament: string[];
  
  location?: {
    address?: string;
    city: string;
    state: string;
    zipCode?: string;
    country: string;
  };
  
  // Flatten location for Prisma
  address?: string;
  city: string;
  county: string;
  postcode?: string;
  country: string;
  
  status: 'active' | 'inactive' | 'pending';
  views: number;
  favorites: number;
  createdAt: string;
  updatedAt: string;
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
