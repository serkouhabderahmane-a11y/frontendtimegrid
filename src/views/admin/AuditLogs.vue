<template>
  <div class="audit-logs-page">
    <header class="page-header">
      <h1>Audit Logs</h1>
      <p>Track all system activities and changes</p>
    </header>

    <div class="filters-bar">
      <select v-model="filters.action" class="filter-select" @change="fetchLogs">
        <option value="">All Actions</option>
        <option value="CREATE">Create</option>
        <option value="UPDATE">Update</option>
        <option value="DELETE">Delete</option>
        <option value="LOGIN">Login</option>
        <option value="LOGOUT">Logout</option>
      </select>
      <select v-model="filters.userId" class="filter-select" @change="fetchLogs">
        <option value="">All Users</option>
        <option v-for="user in users" :key="user.id" :value="user.id">{{ user.name }}</option>
      </select>
      <input type="date" v-model="filters.startDate" class="filter-input" @change="fetchLogs" />
      <input type="date" v-model="filters.endDate" class="filter-input" @change="fetchLogs" />
      <button @click="exportLogs" class="btn btn-outline">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
        </svg>
        Export
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading audit logs...</p>
    </div>

    <div v-else class="card">
      <table class="logs-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>User</th>
            <th>Action</th>
            <th>Resource</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in logs" :key="log.id">
            <td>{{ formatDateTime(log.timestamp) }}</td>
            <td>{{ log.user?.name || 'System' }}</td>
            <td><span class="action-badge" :class="log.action.toLowerCase()">{{ log.action }}</span></td>
            <td>{{ log.resource }}</td>
            <td class="details-cell">{{ log.details }}</td>
          </tr>
        </tbody>
      </table>

      <div v-if="logs.length === 0" class="empty-state">
        <p>No audit logs found matching your criteria.</p>
      </div>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1" class="btn btn-outline">
        Previous
      </button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages" class="btn btn-outline">
        Next
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import api from '../../api/axios'

const authStore = useAuthStore()

const loading = ref(true)
const logs = ref([])
const users = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const filters = ref({
  action: '',
  userId: '',
  startDate: '',
  endDate: ''
})

const fetchLogs = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      ...filters.value
    }
    const response = await api.get('/api/audit-logs', { params })
    logs.value = response.data.data
    totalPages.value = response.data.totalPages
  } catch (e) {
    console.error('Failed to fetch audit logs:', e)
  } finally {
    loading.value = false
  }
}

const fetchUsers = async () => {
  try {
    const response = await api.get('/api/users')
    users.value = response.data
  } catch (e) {
    console.error('Failed to fetch users:', e)
  }
}

const formatDateTime = (timestamp) => {
  return new Date(timestamp).toLocaleString()
}

const exportLogs = async () => {
  try {
    const response = await api.get('/api/audit-logs/export', { responseType: 'blob', params: filters.value })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `audit-logs-${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (e) {
    console.error('Failed to export logs:', e)
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchLogs()
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchLogs()
  }
}

onMounted(() => {
  fetchLogs()
  fetchUsers()
})
</script>

<style scoped>
.audit-logs-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
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

.filters-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.filter-select, .filter-input {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 0.5rem;
  padding: 0.625rem 1rem;
  color: #e2e8f0;
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

.btn-outline {
  background: transparent;
  border: 1px solid #64748b;
  color: #94a3b8;
}

.btn-outline:hover:not(:disabled) {
  background: #334155;
}

.btn-outline:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
  border-top-color: #006e5b;
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

.logs-table {
  width: 100%;
  border-collapse: collapse;
}

.logs-table th {
  background: #0f172a;
  color: #94a3b8;
  font-weight: 600;
  text-align: left;
  padding: 1rem;
  font-size: 0.875rem;
}

.logs-table td {
  padding: 1rem;
  border-bottom: 1px solid #334155;
  color: #e2e8f0;
  font-size: 0.875rem;
}

.logs-table tr:last-child td {
  border-bottom: none;
}

.action-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.action-badge.create { background: rgba(0, 110, 91, 0.1); color: #006e5b; }
.action-badge.update { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.action-badge.delete { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
.action-badge.login, .action-badge.logout { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }

.details-cell {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #64748b;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.pagination span {
  color: #94a3b8;
}
</style>
