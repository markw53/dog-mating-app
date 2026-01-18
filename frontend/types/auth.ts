export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
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
}