export interface User {
  id: string;
  _id?: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  avatar?: string | null;
  verified?: boolean;
  address?: string | null;
  city?: string | null;
  county?: string | null;
  postcode?: string | null;
  country?: string;
  location?: {
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
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
  address?: string | null;
  city: string;
  county: string;
  postcode?: string | null;
  country?: string | null;
  latitude?: number | null;
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
  vetName?: string | null;
  vetContact?: string | null;
  medicalHistory?: string | null;
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
  registrationNumber?: string | null;
  registry?: string | null;
  sire?: string | null;
  dam?: string | null;
  // Formatted version for frontend
  pedigree?: {
    registered: boolean;
    registrationNumber?: string | null;
    registry?: string | null;
    sire?: string | null;
    dam?: string | null;
  };
  
  // Breeding (direct fields from DB)
  available: boolean;
  studFee?: number | null;
  studFeeNegotiable?: boolean;
  previousLitters?: number;
  temperament?: string[];
  // Formatted version for frontend
  breeding?: {
    available: boolean;
    fee?: number | null;
    studFee?: number | null;
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
  read: boolean;
  conversationId: string;
  senderId: string;
  receiverId: string;
  sender: User;
  receiver: User;
  createdAt: Date | string;
}

// Conversation type
export interface Conversation {
  id: string;
  _id?: string;
  participants: User[];
  dogId?: string | null;
  dog?: Dog | null;
  lastMessage?: string | null;
  lastMessageAt?: Date | string;
  messages?: Message[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

// API Response types
export interface ConversationsResponse {
  success: boolean;
  conversations: Conversation[];
  total: number;
}

export interface MessagesResponse {
  success: boolean;
  messages: Message[];
  total: number;
}

export interface SendMessageResponse {
  success: boolean;
  message: Message;
}

// Type for updating a dog
export interface UpdateDogData {
  name?: string;
  breed?: string;
  gender?: 'MALE' | 'FEMALE';
  dateOfBirth?: string;
  age?: number;
  weight?: number;
  color?: string;
  description?: string;
  images?: string[];
  mainImage?: string | null;
  
  // Health
  vaccinated?: boolean;
  neutered?: boolean;
  vetName?: string;
  vetContact?: string;
  medicalHistory?: string;
  
  // Pedigree
  registered?: boolean;
  registrationNumber?: string;
  registry?: string;
  sire?: string;
  dam?: string;
  
  // Breeding
  available?: boolean;
  studFee?: number;
  studFeeNegotiable?: boolean;
  previousLitters?: number;
  temperament?: string[];
  
  // Location
  address?: string;
  city?: string;
  county?: string;
  postcode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  county?: string;
  postcode?: string;
  country?: string;
}