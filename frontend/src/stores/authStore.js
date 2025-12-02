import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AUTH_CONFIG } from '@/config';
import { authService } from '@/services';

/**
 * Auth Store using Zustand
 * Manages authentication state globally
 */
const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => {
        if (token) {
          localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token);
        } else {
          localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
        }
        set({ token });
      },
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Register
      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register(data);
          const { user, token } = response.data;
          
          localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token);
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true, data: response };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Registration failed';
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      // Login
      login: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(data);
          const { user, token } = response.data;
          
          localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token);
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true, data: response };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Login failed';
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      // Logout
      logout: async () => {
        set({ isLoading: true });
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      // Fetch current user
      fetchUser: async () => {
        const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        set({ isLoading: true });
        try {
          const response = await authService.getMe();
          set({
            user: response.data.user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      // Initialize auth state
      initialize: async () => {
        const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
        if (token) {
          await get().fetchUser();
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
