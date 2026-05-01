import { create } from 'zustand';
import api from '../lib/api';
import { disconnectSocket } from '../lib/socket';

/**
 * Authentication Store
 * Manages the logged-in user state and core auth actions.
 */
export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),

  fetchMe: async () => {
    try {
      const res = await api.get('/auth/me');
      set({ user: res.data.data.user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout failed:', err.message);
    } finally {
      // Clear local state regardless of server response
      set({ user: null, isAuthenticated: false });
      disconnectSocket();
      
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  },
}));
