// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  VERSION: 'v1',
  TIMEOUT: 30000,
};

// App Configuration
export const APP_CONFIG = {
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Simaul App',
  APP_VERSION: '1.0.0',
};

// Auth Configuration
export const AUTH_CONFIG = {
  TOKEN_KEY: 'auth_token',
  USER_KEY: 'auth_user',
};

// Get full API URL with version
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}/${API_CONFIG.VERSION}${endpoint}`;
};
