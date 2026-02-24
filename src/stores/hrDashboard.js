import { defineStore } from 'pinia';
import api from '../api/axios';

export const useHrDashboardStore = defineStore('hrDashboard', {
  state: () => ({
    stats: null,
    approvalQueue: [],
    rejectedTasks: [],
    expiredDocuments: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchStats(tenantId) {
      this.loading = true;
      try {
        const response = await api.get(`/tenants/${tenantId}/hr-dashboard/stats`);
        this.stats = response.data;
        return this.stats;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch stats';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchApprovalQueue(tenantId) {
      this.loading = true;
      try {
        const response = await api.get(`/tenants/${tenantId}/hr-dashboard/approvals`);
        this.approvalQueue = response.data;
        return this.approvalQueue;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch approval queue';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchRejectedTasks(tenantId) {
      this.loading = true;
      try {
        const response = await api.get(`/tenants/${tenantId}/hr-dashboard/rejected-tasks`);
        this.rejectedTasks = response.data;
        return this.rejectedTasks;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch rejected tasks';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchExpiredDocuments(tenantId) {
      try {
        const response = await api.get(`/tenants/${tenantId}/hr-dashboard/documents/expired`);
        this.expiredDocuments = response.data;
        return this.expiredDocuments;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch expired documents';
        throw error;
      }
    },

    async fetchExpiringDocuments(tenantId, days = 30) {
      try {
        const response = await api.get(`/tenants/${tenantId}/hr-dashboard/documents/expiring?days=${days}`);
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch expiring documents';
        throw error;
      }
    },
  },
});
