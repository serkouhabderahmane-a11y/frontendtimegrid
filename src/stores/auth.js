import { defineStore } from 'pinia';
import api from '../api/axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
    isAuthenticated: !!localStorage.getItem('accessToken'),
  }),

  getters: {
    fullName: (state) =>
      state.user ? `${state.user.firstName} ${state.user.lastName}` : '',
    isAdmin: (state) => state.user?.role === 'admin',
    isHR: (state) => state.user?.role === 'hr',
    isManager: (state) => state.user?.role === 'manager',
    isEmployee: (state) => state.user?.role === 'employee',
  },

  actions: {
    async login(email, password) {
      const response = await api.post('/auth/login', { email, password });
      const { user, accessToken, refreshToken } = response.data;

      this.user = user;
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.isAuthenticated = true;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      return user;
    },

    async register(data) {
      const response = await api.post('/auth/register', data);
      const { user, accessToken, refreshToken } = response.data;

      this.user = user;
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.isAuthenticated = true;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      return user;
    },

    async refresh() {
      if (!this.refreshToken) {
        throw new Error('No refresh token');
      }

      const response = await api.post('/auth/refresh', {
        refreshToken: this.refreshToken,
      });

      const { accessToken, refreshToken } = response.data;

      this.accessToken = accessToken;
      this.refreshToken = refreshToken;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      return accessToken;
    },

    async fetchUser() {
      if (!this.accessToken) return null;

      try {
        const response = await api.get('/auth/me');
        this.user = response.data;
        return this.user;
      } catch (error) {
        this.logout();
        return null;
      }
    },

    logout() {
      this.user = null;
      this.accessToken = null;
      this.refreshToken = null;
      this.isAuthenticated = false;

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
  },
});
