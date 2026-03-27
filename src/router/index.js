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
    meta: { requiresAuth: true, roles: ['admin', 'manager', 'supervisor', 'employee'] },
  },
  {
    path: '/admin/mar',
    name: 'MAR',
    component: () => import('../views/admin/MAR.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'manager', 'supervisor', 'employee'] },
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
  // NEW MODULE ROUTES - ATTENDANCE
  {
    path: '/admin/attendance',
    name: 'AdminAttendance',
    component: () => import('../views/admin/attendance/AttendanceAdmin.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'hr', 'manager'] },
  },
  // NEW MODULE ROUTES - PATIENTS
  {
    path: '/admin/patients',
    name: 'Patients',
    component: () => import('../views/admin/patients/PatientsAdmin.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'hr'] },
  },
  // NEW MODULE ROUTES - TIME-OFF
  {
    path: '/admin/time-off',
    name: 'AdminTimeOff',
    component: () => import('../views/admin/time-off/TimeOffAdmin.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'hr', 'manager'] },
  },
  // NEW MODULE ROUTES - HOLIDAYS
  {
    path: '/admin/holidays',
    name: 'Holidays',
    component: () => import('../views/admin/holidays/HolidaysAdmin.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'hr'] },
  },
  // Account & Settings
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/preferences',
    name: 'Preferences',
    component: () => import('../views/Preferences.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/security',
    name: 'Security',
    component: () => import('../views/Security.vue'),
    meta: { requiresAuth: true },
  },
  // System & Configuration
  {
    path: '/admin/audit-logs',
    name: 'AuditLogs',
    component: () => import('../views/admin/AuditLogs.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'hr'] },
  },
  {
    path: '/admin/roles',
    name: 'Roles',
    component: () => import('../views/admin/Roles.vue'),
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/admin/departments',
    name: 'Departments',
    component: () => import('../views/admin/Departments.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'hr'] },
  },
  {
    path: '/admin/regions',
    name: 'Regions',
    component: () => import('../views/admin/Regions.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'hr'] },
  },
  {
    path: '/admin/settings',
    name: 'Settings',
    component: () => import('../views/admin/Settings.vue'),
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  // Existing routes preserved
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('../views/Chat.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/announcements',
    name: 'Announcements',
    component: () => import('../views/Announcements.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/audit/dashboard',
    name: 'AuditDashboard',
    component: () => import('../views/audit/Dashboard.vue'),
    meta: { requiresAuth: true, roles: ['auditor'] },
  },
  {
    path: '/audit/logs',
    name: 'AuditLogs',
    component: () => import('../views/audit/Logs.vue'),
    meta: { requiresAuth: true, roles: ['auditor'] },
  },
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('../views/Reports.vue'),
    meta: { requiresAuth: true, roles: ['auditor', 'admin', 'hr'] },
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
  // NEW MODULE ROUTES - EMPLOYEE ATTENDANCE
  {
    path: '/employee/attendance',
    name: 'EmployeeAttendance',
    component: () => import('../views/employee/attendance/TimeClock.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/employee/daily-notes',
    name: 'EmployeeDailyNotes',
    component: () => import('../views/employee/DailyNotes.vue'),
    meta: { requiresAuth: true },
  },
  // NEW MODULE ROUTES - EMPLOYEE TIME-OFF
  {
    path: '/employee/time-off',
    name: 'EmployeeTimeOff',
    component: () => import('../views/employee/time-off/TimeOffEmployee.vue'),
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
  
  if (!authStore.accessToken && localStorage.getItem('accessToken')) {
    authStore.initFromStorage()
  }

  const isAuthenticated = authStore.isAuthenticated
  const userRole = authStore.role

  if (to.meta.guest) {
    if (isAuthenticated) {
      const redirect = getDefaultDashboard(authStore.role)
      next(redirect)
      return
    }
    next()
    return
  }

  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      next({ name: 'Login', query: { redirect: to.fullPath } })
      return
    }

    if (to.meta.roles) {
      const allowedRoles = [...to.meta.roles]
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

    if (isAuthenticated && !authStore.user) {
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
