<template>
  <div class="admin-attendance">
    <header class="page-header">
      <div>
        <h1>Attendance Management</h1>
        <p>Track and manage employee attendance records</p>
      </div>
      <div class="header-actions">
        <button @click="exportData" class="btn btn-secondary">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          Export
        </button>
      </div>
    </header>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon blue">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ stats.activeEmployees || 0 }}</span>
          <span class="stat-label">Active Today</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ stats.lateArrivals || 0 }}</span>
          <span class="stat-label">Late Arrivals</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon purple">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ stats.earlyLeaves || 0 }}</span>
          <span class="stat-label">Early Leaves</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon red">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ stats.flaggedRecords || 0 }}</span>
          <span class="stat-label">Flagged</span>
        </div>
      </div>
    </div>

    <div class="filters-section">
      <div class="filter-group">
        <label>Date Range</label>
        <div class="date-inputs">
          <input type="date" v-model="filters.startDate" @change="fetchAttendance" />
          <span>to</span>
          <input type="date" v-model="filters.endDate" @change="fetchAttendance" />
        </div>
      </div>
      <div class="filter-group">
        <label>Employee</label>
        <select v-model="filters.employeeId" @change="fetchAttendance">
          <option value="">All Employees</option>
          <option v-for="emp in employees" :key="emp.id" :value="emp.id">
            {{ emp.user.firstName }} {{ emp.user.lastName }}
          </option>
        </select>
      </div>
      <div class="filter-group">
        <label>Department</label>
        <select v-model="filters.departmentId" @change="fetchAttendance">
          <option value="">All Departments</option>
          <option v-for="dept in departments" :key="dept.id" :value="dept.id">
            {{ dept.name }}
          </option>
        </select>
      </div>
      <div class="filter-group">
        <label>Status</label>
        <select v-model="filters.status" @change="fetchAttendance">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="flagged">Flagged</option>
          <option value="adjusted">Adjusted</option>
        </select>
      </div>
    </div>

    <div class="attendance-table-container">
      <table class="attendance-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Date</th>
            <th>Clock In</th>
            <th>Clock Out</th>
            <th>Duration</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="7" class="loading-cell">
              <div class="spinner"></div>
              Loading attendance records...
            </td>
          </tr>
          <tr v-else-if="attendance.length === 0">
            <td colspan="7" class="empty-cell">
              No attendance records found
            </td>
          </tr>
          <tr v-for="record in attendance" :key="record.id">
            <td>
              <div class="employee-cell">
                <div class="employee-avatar">
                  {{ record.employee?.user?.firstName?.[0] }}{{ record.employee?.user?.lastName?.[0] }}
                </div>
                <div class="employee-info">
                  <span class="employee-name">{{ record.employee?.user?.firstName }} {{ record.employee?.user?.lastName }}</span>
                  <span class="employee-dept">{{ record.employee?.department?.name || 'N/A' }}</span>
                </div>
              </div>
            </td>
            <td>{{ formatDate(record.workDate) }}</td>
            <td>{{ formatTime(record.clockIn) }}</td>
            <td>{{ formatTime(record.clockOut) || '-' }}</td>
            <td>{{ formatDuration(record.totalMinutes) }}</td>
            <td>
              <span class="status-badge" :class="record.status">
                {{ record.status }}
              </span>
              <div class="status-indicators">
                <span v-if="record.isLate" class="indicator late">Late</span>
                <span v-if="record.isEarlyLeave" class="indicator early">Early</span>
                <span v-if="record.isHolidayWork" class="indicator holiday">Holiday</span>
              </div>
            </td>
            <td>
              <div class="action-buttons">
                <button @click="viewRecord(record)" class="btn-icon" title="View Details">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </button>
                <button @click="openAdjustModal(record)" class="btn-icon" title="Adjust">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="pagination.totalPages > 1" class="pagination">
      <button @click="changePage(pagination.page - 1)" :disabled="pagination.page === 1">
        Previous
      </button>
      <span>Page {{ pagination.page }} of {{ pagination.totalPages }}</span>
      <button @click="changePage(pagination.page + 1)" :disabled="pagination.page === pagination.totalPages">
        Next
      </button>
    </div>

    <div v-if="showAdjustModal" class="modal-overlay" @click.self="closeAdjustModal">
      <div class="modal">
        <div class="modal-header">
          <h2>Adjust Attendance</h2>
          <button @click="closeAdjustModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Clock In</label>
            <input type="datetime-local" v-model="adjustment.clockIn" />
          </div>
          <div class="form-group">
            <label>Clock Out</label>
            <input type="datetime-local" v-model="adjustment.clockOut" />
          </div>
          <div class="form-group">
            <label>Total Minutes</label>
            <input type="number" v-model="adjustment.totalMinutes" />
          </div>
          <div class="form-group">
            <label>Reason (required)</label>
            <textarea v-model="adjustment.reason" placeholder="Enter reason for adjustment (min 10 characters)"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeAdjustModal" class="btn btn-secondary">Cancel</button>
          <button @click="submitAdjustment" class="btn btn-primary" :disabled="!isValidAdjustment">
            Submit Adjustment
          </button>
        </div>
      </div>
    </div>

    <div v-if="showDetailModal" class="modal-overlay" @click.self="closeDetailModal">
      <div class="modal modal-lg">
        <div class="modal-header">
          <h2>Attendance Details</h2>
          <button @click="closeDetailModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="selectedRecord" class="detail-grid">
            <div class="detail-section">
              <h3>Employee Information</h3>
              <div class="detail-row">
                <span class="detail-label">Name:</span>
                <span class="detail-value">{{ selectedRecord.employee?.user?.firstName }} {{ selectedRecord.employee?.user?.lastName }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Department:</span>
                <span class="detail-value">{{ selectedRecord.employee?.department?.name || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Employee #:</span>
                <span class="detail-value">{{ selectedRecord.employee?.employeeNumber || 'N/A' }}</span>
              </div>
            </div>
            <div class="detail-section">
              <h3>Time Details</h3>
              <div class="detail-row">
                <span class="detail-label">Work Date:</span>
                <span class="detail-value">{{ formatDate(selectedRecord.workDate) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Clock In:</span>
                <span class="detail-value">{{ formatDateTime(selectedRecord.clockIn) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Clock Out:</span>
                <span class="detail-value">{{ formatDateTime(selectedRecord.clockOut) || '-' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Total Hours:</span>
                <span class="detail-value">{{ formatDuration(selectedRecord.totalMinutes) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Break Minutes:</span>
                <span class="detail-value">{{ selectedRecord.breakMinutes || 0 }} min</span>
              </div>
            </div>
            <div class="detail-section">
              <h3>Status</h3>
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="status-badge" :class="selectedRecord.status">{{ selectedRecord.status }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Late:</span>
                <span class="detail-value">{{ selectedRecord.isLate ? 'Yes' : 'No' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Early Leave:</span>
                <span class="detail-value">{{ selectedRecord.isEarlyLeave ? 'Yes' : 'No' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Holiday Work:</span>
                <span class="detail-value">{{ selectedRecord.isHolidayWork ? 'Yes' : 'No' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../../stores/auth'
import api from '../../../api/axios'

const authStore = useAuthStore()

const loading = ref(false)
const attendance = ref([])
const employees = ref([])
const departments = ref([])
const stats = ref({})
const pagination = ref({ page: 1, limit: 50, totalPages: 0 })
const showAdjustModal = ref(false)
const showDetailModal = ref(false)
const selectedRecord = ref(null)

const filters = ref({
  startDate: '',
  endDate: '',
  employeeId: '',
  departmentId: '',
  status: ''
})

const adjustment = ref({
  clockIn: '',
  clockOut: '',
  totalMinutes: null,
  reason: ''
})

const isValidAdjustment = computed(() => {
  return adjustment.value.reason && adjustment.value.reason.length >= 10
})

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

const formatDuration = (minutes) => {
  if (!minutes) return '-'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

const fetchAttendance = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.limit,
      ...filters.value
    }
    const response = await api.get('/api/attendance/admin/all', { params })
    attendance.value = response.data.data
    pagination.value.totalPages = response.data.totalPages
  } catch (err) {
    console.error('Failed to fetch attendance:', err)
  } finally {
    loading.value = false
  }
}

const fetchStats = async () => {
  try {
    const params = {
      startDate: filters.value.startDate || undefined,
      endDate: filters.value.endDate || undefined
    }
    const response = await api.get('/api/attendance/admin/stats', { params })
    stats.value = response.data
  } catch (err) {
    console.error('Failed to fetch stats:', err)
  }
}

const fetchEmployees = async () => {
  try {
    const response = await api.get('/api/attendance/admin/employees')
    employees.value = response.data
  } catch (err) {
    console.error('Failed to fetch employees:', err)
  }
}

const fetchDepartments = async () => {
  try {
    const response = await api.get('/api/attendance/admin/departments')
    departments.value = response.data
  } catch (err) {
    console.error('Failed to fetch departments:', err)
  }
}

const changePage = (page) => {
  pagination.value.page = page
  fetchAttendance()
}

const viewRecord = (record) => {
  selectedRecord.value = record
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedRecord.value = null
}

const openAdjustModal = (record) => {
  selectedRecord.value = record
  adjustment.value = {
    clockIn: record.clockIn ? new Date(record.clockIn).toISOString().slice(0, 16) : '',
    clockOut: record.clockOut ? new Date(record.clockOut).toISOString().slice(0, 16) : '',
    totalMinutes: record.totalMinutes,
    reason: ''
  }
  showAdjustModal.value = true
}

const closeAdjustModal = () => {
  showAdjustModal.value = false
  selectedRecord.value = null
  adjustment.value = { clockIn: '', clockOut: '', totalMinutes: null, reason: '' }
}

const submitAdjustment = async () => {
  if (!isValidAdjustment.value) return

  try {
    await api.patch(`/api/attendance/admin/${selectedRecord.value.id}/adjust`, {
      clockIn: adjustment.value.clockIn || null,
      clockOut: adjustment.value.clockOut || null,
      totalMinutes: adjustment.value.totalMinutes,
      reason: adjustment.value.reason
    })
    closeAdjustModal()
    fetchAttendance()
    fetchStats()
  } catch (err) {
    console.error('Failed to adjust attendance:', err)
    alert(err.response?.data?.message || 'Failed to adjust attendance')
  }
}

const exportData = async () => {
  try {
    const params = { ...filters.value }
    const response = await api.get('/api/attendance/admin/export', { params })
    const data = response.data
    const csv = [
      ['Employee', 'Department', 'Date', 'Clock In', 'Clock Out', 'Hours', 'Status', 'Late', 'Early'].join(','),
      ...data.map(r => [
        `${r.employeeName}`,
        r.department || '',
        formatDate(r.workDate),
        formatTime(r.clockIn),
        formatTime(r.clockOut),
        r.totalHours || 0,
        r.status,
        r.isLate ? 'Yes' : 'No',
        r.isEarlyLeave ? 'Yes' : 'No'
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance-export-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Failed to export:', err)
  }
}

onMounted(() => {
  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  filters.value.startDate = startOfMonth.toISOString().slice(0, 10)
  filters.value.endDate = today.toISOString().slice(0, 10)

  fetchAttendance()
  fetchStats()
  fetchEmployees()
  fetchDepartments()
})
</script>

<style scoped>
.admin-attendance {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
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

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 0.75rem;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.stat-icon.orange { background: rgba(249, 115, 22, 0.1); color: #f97316; }
.stat-icon.purple { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
.stat-icon.red { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

.stat-icon svg {
  width: 24px;
  height: 24px;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f8fafc;
}

.stat-label {
  color: #94a3b8;
  font-size: 0.875rem;
}

.filters-section {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 0.75rem;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  color: #94a3b8;
  font-size: 0.75rem;
  text-transform: uppercase;
}

.filter-group input,
.filter-group select {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  color: #f8fafc;
  min-width: 150px;
}

.date-inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-inputs span {
  color: #64748b;
}

.attendance-table-container {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 0.75rem;
  overflow: hidden;
}

.attendance-table {
  width: 100%;
  border-collapse: collapse;
}

.attendance-table th {
  background: #0f172a;
  padding: 1rem;
  text-align: left;
  color: #94a3b8;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
}

.attendance-table td {
  padding: 1rem;
  border-top: 1px solid #334155;
  color: #e2e8f0;
}

.attendance-table tr:hover td {
  background: rgba(51, 65, 85, 0.3);
}

.employee-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.employee-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #006e5b;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
}

.employee-info {
  display: flex;
  flex-direction: column;
}

.employee-name {
  font-weight: 500;
}

.employee-dept {
  font-size: 0.75rem;
  color: #64748b;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-badge.active { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
.status-badge.completed { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
.status-badge.flagged { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
.status-badge.adjusted { background: rgba(139, 92, 246, 0.2); color: #8b5cf6; }

.status-indicators {
  display: flex;
  gap: 0.25rem;
  margin-top: 0.25rem;
}

.indicator {
  font-size: 0.625rem;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-weight: 600;
}

.indicator.late { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
.indicator.early { background: rgba(249, 115, 22, 0.2); color: #f97316; }
.indicator.holiday { background: rgba(139, 92, 246, 0.2); color: #8b5cf6; }

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: #334155;
  border: none;
  border-radius: 0.375rem;
  padding: 0.5rem;
  cursor: pointer;
  color: #94a3b8;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #475569;
  color: #f8fafc;
}

.loading-cell, .empty-cell {
  text-align: center;
  padding: 3rem;
  color: #64748b;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #334155;
  border-top-color: #006e5b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.pagination button {
  background: #334155;
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  color: #f8fafc;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination button:hover:not(:disabled) {
  background: #475569;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #1e293b;
  border-radius: 1rem;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-lg {
  max-width: 700px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  border-bottom: 1px solid #334155;
}

.modal-header h2 {
  color: #f8fafc;
  font-size: 1.25rem;
}

.close-btn {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.5rem;
  cursor: pointer;
}

.close-btn:hover {
  color: #f8fafc;
}

.modal-body {
  padding: 1.25rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  color: #94a3b8;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 0.5rem;
  padding: 0.75rem;
  color: #f8fafc;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.25rem;
  border-top: 1px solid #334155;
}

.btn {
  padding: 0.625rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: #006e5b;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #005a4a;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #334155;
  color: #f8fafc;
}

.btn-secondary:hover {
  background: #475569;
}

.detail-grid {
  display: grid;
  gap: 1.5rem;
}

.detail-section h3 {
  color: #f8fafc;
  font-size: 1rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #334155;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
}

.detail-label {
  color: #94a3b8;
}

.detail-value {
  color: #f8fafc;
}
</style>
