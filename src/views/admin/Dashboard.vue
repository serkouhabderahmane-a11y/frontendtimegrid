<template>
  <div class="dashboard">
    <header class="page-header">
      <div>
        <h1>HR Dashboard</h1>
        <p>Monitor your workforce and onboarding pipeline</p>
      </div>
      <div class="header-actions">
        <router-link to="/admin/candidates" class="btn btn-primary">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          Add Candidate
        </router-link>
      </div>
    </header>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-header">
          <div class="stat-icon blue">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <span class="stat-trend up">+12%</span>
        </div>
        <div class="stat-value">{{ stats?.totalCandidates || 24 }}</div>
        <div class="stat-label">Total Candidates</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-header">
          <div class="stat-icon green">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <span class="stat-trend up">+8%</span>
        </div>
        <div class="stat-value">{{ stats?.activeEmployees || 156 }}</div>
        <div class="stat-label">Active Employees</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-header">
          <div class="stat-icon orange">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        </div>
        <div class="stat-value">{{ stats?.pendingApprovals || 8 }}</div>
        <div class="stat-label">Pending Approvals</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-header">
          <div class="stat-icon purple">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
          </div>
        </div>
        <div class="stat-value">{{ stats?.candidatesByState?.in_progress || 12 }}</div>
        <div class="stat-label">In Progress</div>
      </div>
    </div>

    <div class="dashboard-grid">
      <!-- Candidates by Status -->
      <div class="card">
        <div class="card-header">
          <h2>Candidates by Status</h2>
          <router-link to="/admin/candidates" class="view-all">View All</router-link>
        </div>
        <div class="status-list">
          <div v-for="(count, state) in stats?.candidatesByState" :key="state" class="status-item">
            <div class="status-info">
              <span class="status-dot" :class="state"></span>
              <span class="status-label">{{ formatState(state) }}</span>
            </div>
            <span class="status-count">{{ count }}</span>
          </div>
          <div v-if="!stats?.candidatesByState" class="empty-state">
            <div class="status-item">
              <div class="status-info">
                <span class="status-dot candidate_created"></span>
                <span class="status-label">New</span>
              </div>
              <span class="status-count">5</span>
            </div>
            <div class="status-item">
              <div class="status-info">
                <span class="status-dot packet_assigned"></span>
                <span class="status-label">Assigned</span>
              </div>
              <span class="status-count">3</span>
            </div>
            <div class="status-item">
              <div class="status-info">
                <span class="status-dot in_progress"></span>
                <span class="status-label">In Progress</span>
              </div>
              <span class="status-count">12</span>
            </div>
            <div class="status-item">
              <div class="status-info">
                <span class="status-dot pending_hr_review"></span>
                <span class="status-label">Pending Review</span>
              </div>
              <span class="status-count">8</span>
            </div>
            <div class="status-item">
              <div class="status-info">
                <span class="status-dot employee_active"></span>
                <span class="status-label">Active</span>
              </div>
              <span class="status-count">156</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="card">
        <div class="card-header">
          <h2>Quick Actions</h2>
        </div>
        <div class="actions-list">
          <router-link to="/admin/approvals" class="action-item">
            <div class="action-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="action-content">
              <span class="action-title">Review Pending Tasks</span>
              <span class="action-desc">{{ stats?.pendingApprovals || 8 }} tasks awaiting review</span>
            </div>
            <svg class="action-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </router-link>
          
          <router-link to="/admin/candidates" class="action-item">
            <div class="action-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
              </svg>
            </div>
            <div class="action-content">
              <span class="action-title">Add New Candidate</span>
              <span class="action-desc">Create a new candidate record</span>
            </div>
            <svg class="action-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </router-link>
          
          <div class="action-item">
            <div class="action-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <div class="action-content">
              <span class="action-title">Export Reports</span>
              <span class="action-desc">Download onboarding data</span>
            </div>
            <svg class="action-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useHrDashboardStore } from '../../stores/hrDashboard'

const authStore = useAuthStore()
const hrStore = useHrDashboardStore()

const stats = computed(() => hrStore.stats)

const formatState = (state) => {
  const states = {
    candidate_created: 'New',
    packet_assigned: 'Assigned',
    in_progress: 'In Progress',
    pending_hr_review: 'Pending Review',
    approved: 'Approved',
    employee_active: 'Active',
  }
  return states[state] || state
}

onMounted(async () => {
  const isDemo = authStore.accessToken?.startsWith('demo-')
  if (!isDemo && authStore.user?.tenantId) {
    await hrStore.fetchStats(authStore.user.tenantId)
  }
})
</script>

<style scoped>
.dashboard {
  max-width: 1400px;
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
  text-decoration: none;
  transition: all 0.2s;
}

.btn-primary {
  background: #42b883;
  color: white;
}

.btn-primary:hover {
  background: #359268;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 1rem;
  padding: 1.25rem;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.stat-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon svg {
  width: 1.25rem;
  height: 1.25rem;
}

.stat-icon.blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.stat-icon.green { background: rgba(66, 184, 131, 0.1); color: #42b883; }
.stat-icon.orange { background: rgba(249, 115, 22, 0.1); color: #f97316; }
.stat-icon.purple { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }

.stat-trend {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
}

.stat-trend.up {
  background: rgba(66, 184, 131, 0.1);
  color: #42b883;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #94a3b8;
}

/* Dashboard Grid */
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.card-header h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #f8fafc;
}

.view-all {
  color: #42b883;
  font-size: 0.875rem;
  text-decoration: none;
}

.view-all:hover {
  text-decoration: underline;
}

/* Status List */
.status-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #0f172a;
  border-radius: 0.5rem;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.status-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
}

.status-dot.candidate_created { background: #3b82f6; }
.status-dot.packet_assigned { background: #f97316; }
.status-dot.in_progress { background: #8b5cf6; }
.status-dot.pending_hr_review { background: #eab308; }
.status-dot.approved { background: #22c55e; }
.status-dot.employee_active { background: #42b883; }

.status-label {
  color: #e2e8f0;
  font-size: 0.875rem;
}

.status-count {
  color: #42b883;
  font-weight: 600;
}

/* Actions List */
.actions-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem;
  background: #0f172a;
  border-radius: 0.5rem;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
}

.action-item:hover {
  background: #1e293b;
}

.action-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  background: rgba(66, 184, 131, 0.1);
  color: #42b883;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.action-icon svg {
  width: 1.25rem;
  height: 1.25rem;
}

.action-content {
  flex: 1;
  min-width: 0;
}

.action-title {
  display: block;
  color: #e2e8f0;
  font-weight: 500;
  margin-bottom: 0.125rem;
}

.action-desc {
  display: block;
  color: #64748b;
  font-size: 0.75rem;
}

.action-arrow {
  width: 1.25rem;
  height: 1.25rem;
  color: #64748b;
  flex-shrink: 0;
}
</style>
