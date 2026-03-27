import { computed, inject } from 'vue';

const AUTH_KEY = Symbol('auth');

export function useAuth() {
  const auth = inject(AUTH_KEY);
  
  if (!auth) {
    console.warn('Auth context not found. Ensure AppProvider is set up.');
    return {
      user: null,
      permissions: [],
      role: null,
      isAuthenticated: false,
      can: () => false,
      canAny: () => false,
      canAll: () => false,
    };
  }
  
  return {
    user: computed(() => auth.user),
    permissions: computed(() => auth.user?.permissions || []),
    role: computed(() => auth.user?.role),
    isAuthenticated: computed(() => auth.isAuthenticated),
    
    can: (permission) => {
      const user = auth.user;
      if (!user) return false;
      
      if (user.role === 'super_admin') return true;
      
      return user.permissions?.includes(permission) || false;
    },
    
    canAny: (permissions) => {
      return permissions.some(p => auth.user?.permissions?.includes(p));
    },
    
    canAll: (permissions) => {
      return permissions.every(p => auth.user?.permissions?.includes(p));
    },
    
    hasRole: (roles) => {
      const userRole = auth.user?.role;
      if (Array.isArray(roles)) {
        return roles.includes(userRole);
      }
      return userRole === roles;
    },
    
    canAccessTenant: (tenantId) => {
      const user = auth.user;
      if (!user) return false;
      if (user.role === 'super_admin') return true;
      return user.tenantId === tenantId;
    },
    
    canAccessLocation: (locationId) => {
      const user = auth.user;
      if (!user) return false;
      if (user.role === 'super_admin' || user.role === 'tenant_admin') return true;
      return user.locationIds?.includes(locationId) || false;
    },
  };
}

export function usePermissions() {
  const { can, canAny, canAll, permissions } = useAuth();
  
  return {
    can,
    canAny,
    canAll,
    permissions,
    
    canViewUsers: () => can('users.view'),
    canCreateUsers: () => can('users.create'),
    canEditUsers: () => can('users.edit'),
    canDeleteUsers: () => can('users.delete'),
    canAssignRoles: () => can('users.assign_role'),
    
    canViewOnboarding: () => can('onboarding.view'),
    canManageOnboarding: () => can('onboarding.manage'),
    canApproveOnboarding: () => can('onboarding.approve'),
    
    canViewTimesheet: () => can('timesheet.view'),
    canCreateTimesheet: () => can('timesheet.create'),
    canApproveTimesheet: () => can('timesheet.approve'),
    canEditTimesheet: () => can('timesheet.edit'),
    
    canViewNotes: () => can('notes.view'),
    canCreateNotes: () => can('notes.create'),
    canEditNotes: () => can('notes.edit'),
    canDeleteNotes: () => can('notes.delete'),
    
    canViewTraining: () => can('training.view'),
    canManageTraining: () => can('training.manage'),
    
    canViewReports: () => can('reports.view'),
    canExportReports: () => can('reports.export'),
    
    canViewAudit: () => can('audit.view'),
    canExportAudit: () => can('audit.export'),
    
    canViewCare: () => can('care.view'),
    canManageCare: () => can('care.manage'),
    canReviewMedication: () => can('medication.review'),
    
    canManageLocations: () => can('locations.create'),
    canViewLocations: () => can('locations.view'),
    
    canManageTenant: () => can('tenant.edit'),
  };
}

export function createAuthProvider(initialState = {}) {
  const user = ref(initialState.user || null);
  const isAuthenticated = ref(!!initialState.token);
  const token = ref(initialState.token || null);
  
  const login = (userData, authToken) => {
    user.value = userData;
    token.value = authToken;
    isAuthenticated.value = true;
    
    localStorage.setItem('accessToken', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };
  
  const logout = () => {
    user.value = null;
    token.value = null;
    isAuthenticated.value = false;
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  };
  
  const restoreSession = () => {
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      token.value = storedToken;
      user.value = JSON.parse(storedUser);
      isAuthenticated.value = true;
      return true;
    }
    return false;
  };
  
  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    restoreSession,
  };
}

export function vIfPermission(el, binding) {
  const { can } = usePermissions();
  const requiredPermission = binding.value;
  
  if (typeof requiredPermission === 'string') {
    el.hidden = !can(requiredPermission);
  } else if (Array.isArray(requiredPermission)) {
    el.hidden = !can(requiredPermission[0]);
  }
}

export const vPermission = {
  mounted(el, binding) {
    vIfPermission(el, binding);
  },
  updated(el, binding) {
    vIfPermission(el, binding);
  },
};
