import axios from 'axios';
import { API_CONFIG, AUTH_CONFIG } from '@/config';

// Create axios instance
const api = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/${API_CONFIG.VERSION}`,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      const { status } = error.response;

      // Unauthorized - clear token and redirect
      if (status === 401) {
        localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
        localStorage.removeItem(AUTH_CONFIG.USER_KEY);
        window.location.href = '/login';
      }

      // Forbidden
      if (status === 403) {
        console.error('Access forbidden');
      }

      // Server error
      if (status >= 500) {
        console.error('Server error occurred');
      }
    }

    return Promise.reject(error);
  }
);

export default api;
