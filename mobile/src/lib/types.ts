// Shared API types — mirrors frontend/types/index.ts (the API contract)

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string | null;
  avatar?: string | null;
  verified?: boolean;
  city?: string | null;
  county?: string | null;
  country?: string;
}

export interface DogOwner {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string | null;
  avatar?: string | null;
  city?: string;
  county?: string;
  verified?: boolean;
}

export interface Dog {
  id: string;
  name: string;
  breed: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'male' | 'female';
  dateOfBirth: string;
  weight: number;
  color: string;
  description: string;
  mainImage?: string | null;
  images?: string[];
  status: string;
  views?: number;
  ownerId?: string;
  owner?: DogOwner;
  city: string;
  county: string;
  latitude?: number | null;
  longitude?: number | null;
  vaccinated: boolean;
  neutered: boolean;
  registered: boolean;
  available: boolean;
  studFee?: number | null;
  studFeeNegotiable?: boolean;
  previousLitters?: number;
  temperament?: string[];
  createdAt?: string;
}

export interface Breed {
  id: string;
  name: string;
  slug: string;
  type: string;
  size?: string | null;
  imageUrl?: string | null;
  temperament?: string | null;
}

export interface Message {
  id: string;
  content: string;
  read: boolean;
  conversationId: string;
  senderId: string;
  receiverId: string;
  sender: User;
  receiver: User;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  dogId?: string | null;
  dog?: Pick<Dog, 'id' | 'name' | 'breed' | 'mainImage'> | null;
  lastMessage?: string | null;
  lastMessageAt?: string;
}
