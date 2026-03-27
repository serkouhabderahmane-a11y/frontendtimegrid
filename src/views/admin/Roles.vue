<template>
  <div class="roles-page">
    <header class="page-header">
      <div>
        <h1>Roles & Permissions</h1>
        <p>Manage user roles and access permissions</p>
      </div>
      <button v-if="canCreate" class="btn btn-primary" @click="showCreateModal = true">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
        </svg>
        Add Role
      </button>
    </header>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading roles...</p>
    </div>

    <div v-else class="roles-grid">
      <div v-for="role in roles" :key="role.id" class="card role-card">
        <div class="role-header">
          <div class="role-icon" :style="{ background: role.color + '20', color: role.color }">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
          </div>
          <h3>{{ role.name }}</h3>
        </div>
        <p class="role-description">{{ role.description }}</p>
        <div class="role-stats">
          <span>{{ role.userCount || 0 }} users</span>
        </div>
        <div class="role-permissions">
          <span v-for="perm in role.permissions?.slice(0, 3)" :key="perm" class="permission-tag">
            {{ perm }}
          </span>
          <span v-if="role.permissions?.length > 3" class="permission-more">
            +{{ role.permissions.length - 3 }} more
          </span>
        </div>
        <div class="role-actions">
          <button @click="editRole(role)" class="btn btn-outline btn-sm">Manage</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import api from '../../api/axios'

const authStore = useAuthStore()

const loading = ref(true)
const roles = ref([])
const showCreateModal = ref(false)

const canCreate = computed(() => authStore.isAdmin)

const fetchRoles = async () => {
  loading.value = true
  try {
    const response = await api.get('/api/roles')
    roles.value = response.data
  } catch (e) {
    console.error('Failed to fetch roles:', e)
  } finally {
    loading.value = false
  }
}

const editRole = (role) => {
  console.log('Edit role:', role)
}

onMounted(() => {
  fetchRoles()
})
</script>

<style scoped>
.roles-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 0.25rem;
}

.page-header p {
  color: #94a3b8;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #42b883;
  color: white;
}

.btn-primary:hover {
  background: #359268;
}

.btn-outline {
  background: transparent;
  border: 1px solid #64748b;
  color: #94a3b8;
}

.btn-outline:hover {
  background: #334155;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
}

.loading-state {
  text-align: center;
  padding: 3rem;
  color: #94a3b8;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #334155;
  border-top-color: #42b883;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 1rem;
  padding: 1.5rem;
}

.role-card {
  display: flex;
  flex-direction: column;
}

.role-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.role-icon {
  width: 48px;
  height: 48px;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.role-icon svg {
  width: 24px;
  height: 24px;
}

.role-header h3 {
  color: #f8fafc;
  font-size: 1.125rem;
}

.role-description {
  color: #94a3b8;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  flex: 1;
}

.role-stats {
  color: #64748b;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.role-permissions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.permission-tag {
  background: #0f172a;
  color: #94a3b8;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

.permission-more {
  color: #42b883;
  font-size: 0.75rem;
}

.role-actions {
  margin-top: auto;
}
</style>
