import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';


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
    const requestUrl: string = error.config?.url ?? '';
    // A 401 from login/register means bad credentials, not an expired
    // session — let the form show the error instead of redirecting
    const isAuthAttempt =
      requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');

    if (error.response?.status === 401 && !isAuthAttempt) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Inject an on-the-fly transformation into a Cloudinary delivery URL:
// .../image/upload/v123/x.jpg -> .../image/upload/w_600,c_limit,f_auto,q_auto/v123/x.jpg
// Cloudinary resizes and serves WebP/AVIF automatically; cards no longer
// download multi-MB originals. Non-Cloudinary URLs pass through untouched.
const withCloudinaryTransform = (url: string, width: number): string => {
  if (!url.includes('res.cloudinary.com')) return url;
  const marker = '/upload/';
  const idx = url.indexOf(marker);
  if (idx === -1) return url;
  // Don't double-transform URLs that already carry a transformation
  const afterUpload = url.slice(idx + marker.length);
  if (/^[a-z]+_[^/]+\//.test(afterUpload) && !afterUpload.startsWith('v')) return url;
  return `${url.slice(0, idx + marker.length)}w_${width},c_limit,f_auto,q_auto/${afterUpload}`;
};

// Helper to get full image URL. Pass { width } for thumbnails/cards so
// Cloudinary serves an appropriately sized, auto-format image.
export const getImageUrl = (
  path: string | null | undefined,
  options?: { width?: number },
): string => {
  // Handle null/undefined
  if (!path) {
    return '/images/placeholder-dog.jpg';
  }

  // Already a full URL
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return options?.width ? withCloudinaryTransform(path, options.width) : path;
  }

  // Relative path - prepend base URL
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}${cleanPath}`;
};

export default apiClient;