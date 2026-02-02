export interface User {
  id: string;
  _id?: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN';
  avatar?: string;
  bio?: string;
  phone?: string;
  verified?: boolean;
  address?: string;
  city?: string;
  county?: string;
  postcode?: string;
  country?: string;
  location?: {
    city?: string;
    state?: string;
    zipCode?: string;
    address?: string;
    country?: string;
  };
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface Dog {
  id: string;
  _id?: string;
  name: string;
  breed: string;
  age: number;
  gender: 'male' | 'female';
  dateOfBirth: Date | string;
  weight: number;
  color: string;
  description: string;
  mainImage?: string;
  images?: string[];
  status: 'pending' | 'active' | 'rejected' | 'inactive';
  views?: number;
  favorites?: number;
  
  // Owner
  owner: User | string;
  ownerId?: string;
  
  // Location
  address?: string;
  city: string;
  county: string;
  postcode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  location?: {
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  
  // Health Info (direct fields from DB)
  vaccinated: boolean;
  neutered: boolean;
  vetName?: string;
  vetContact?: string;
  medicalHistory?: string;
  // Formatted version for frontend
  healthInfo?: {
    vaccinated: boolean;
    neutered: boolean;
    veterinarian?: {
      name: string;
      contact: string;
    };
    medicalHistory?: string;
  };
  
  // Pedigree (direct fields from DB)
  registered: boolean;
  registrationNumber?: string;
  registry?: string;
  sire?: string;
  dam?: string;
  // Formatted version for frontend
  pedigree?: {
    registered: boolean;
    registrationNumber?: string;
    registry?: string;
    sire?: string;
    dam?: string;
  };
  
  // Breeding (direct fields from DB)
  available: boolean;
  studFee?: number;
  studFeeNegotiable?: boolean;
  previousLitters?: number;
  temperament?: string[];
  // Formatted version for frontend
  breeding?: {
    available: boolean;
    fee?: number;
    studFee?: number;
    feeNegotiable?: boolean;
    studFeeNegotiable?: boolean;
    previousLitters?: number;
    experience?: string;
    temperament?: string[];
  };
  
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface Review {
  id: string;
  _id?: string;
  rating: number;
  comment: string;
  dogId: string;
  reviewerId: string;
  reviewer: {
    id: string;
    _id?: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  createdAt: Date | string;
}

export interface Message {
  id: string;
  _id?: string;
  content: string;
  senderId: string;
  receiverId: string;
  conversationId: string;
  read: boolean;
  createdAt: Date | string;
}

export interface Conversation {
  id: string;
  _id?: string;
  participants: User[];
  dogId?: string;
  dog?: Dog;
  lastMessage?: string;
  lastMessageAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}