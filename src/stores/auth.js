import { defineStore } from 'pinia';
import api from '../api/axios';

// Role mappings for backward compatibility and new roles
const ROLE_ALIASES = {
  // New roles mapped to legacy
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
    // Check legacy role
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
    // Get mapped legacy role
    legacyRole: (state) => {
      return ROLE_ALIASES[state.user?.role] || state.user?.role || 'employee';
    },
    // Get the actual role
    role: (state) => state.user?.role || 'staff',
    // Check if user has specific permission
    hasPermission: (state) => (permission) => {
      if (state.user?.role === 'super_admin') return true;
      return state.user?.permissions?.includes(permission) || false;
    },
    // Role-specific capability checks
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
      return role !== 'auditor'; // Auditors are read-only
    },
    canEdit: (state) => {
      const role = state.user?.role;
      return role !== 'auditor'; // Auditors are read-only
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
          this.isDemo = false;
          
          localStorage.setItem('accessToken', data.token);
          localStorage.setItem('refreshToken', data.token);
          localStorage.setItem('user', JSON.stringify(this.user));
          localStorage.removeItem('isDemo');
          
          return this.user;
        } else {
          throw new Error(data.error || 'Login failed');
        }
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },

    async demoLogin(role, userData = null) {
      // Use provided user data or create from role
      const demoUser = userData || {
        id: `demo-${role}-001`,
        email: `demo.${role.replace('_', '.')}@timegrid.io`,
        firstName: 'Demo',
        lastName: this.getRoleDisplayName(role),
        role: role,
        tenantId: 'demo-tenant',
        permissions: this.getDemoPermissions(role),
        isDemo: true,
      };

      this.setUser(demoUser);
      this.accessToken = `demo-${role}-token`;
      this.refreshToken = `demo-${role}-refresh`;
      this.isAuthenticated = true;
      this.isDemo = true;
      
      localStorage.setItem('accessToken', this.accessToken);
      localStorage.setItem('refreshToken', this.refreshToken);
      localStorage.setItem('user', JSON.stringify(this.user));
      localStorage.setItem('isDemo', 'true');
      
      return this.user;
    },

    setUser(userData) {
      // Normalize user data
      this.user = {
        id: userData?.id || 'unknown',
        email: userData?.email || '',
        firstName: userData?.firstName || userData?.first_name || 'Demo',
        lastName: userData?.lastName || userData?.last_name || 'User',
        role: userData?.role || 'staff',
        tenantId: userData?.tenantId || userData?.tenant_id || 'demo-tenant',
        permissions: userData?.permissions || [],
        isDemo: userData?.isDemo || userData?.is_demo || false,
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

    getDemoPermissions(role) {
      const permissions = {
        'hr_admin': [
          'users.view', 'users.create', 'users.edit', 'users.assign_role',
          'onboarding.view', 'onboarding.manage', 'onboarding.approve',
          'training.view', 'training.manage',
          'reports.view', 'reports.export'
        ],
        'supervisor': [
          'timesheet.view', 'timesheet.approve',
          'notes.view', 'notes.lock',
          'medication.review',
          'participants.view', 'participants.assignments',
          'reports.view', 'reports.export',
          'announcements.view'
        ],
        'staff': [
          'clock.in', 'clock.out',
          'breaks.record',
          'timesheet.view', 'timesheet.create', 'timesheet.submit',
          'schedule.view_own',
          'announcements.view',
          'notes.view', 'notes.create_draft',
          'training.view'
        ],
        'nurse': [
          'participants.view_assigned',
          'medication.schedule.view',
          'medication.administer',
          'vitals.enter', 'outcomes.enter',
          'care_notes.submit', 'care_notes.attach',
          'training.view'
        ],
        'med_tech': [
          'participants.view_assigned',
          'medication.schedule.view',
          'medication.administer',
          'vitals.enter', 'outcomes.enter',
          'care_notes.submit', 'care_notes.attach',
          'training.view'
        ],
        'auditor': [
          'records.view',
          'reports.view', 'reports.export',
          'documents.download',
          'audit.view', 'audit.export'
        ],
      };
      return permissions[role] || [];
    },

    async fetchUser() {
      if (!this.accessToken) return null;

      try {
        const response = await api.get('/api/auth/me');
        this.setUser(response.data);
        return this.user;
      } catch (error) {
        // For demo tokens, don't logout
        if (this.accessToken?.startsWith('demo-')) {
          console.log('Demo session - skipping API fetch');
          return this.user;
        }
        this.logout();
        return null;
      }
    },

    logout() {
      // Clear demo data store if in demo mode
      if (this.isDemo) {
        this.clearDemoData();
      }
      
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
    
    clearDemoData() {
      // Reset demo data in axios mock store
      if (window.__demoDataStore) {
        window.__demoDataStore.reset();
      }
      console.log('[Demo] Session ended, demo data cleared');
    },

    // Initialize from localStorage (call on app start)
    initFromStorage() {
      const storedToken = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('user');
      const storedIsDemo = localStorage.getItem('isDemo');

      if (storedToken) {
        this.accessToken = storedToken;
        this.refreshToken = localStorage.getItem('refreshToken') || storedToken;
        this.isAuthenticated = true;
        this.isDemo = storedIsDemo === 'true';
        
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
  },
});
