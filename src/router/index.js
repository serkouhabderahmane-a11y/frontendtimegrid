import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/Login.vue'),
    meta: { guest: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/auth/Register.vue'),
    meta: { guest: true },
  },
  {
    path: '/onboarding/:token',
    name: 'EmployeeOnboarding',
    component: () => import('../views/employee/OnboardingPortal.vue'),
  },
  // Admin Dashboard - for HR Admin, Tenant Admin, Super Admin
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('../views/admin/Dashboard.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/candidates',
    name: 'Candidates',
    component: () => import('../views/admin/Candidates.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/candidates/:id',
    name: 'CandidateDetail',
    component: () => import('../views/admin/CandidateDetail.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/approvals',
    name: 'Approvals',
    component: () => import('../views/admin/Approvals.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/employees',
    name: 'Employees',
    component: () => import('../views/admin/Employees.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/payroll',
    name: 'Payroll',
    component: () => import('../views/admin/Payroll.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/daily-notes',
    name: 'DailyNotes',
    component: () => import('../views/admin/DailyNotes.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/mar',
    name: 'MAR',
    component: () => import('../views/admin/MAR.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/social-feed',
    name: 'SocialFeed',
    component: () => import('../views/admin/SocialFeed.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/training-videos',
    name: 'TrainingVideos',
    component: () => import('../views/admin/TrainingVideos.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('../views/Chat.vue'),
    meta: { requiresAuth: true },
  },
  // Employee Dashboard - for Staff, Nurse, Med Tech
  {
    path: '/employee/timeclock',
    name: 'TimeClock',
    component: () => import('../views/employee/TimeClock.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/employee/dashboard',
    name: 'EmployeeDashboard',
    component: () => import('../views/employee/Dashboard.vue'),
    meta: { requiresAuth: true },
  },
  // Catch-all redirect to appropriate dashboard
  {
    path: '/dashboard',
    name: 'Dashboard',
    redirect: (to) => {
      // This will be handled by the component based on auth store
      return '/admin'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Role mapping for route access
const ADMIN_ROLES = ['admin', 'hr', 'hr_admin', 'tenant_admin', 'super_admin', 'auditor']
const MANAGER_ROLES = ['manager', 'supervisor']
const EMPLOYEE_ROLES = ['employee', 'staff', 'nurse', 'med_tech']

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Initialize from storage if not already done
  if (!authStore.accessToken && localStorage.getItem('accessToken')) {
    authStore.initFromStorage()
  }

  const isAuthenticated = authStore.isAuthenticated
  const isDemo = authStore.accessToken?.startsWith('demo-')
  const userRole = authStore.role

  // Guest routes (login, register)
  if (to.meta.guest) {
    if (isAuthenticated) {
      // Redirect authenticated users away from guest routes
      const redirect = getDefaultDashboard(authStore.role)
      next(redirect)
      return
    }
    next()
    return
  }

  // Protected routes
  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      next({ name: 'Login', query: { redirect: to.fullPath } })
      return
    }

    // For demo mode, always allow access (bypass role checks)
    if (isDemo) {
      next()
      return
    }

    // Check role-based access for non-demo users
    if (to.meta.roles) {
      // Support both legacy and new role names
      const allowedRoles = [...to.meta.roles]
      // Add mapped roles
      if (to.meta.roles.includes('admin')) {
        allowedRoles.push('tenant_admin', 'super_admin')
      }
      if (to.meta.roles.includes('hr')) {
        allowedRoles.push('hr_admin', 'auditor')
      }
      if (to.meta.roles.includes('manager')) {
        allowedRoles.push('supervisor')
      }
      if (to.meta.roles.includes('employee')) {
        allowedRoles.push('staff', 'nurse', 'med_tech')
      }
      
      if (!allowedRoles.includes(userRole)) {
        console.warn(`Access denied for role "${userRole}" to ${to.path}`)
        const redirect = getDefaultDashboard(userRole)
        next(redirect)
        return
      }
    }

    // Try to fetch user data if not present (non-demo)
    if (isAuthenticated && !authStore.user && !isDemo) {
      try {
        await authStore.fetchUser()
      } catch (e) {
        console.error('Failed to fetch user:', e)
      }
    }
  }

  next()
})

function getDefaultDashboard(role) {
  if (ADMIN_ROLES.includes(role)) {
    return '/admin'
  }
  if (MANAGER_ROLES.includes(role)) {
    return '/admin/daily-notes'
  }
  if (EMPLOYEE_ROLES.includes(role)) {
    return '/employee/timeclock'
  }
  return '/admin'
}

export default router
