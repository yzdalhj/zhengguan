import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/composables/api';
import type { User } from '@/types';

interface UserState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    user: null,
    token: localStorage.getItem('token'),
    loading: false,
  }),

  getters: {
    isAuthenticated: state => !!state.token && !!state.user,
    isAdmin: state => state.user?.role === 'admin',
  },

  actions: {
    setToken(token: string) {
      this.token = token;
      localStorage.setItem('token', token);
      api.setAuthToken(token);
    },

    clearToken() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      api.setAuthToken(null);
    },

    async login(email: string, password: string) {
      this.loading = true;
      try {
        const response = await api.post('/api/auth/login', { email, password });
        this.setToken(response.data.token);
        this.user = response.data.user;
        return response;
      } catch (error) {
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async register(username: string, email: string, password: string) {
      this.loading = true;
      try {
        const response = await api.post('/api/auth/register', {
          username,
          email,
          password,
        });
        return response;
      } catch (error) {
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async getMe() {
      if (!this.token) return;
      
      try {
        api.setAuthToken(this.token);
        const response = await api.get('/api/auth/me');
        this.user = response.data;
      } catch (error) {
        this.clearToken();
        throw error;
      }
    },

    logout() {
      this.clearToken();
    },

    async updatePassword(currentPassword: string, newPassword: string) {
      try {
        await api.put('/api/auth/password', {
          currentPassword,
          newPassword,
        });
        return { success: true };
      } catch (error) {
        throw error;
      }
    },
  },
});
