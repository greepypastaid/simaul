import api from '@/lib/axios';

/**
 * Authentication Service
 * Handles all authentication related API calls
 */
export const authService = {
  /**
   * Register a new user
   * @param {Object} data - { name, email, password, password_confirmation }
   */
  register: async (data) => {
    const response = await api.post('/register', data);
    return response.data;
  },

  /**
   * Login user
   * @param {Object} data - { email, password }
   */
  login: async (data) => {
    const response = await api.post('/login', data);
    return response.data;
  },

  /**
   * Get current authenticated user
   */
  getMe: async () => {
    const response = await api.get('/me');
    return response.data;
  },

  /**
   * Logout user
   */
  logout: async () => {
    const response = await api.post('/logout');
    return response.data;
  },

  /**
   * Refresh authentication token
   */
  refreshToken: async () => {
    const response = await api.post('/refresh');
    return response.data;
  },
};

export default authService;
