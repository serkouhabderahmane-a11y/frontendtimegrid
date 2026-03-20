<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const isHR = computed(() => authStore.isHR || authStore.isAdmin)
const isSupervisor = computed(() => authStore.isSupervisor)
const isStaff = computed(() => authStore.isStaff)
const isClinical = computed(() => authStore.isClinical)
const isAuditor = computed(() => authStore.isAuditor)
const isEmployee = computed(() => authStore.isEmployee)
const isDemo = computed(() => authStore.isDemo)
const isReadOnly = computed(() => authStore.isReadOnly)

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const resetDemoData = async () => {
  if (confirm('Reset all demo data? This will clear any changes you made.')) {
    try {
      const api = (await import('./api/axios')).default
      await api.post('/demo/reset')
      window.location.reload()
    } catch (e) {
      console.error('Failed to reset demo data:', e)
      window.location.reload()
    }
  }
}

onMounted(async () => {
  authStore.initFromStorage()
  
  const isDemo = authStore.accessToken?.startsWith('demo-')
  if (authStore.accessToken && !authStore.user && !isDemo) {
    await authStore.fetchUser()
  }
})
</script>

<template>
  <div class="app">
    <!-- Demo Mode Banner -->
    <div v-if="isDemo" class="demo-banner">
      <div class="demo-banner-content">
        <svg class="demo-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span class="demo-text">
          <strong>Demo Mode</strong> - All actions are simulated. 
          No real data is affected.
        </span>
        <div class="demo-actions">
          <button @click="resetDemoData" class="demo-btn demo-btn-reset">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Reset Data
          </button>
          <span class="demo-expires">Session expires in 2 hours</span>
        </div>
      </div>
    </div>
    
    <!-- Navigation -->
    <nav v-if="isAuthenticated" class="nav">
      <div class="nav-container">
        <RouterLink to="/" class="nav-brand">
          <div class="brand-icon">
            <span>TG</span>
          </div>
          <span>TimeGrid</span>
        </RouterLink>
        
        <div class="nav-links">
          <RouterLink to="/" class="nav-link">Home</RouterLink>
          
          <!-- HR Admin Navigation -->
          <template v-if="isHR">
            <RouterLink to="/admin" class="nav-link">Dashboard</RouterLink>
            <RouterLink to="/admin/candidates" class="nav-link">Candidates</RouterLink>
            <RouterLink to="/admin/approvals" class="nav-link">
              Approvals
              <span class="badge">3</span>
            </RouterLink>
            <RouterLink to="/admin/daily-notes" class="nav-link">Daily Notes</RouterLink>
            <RouterLink to="/admin/mar" class="nav-link">MAR</RouterLink>
            <RouterLink to="/admin/training-videos" class="nav-link">Training</RouterLink>
          </template>
          
          <!-- Supervisor Navigation -->
          <template v-if="isSupervisor">
            <RouterLink to="/admin/approvals" class="nav-link">
              Approval Queue
              <span class="badge">3</span>
            </RouterLink>
            <RouterLink to="/admin/timesheets" class="nav-link">Timesheets</RouterLink>
            <RouterLink to="/admin/daily-notes" class="nav-link">Notes</RouterLink>
            <RouterLink to="/admin/mar" class="nav-link">MAR</RouterLink>
          </template>
          
          <!-- Staff Navigation -->
          <template v-if="isStaff">
            <RouterLink to="/employee/timeclock" class="nav-link">Time Clock</RouterLink>
            <RouterLink to="/employee/schedule" class="nav-link">Schedule</RouterLink>
            <RouterLink to="/announcements" class="nav-link">Announcements</RouterLink>
          </template>
          
          <!-- Clinical Navigation (Nurse/Med Tech) -->
          <template v-if="isClinical">
            <RouterLink to="/employee/timeclock" class="nav-link">Time Clock</RouterLink>
            <RouterLink to="/care/participants" class="nav-link">Participants</RouterLink>
            <RouterLink to="/care/mar" class="nav-link">MAR</RouterLink>
            <RouterLink to="/care/vitals" class="nav-link">Vitals</RouterLink>
            <RouterLink to="/care/notes" class="nav-link">Care Notes</RouterLink>
          </template>
          
          <!-- Auditor Navigation -->
          <template v-if="isAuditor">
            <RouterLink to="/audit/dashboard" class="nav-link">Audit</RouterLink>
            <RouterLink to="/reports" class="nav-link">Reports</RouterLink>
            <RouterLink to="/audit/logs" class="nav-link">Audit Logs</RouterLink>
          </template>
          
          <!-- Common Navigation -->
          <RouterLink to="/chat" class="nav-link">Messages</RouterLink>
          <RouterLink to="/announcements" class="nav-link">Announcements</RouterLink>
        </div>
        
        <div class="nav-user">
          <span v-if="isReadOnly" class="readonly-badge">Read Only</span>
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

/* Toast Notifications */
.toast-notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 0.75rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  z-index: 9999;
  animation: toastSlideIn 0.3s ease;
  max-width: 400px;
}

@keyframes toastSlideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.toast-notification.toast-success {
  border-color: #42b883;
}

.toast-notification.toast-success::before {
  content: '✓';
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #42b883;
  color: white;
  border-radius: 50%;
  font-size: 12px;
  font-weight: bold;
}

.toast-notification.toast-error {
  border-color: #ef4444;
}

.toast-notification.toast-error::before {
  content: '!';
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  font-size: 12px;
  font-weight: bold;
}

.toast-notification span {
  color: #e2e8f0;
  font-size: 0.875rem;
}

.toast-close {
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.toast-close:hover {
  color: #94a3b8;
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

.brand-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #42b883, #359268);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: white;
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

.readonly-badge {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
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

/* Demo Mode Banner */
.demo-banner {
  background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
  color: #1e293b;
  padding: 0.5rem 1rem;
  position: sticky;
  top: 0;
  z-index: 100;
}

.demo-banner-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.demo-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.demo-text {
  font-size: 0.875rem;
  flex: 1;
}

.demo-text strong {
  font-weight: 600;
}

.demo-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.demo-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.demo-btn-reset {
  background: rgba(255, 255, 255, 0.9);
  color: #92400e;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.demo-btn-reset:hover {
  background: white;
}

.demo-expires {
  font-size: 0.75rem;
  opacity: 0.8;
}
</style>
