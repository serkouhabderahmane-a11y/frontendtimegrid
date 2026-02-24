import { createRouter, createWebHistory } from 'vue-router'

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
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('../views/admin/Dashboard.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'hr'] },
  },
  {
    path: '/admin/candidates',
    name: 'Candidates',
    component: () => import('../views/admin/Candidates.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'hr'] },
  },
  {
    path: '/admin/candidates/:id',
    name: 'CandidateDetail',
    component: () => import('../views/admin/CandidateDetail.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'hr'] },
  },
  {
    path: '/admin/approvals',
    name: 'Approvals',
    component: () => import('../views/admin/Approvals.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'hr'] },
  },
  {
    path: '/employee/timeclock',
    name: 'TimeClock',
    component: () => import('../views/employee/TimeClock.vue'),
    meta: { requiresAuth: true, roles: ['employee'] },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const { useAuthStore } = await import('../stores/auth')
  const authStore = useAuthStore()
  const isDemo = authStore.accessToken?.startsWith('demo-')
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  if (to.meta.guest && authStore.isAuthenticated) {
    next({ name: 'Home' })
    return
  }

  if (to.meta.roles && !to.meta.roles.includes(authStore.user?.role)) {
    next({ name: 'Home' })
    return
  }

  if (authStore.isAuthenticated && !authStore.user && !isDemo) {
    await authStore.fetchUser()
  }

  next()
})

export default router
