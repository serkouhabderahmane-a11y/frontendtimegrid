<template>
  <div class="departments-page">
    <header class="page-header">
      <div>
        <h1>Departments</h1>
        <p>Manage organizational departments</p>
      </div>
      <button v-if="canCreate" class="btn btn-primary" @click="showCreateModal = true">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
        </svg>
        Add Department
      </button>
    </header>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading departments...</p>
    </div>

    <div v-else class="card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Department Name</th>
            <th>Head</th>
            <th>Employees</th>
            <th>Location</th>
            <th>Status</th>
            <th v-if="canEdit">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="dept in departments" :key="dept.id">
            <td class="name-cell">{{ dept.name }}</td>
            <td>{{ dept.head?.name || '-' }}</td>
            <td>{{ dept.employeeCount || 0 }}</td>
            <td>{{ dept.location?.name || '-' }}</td>
            <td>
              <span class="status-badge" :class="dept.isActive ? 'active' : 'inactive'">
                {{ dept.isActive ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td v-if="canEdit" class="actions-cell">
              <button @click="editDepartment(dept)" class="btn-icon">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                </svg>
              </button>
              <button @click="deleteDepartment(dept.id)" class="btn-icon btn-icon-danger">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import api from '../../api/axios'

const authStore = useAuthStore()

const loading = ref(true)
const departments = ref([])

const canCreate = computed(() => authStore.isAdmin || authStore.isHR)
const canEdit = computed(() => authStore.isAdmin || authStore.isHR)

const fetchDepartments = async () => {
  loading.value = true
  try {
    const response = await api.get('/api/departments')
    departments.value = response.data
  } catch (e) {
    console.error('Failed to fetch departments:', e)
  } finally {
    loading.value = false
  }
}

const editDepartment = (dept) => {
  console.log('Edit department:', dept)
}

const deleteDepartment = async (id) => {
  if (confirm('Are you sure you want to delete this department?')) {
    try {
      await api.delete(`/api/departments/${id}`)
      departments.value = departments.value.filter(d => d.id !== id)
    } catch (e) {
      console.error('Failed to delete department:', e)
    }
  }
}

onMounted(() => {
  fetchDepartments()
})
</script>

<style scoped>
.departments-page {
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

.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 1rem;
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: #0f172a;
  color: #94a3b8;
  font-weight: 600;
  text-align: left;
  padding: 1rem;
  font-size: 0.875rem;
}

.data-table td {
  padding: 1rem;
  border-bottom: 1px solid #334155;
  color: #e2e8f0;
  font-size: 0.875rem;
}

.data-table tr:last-child td {
  border-bottom: none;
}

.name-cell {
  font-weight: 500;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge.active {
  background: rgba(66, 184, 131, 0.1);
  color: #42b883;
}

.status-badge.inactive {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid #334155;
  border-radius: 0.5rem;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #334155;
  color: #f8fafc;
}

.btn-icon-danger:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
  color: #ef4444;
}
</style>
