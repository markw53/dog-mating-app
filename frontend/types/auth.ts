export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  location?: {
    address: string;
    city: string;
    county: string;
    postcode: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
}