<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const isHR = computed(() => authStore.isHR || authStore.isAdmin)
const isEmployee = computed(() => authStore.isEmployee)

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

onMounted(async () => {
  const isDemo = authStore.accessToken?.startsWith('demo-')
  if (authStore.accessToken && !authStore.user && !isDemo) {
    await authStore.fetchUser()
  }
})
</script>

<template>
  <div class="app">
    <!-- Navigation -->
    <nav v-if="isAuthenticated" class="nav">
      <div class="nav-container">
        <RouterLink to="/" class="nav-brand">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>TimeGrid</span>
        </RouterLink>
        
        <div class="nav-links">
          <RouterLink to="/" class="nav-link">Home</RouterLink>
          <template v-if="isHR">
            <RouterLink to="/admin" class="nav-link">Dashboard</RouterLink>
            <RouterLink to="/admin/candidates" class="nav-link">Candidates</RouterLink>
            <RouterLink to="/admin/approvals" class="nav-link">
              Approvals
              <span class="badge">3</span>
            </RouterLink>
          </template>
          <RouterLink v-if="isEmployee" to="/employee/timeclock" class="nav-link">Time Clock</RouterLink>
        </div>
        
        <div class="nav-user">
          <div class="user-avatar">{{ authStore.user?.firstName?.[0] }}{{ authStore.user?.lastName?.[0] }}</div>
          <span class="user-name">{{ authStore.fullName }}</span>
          <button @click="handleLogout" class="btn-logout">Logout</button>
        </div>
      </div>
    </nav>
    
    <!-- Main Content -->
    <main class="main">
      <RouterView />
    </main>
  </div>
</template>

<style>
.app {
  min-height: 100vh;
}

.nav {
  background: linear-gradient(to right, #1e293b, #0f172a);
  border-bottom: 1px solid #334155;
  position: sticky;
  top: 0;
  z-index: 50;
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #42b883;
  font-weight: 700;
  font-size: 1.25rem;
  text-decoration: none;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-link {
  color: #94a3b8;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-link:hover {
  color: #e2e8f0;
  background: #1e293b;
}

.nav-link.router-link-active {
  color: #42b883;
  background: rgba(66, 184, 131, 0.1);
}

.badge {
  background: #ef4444;
  color: white;
  font-size: 0.625rem;
  padding: 0.125rem 0.375rem;
  border-radius: 9999px;
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, #42b883, #359268);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.user-name {
  color: #e2e8f0;
  font-size: 0.875rem;
}

.btn-logout {
  background: transparent;
  border: 1px solid #475569;
  color: #94a3b8;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-logout:hover {
  background: #1e293b;
  color: #e2e8f0;
}

.main {
  min-height: calc(100vh - 65px);
}
</style>
