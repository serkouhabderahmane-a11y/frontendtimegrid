<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import AppLayout from './components/layout/AppLayout.vue'

const authStore = useAuthStore()
const router = useRouter()

const isAuthenticated = computed(() => authStore.isAuthenticated)

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

onMounted(async () => {
  authStore.initFromStorage()
  
  if (authStore.accessToken && !authStore.user) {
    await authStore.fetchUser()
  }
})
</script>

<template>
  <div class="app">
    <AppLayout v-if="isAuthenticated">
      <RouterView />
    </AppLayout>
    
    <main v-else class="main-simple">
      <RouterView />
    </main>
  </div>
</template>

<style>
.app {
  min-height: 100vh;
}

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
  border-color: #006e5b;
}

.toast-notification.toast-success::before {
  content: '✓';
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #006e5b;
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

.main-simple {
  min-height: 100vh;
}
</style>
