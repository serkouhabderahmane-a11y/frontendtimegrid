import { defineStore } from 'pinia';
import api from '../api/axios';

export const useOnboardingStore = defineStore('onboarding', {
  state: () => ({
    onboarding: null,
    tasks: [],
    loading: false,
    error: null,
  }),

  getters: {
    progressPercent: (state) => state.onboarding?.progressPercent || 0,
    currentState: (state) => state.onboarding?.currentState || '',
    isCompleted: (state) => state.onboarding?.currentState === 'employee_active',
    pendingTasks: (state) => state.tasks.filter(t => t.status === 'submitted'),
    approvedTasks: (state) => state.tasks.filter(t => t.status === 'approved'),
    rejectedTasks: (state) => state.tasks.filter(t => t.status === 'rejected'),
  },

  actions: {
    async fetchByToken(secureToken) {
      this.loading = true;
      try {
        const response = await api.get(`/onboarding/token/${secureToken}`);
        this.onboarding = response.data;
        this.tasks = response.data.taskStatuses || [];
        return this.onboarding;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch onboarding';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async saveDraft(onboardingId, taskId, tenantId, submissionData) {
      try {
        const response = await api.post(`/onboarding/${onboardingId}/tasks/${taskId}/draft`, {
          tenantId,
          submissionData,
        });
        const index = this.tasks.findIndex(t => t.taskId === taskId);
        if (index !== -1) {
          this.tasks[index] = { ...this.tasks[index], ...response.data };
        }
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to save draft';
        throw error;
      }
    },

    async submitTask(onboardingId, taskId, tenantId, submissionData) {
      try {
        const response = await api.post(`/onboarding/${onboardingId}/tasks/${taskId}/submit`, {
          tenantId,
          submissionData,
        });
        const index = this.tasks.findIndex(t => t.taskId === taskId);
        if (index !== -1) {
          this.tasks[index] = { ...this.tasks[index], ...response.data };
        }
        await this.refreshProgress(onboardingId, tenantId);
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to submit task';
        throw error;
      }
    },

    async approveTask(onboardingId, taskId, tenantId, comment) {
      try {
        const response = await api.post(`/onboarding/${onboardingId}/tasks/${taskId}/approve`, {
          tenantId,
          comment,
        });
        const index = this.tasks.findIndex(t => t.taskId === taskId);
        if (index !== -1) {
          this.tasks[index] = { ...this.tasks[index], ...response.data };
        }
        await this.refreshProgress(onboardingId, tenantId);
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to approve task';
        throw error;
      }
    },

    async rejectTask(onboardingId, taskId, tenantId, comment) {
      try {
        const response = await api.post(`/onboarding/${onboardingId}/tasks/${taskId}/reject`, {
          tenantId,
          comment,
        });
        const index = this.tasks.findIndex(t => t.taskId === taskId);
        if (index !== -1) {
          this.tasks[index] = { ...this.tasks[index], ...response.data };
        }
        await this.refreshProgress(onboardingId, tenantId);
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to reject task';
        throw error;
      }
    },

    async refreshProgress(onboardingId, tenantId) {
      const response = await api.get(`/onboarding/${onboardingId}/progress?tenantId=${tenantId}`);
      if (this.onboarding) {
        this.onboarding.progressPercent = response.data.progressPercent;
        this.onboarding.currentState = response.data.currentState;
      }
      this.tasks = response.data.tasks;
    },
  },
});
