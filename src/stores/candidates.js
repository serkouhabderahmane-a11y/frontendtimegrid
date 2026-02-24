import { defineStore } from 'pinia';
import api from '../api/axios';

export const useCandidatesStore = defineStore('candidates', {
  state: () => ({
    candidates: [],
    currentCandidate: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchCandidates(tenantId, filters = {}) {
      this.loading = true;
      try {
        const params = new URLSearchParams(filters).toString();
        const response = await api.get(`/tenants/${tenantId}/candidates?${params}`);
        this.candidates = response.data;
        return this.candidates;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch candidates';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchCandidate(tenantId, candidateId) {
      this.loading = true;
      try {
        const response = await api.get(`/tenants/${tenantId}/candidates/${candidateId}`);
        this.currentCandidate = response.data;
        return this.currentCandidate;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch candidate';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createCandidate(tenantId, data) {
      this.loading = true;
      console.log('=== createCandidate API Call ===');
      console.log('URL:', `/tenants/${tenantId}/candidates`);
      console.log('Tenant ID:', tenantId);
      console.log('Request Data:', JSON.stringify(data, null, 2));
      try {
        const response = await api.post(`/tenants/${tenantId}/candidates`, data);
        console.log('Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(response.data, null, 2));
        this.candidates.unshift(response.data);
        return response.data;
      } catch (error) {
        console.error('=== createCandidate ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Name:', error.name);
        console.error('Error Code:', error.code);
        if (error.response) {
          console.error('Response Status:', error.response.status);
          console.error('Response Status Text:', error.response.statusText);
          console.error('Response Headers:', JSON.stringify(error.response.headers, null, 2));
          console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
          console.error('No response received');
          console.error('Request:', error.request);
        } else {
          console.error('Error Config:', JSON.stringify(error.config, null, 2));
        }
        console.error('Full Error Object:', error);
        this.error = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to create candidate';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async assignPacket(tenantId, candidateId, packetId) {
      this.loading = true;
      try {
        const response = await api.post(`/tenants/${tenantId}/candidates/${candidateId}/assign-packet`, { packetId });
        const index = this.candidates.findIndex(c => c.id === candidateId);
        if (index !== -1) {
          this.candidates[index] = { ...this.candidates[index], ...response.data, state: 'packet_assigned' };
        }
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to assign packet';
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
