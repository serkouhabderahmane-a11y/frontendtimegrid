import { defineStore } from 'pinia';
import api from '../api/axios';

const ROLE_ALIASES = {
  'hr_admin': 'hr',
  'tenant_admin': 'admin',
  'super_admin': 'admin',
  'supervisor': 'manager',
  'staff': 'employee',
  'nurse': 'employee',
  'med_tech': 'employee',
  'auditor': 'hr',
};

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
    isAuthenticated: !!localStorage.getItem('accessToken'),
    isDemo: localStorage.getItem('isDemo') === 'true',
  }),

  getters: {
    fullName: (state) => {
      if (!state.user) return 'User';
      return `${state.user.firstName || ''} ${state.user.lastName || ''}`.trim() || state.user.email || 'User';
    },
    isAdmin: (state) => {
      const role = state.user?.role;
      return role === 'admin' || role === 'tenant_admin' || role === 'super_admin';
    },
    isHR: (state) => {
      const role = state.user?.role;
      return role === 'hr' || role === 'hr_admin';
    },
    isSupervisor: (state) => {
      const role = state.user?.role;
      return role === 'supervisor';
    },
    isStaff: (state) => {
      const role = state.user?.role;
      return role === 'staff';
    },
    isClinical: (state) => {
      const role = state.user?.role;
      return role === 'nurse' || role === 'med_tech';
    },
    isAuditor: (state) => {
      const role = state.user?.role;
      return role === 'auditor';
    },
    isManager: (state) => {
      const role = state.user?.role;
      return role === 'manager' || role === 'supervisor';
    },
    isEmployee: (state) => {
      const role = state.user?.role;
      return role === 'employee' || role === 'staff' || role === 'nurse' || role === 'med_tech';
    },
    legacyRole: (state) => {
      return ROLE_ALIASES[state.user?.role] || state.user?.role || 'employee';
    },
    role: (state) => state.user?.role || 'staff',
    hasPermission: (state) => (permission) => {
      if (state.user?.role === 'super_admin') return true;
      return state.user?.permissions?.includes(permission) || false;
    },
    canClock: (state) => {
      const role = state.user?.role;
      return role === 'staff' || role === 'nurse' || role === 'med_tech';
    },
    canApprove: (state) => {
      const role = state.user?.role;
      return role === 'supervisor' || role === 'hr_admin' || role === 'admin';
    },
    canCreate: (state) => {
      const role = state.user?.role;
      return role !== 'auditor';
    },
    canEdit: (state) => {
      const role = state.user?.role;
      return role !== 'auditor';
    },
    canAdministerMedication: (state) => {
      const role = state.user?.role;
      return role === 'nurse' || role === 'med_tech';
    },
    canViewOtherEmployees: (state) => {
      const role = state.user?.role;
      return role === 'supervisor' || role === 'hr_admin' || role === 'admin';
    },
    canExport: (state) => {
      const role = state.user?.role;
      return role === 'supervisor' || role === 'hr_admin' || role === 'admin' || role === 'auditor';
    },
    isReadOnly: (state) => {
      const role = state.user?.role;
      return role === 'auditor';
    },
    canDelete: (state) => {
      return !state.isDemo;
    },
    canEdit: (state) => {
      if (state.isDemo) return false;
      const role = state.user?.role;
      return role !== 'auditor';
    },
    canCreate: (state) => {
      if (state.isDemo) return false;
      const role = state.user?.role;
      return role !== 'auditor';
    },
  },

  actions: {
    async login(email, password) {
      try {
        const response = await api.post('/api/auth/login', { email, password });
        const data = response.data;
        
        if (data.success) {
          this.setUser({
            id: data.user_id,
            email: data.user?.email,
            firstName: data.user?.firstName || data.user?.email?.split('@')[0],
            lastName: data.user?.lastName || '',
            role: data.role,
            tenantId: data.tenant_id,
            permissions: data.permissions || [],
          });
          this.accessToken = data.token;
          this.refreshToken = data.token;
          this.isAuthenticated = true;
          
          localStorage.setItem('accessToken', data.token);
          localStorage.setItem('refreshToken', data.token);
          localStorage.setItem('user', JSON.stringify(this.user));
          
          return this.user;
        } else {
          throw new Error(data.error || 'Login failed');
        }
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },

    setUser(userData) {
      this.user = {
        id: userData?.id || 'unknown',
        email: userData?.email || '',
        firstName: userData?.firstName || userData?.first_name || '',
        lastName: userData?.lastName || userData?.last_name || '',
        role: userData?.role || 'staff',
        tenantId: userData?.tenantId || userData?.tenant_id || '',
        permissions: userData?.permissions || [],
      };
    },

    getRoleDisplayName(role) {
      const names = {
        'hr_admin': 'HR Admin',
        'tenant_admin': 'Admin',
        'super_admin': 'Admin',
        'supervisor': 'Supervisor',
        'staff': 'Staff',
        'nurse': 'Nurse',
        'med_tech': 'Med Tech',
        'auditor': 'Auditor',
      };
      return names[role] || 'User';
    },

    async fetchUser() {
      if (!this.accessToken) return null;

      try {
        const response = await api.get('/api/auth/me');
        this.setUser(response.data);
        return this.user;
      } catch (error) {
        console.error('Failed to fetch user:', error);
        this.logout();
        return null;
      }
    },

    logout() {
      this.user = null;
      this.accessToken = null;
      this.refreshToken = null;
      this.isAuthenticated = false;
      this.isDemo = false;

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('isDemo');
    },

    initFromStorage() {
      const storedToken = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('user');

      if (storedToken) {
        this.accessToken = storedToken;
        this.refreshToken = localStorage.getItem('refreshToken') || storedToken;
        this.isAuthenticated = true;
        this.isDemo = localStorage.getItem('isDemo') === 'true';
        
        if (storedUser) {
          try {
            this.user = JSON.parse(storedUser);
          } catch (e) {
            console.error('Failed to parse stored user:', e);
          }
        }
        return true;
      }
      return false;
    },

    setDemoMode(isDemo) {
      this.isDemo = isDemo;
      localStorage.setItem('isDemo', isDemo ? 'true' : 'false');
    },
  },
});
