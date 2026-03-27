<template>
  <div class="audit-dashboard">
    <header class="page-header">
      <h1>Audit Dashboard</h1>
      <p>Monitor system activity and compliance</p>
    </header>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading dashboard...</p>
    </div>

    <template v-else>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ stats.totalActions }}</div>
          <div class="stat-label">Total Actions (30d)</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.activeUsers }}</div>
          <div class="stat-label">Active Users</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.alerts }}</div>
          <div class="stat-label">Alerts</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.uptime }}%</div>
          <div class="stat-label">Uptime</div>
        </div>
      </div>

      <div class="dashboard-grid">
        <div class="card">
          <h3>Activity by Module</h3>
          <div class="activity-list">
            <div v-for="item in activityByModule" :key="item.module" class="activity-item">
              <span class="activity-module">{{ item.module }}</span>
              <span class="activity-count">{{ item.count }}</span>
            </div>
          </div>
        </div>

        <div class="card">
          <h3>Recent Alerts</h3>
          <div class="alerts-list">
            <div v-for="alert in recentAlerts" :key="alert.id" class="alert-item" :class="alert.severity">
              <div class="alert-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <div class="alert-content">
                <span class="alert-title">{{ alert.title }}</span>
                <span class="alert-time">{{ formatTime(alert.timestamp) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../api/axios'

const loading = ref(true)
const stats = ref({
  totalActions: 0,
  activeUsers: 0,
  alerts: 0,
  uptime: 100
})
const activityByModule = ref([])
const recentAlerts = ref([])

const fetchDashboard = async () => {
  loading.value = true
  try {
    const response = await api.get('/api/audit/dashboard')
    stats.value = response.data.stats
    activityByModule.value = response.data.activityByModule
    recentAlerts.value = response.data.recentAlerts
  } catch (e) {
    console.error('Failed to fetch audit dashboard:', e)
  } finally {
    loading.value = false
  }
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleString()
}

onMounted(() => {
  fetchDashboard()
})
</script>

<style scoped>
.audit-dashboard {
  max-width: 1200px;
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 1rem;
  padding: 1.5rem;
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #42b883;
  margin-bottom: 0.25rem;
}

.stat-label {
  color: #94a3b8;
  font-size: 0.875rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 1rem;
  padding: 1.5rem;
}

.card h3 {
  color: #f8fafc;
  margin-bottom: 1.5rem;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.activity-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: #0f172a;
  border-radius: 0.5rem;
}

.activity-module {
  color: #e2e8f0;
}

.activity-count {
  color: #42b883;
  font-weight: 600;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.alert-item {
  display: flex;
  gap: 1rem;
  padding: 0.75rem;
  background: #0f172a;
  border-radius: 0.5rem;
  border-left: 3px solid;
}

.alert-item.warning {
  border-color: #f59e0b;
}

.alert-item.error {
  border-color: #ef4444;
}

.alert-item.info {
  border-color: #3b82f6;
}

.alert-icon {
  color: #f59e0b;
}

.alert-item.error .alert-icon {
  color: #ef4444;
}

.alert-item.info .alert-icon {
  color: #3b82f6;
}

.alert-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.alert-title {
  color: #e2e8f0;
  font-weight: 500;
}

.alert-time {
  color: #64748b;
  font-size: 0.75rem;
}
</style>
