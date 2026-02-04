import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

console.log('🔧 API Configuration:');
console.log('   API_URL:', API_URL);
console.log('   BASE_URL:', BASE_URL);

export const apiClient = axios.create({
  baseURL: API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper to get full image URL
export const getImageUrl = (path: string | null | undefined): string => {
  // Handle null/undefined
  if (!path) {
    return '/images/placeholder-dog.jpg'; // Make sure you have this placeholder
  }

  // Already a full URL
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Relative path - prepend base URL
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const fullUrl = `${BASE_URL}${cleanPath}`;
  
  console.log('🖼️ Image URL:', { path, fullUrl });
  
  return fullUrl;
};

export default apiClient;