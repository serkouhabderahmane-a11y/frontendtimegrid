<template>
  <div class="admin-time-off">
    <header class="page-header">
      <div>
        <h1>Time Off Management</h1>
        <p>Review and manage time off requests</p>
      </div>
      <button @click="showCalendar = !showCalendar" class="btn btn-secondary">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        {{ showCalendar ? 'List View' : 'Calendar' }}
      </button>
    </header>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon orange"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
        <div class="stat-content"><span class="stat-value">{{ stats.pending || 0 }}</span><span class="stat-label">Pending</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
        <div class="stat-content"><span class="stat-value">{{ stats.approved || 0 }}</span><span class="stat-label">Approved</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon red"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
        <div class="stat-content"><span class="stat-value">{{ stats.rejected || 0 }}</span><span class="stat-label">Rejected</span></div>
      </div>
    </div>

    <div class="filters-section">
      <div class="filter-group">
        <label>Date Range</label>
        <div class="date-inputs">
          <input type="date" v-model="filters.startDate" @change="fetchRequests" />
          <span>to</span>
          <input type="date" v-model="filters.endDate" @change="fetchRequests" />
        </div>
      </div>
      <div class="filter-group">
        <label>Employee</label>
        <select v-model="filters.employeeId" @change="fetchRequests">
          <option value="">All Employees</option>
          <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ emp.user.firstName }} {{ emp.user.lastName }}</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Type</label>
        <select v-model="filters.type" @change="fetchRequests">
          <option value="">All Types</option>
          <option value="annual">Annual</option>
          <option value="sick">Sick</option>
          <option value="unpaid">Unpaid</option>
          <option value="parental">Parental</option>
          <option value="bereavement">Bereavement</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Status</label>
        <select v-model="filters.status" @change="fetchRequests">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="canceled">Canceled</option>
        </select>
      </div>
    </div>

    <div class="requests-table-container">
      <table class="requests-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Type</th>
            <th>Dates</th>
            <th>Days</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading"><td colspan="6" class="loading-cell"><div class="spinner"></div>Loading...</td></tr>
          <tr v-else-if="requests.length === 0"><td colspan="6" class="empty-cell">No requests found</td></tr>
          <tr v-for="request in requests" :key="request.id">
            <td>
              <div class="employee-cell">
                <div class="employee-avatar">{{ request.employee?.user?.firstName?.[0] }}{{ request.employee?.user?.lastName?.[0] }}</div>
                <div class="employee-info">
                  <span class="employee-name">{{ request.employee?.user?.firstName }} {{ request.employee?.user?.lastName }}</span>
                  <span class="employee-dept">{{ request.employee?.department?.name || 'N/A' }}</span>
                </div>
              </div>
            </td>
            <td><span class="type-badge">{{ formatType(request.type) }}</span></td>
            <td>{{ formatDate(request.startDate) }} - {{ formatDate(request.endDate) }}</td>
            <td>{{ request.totalDays }}</td>
            <td><span class="status-badge" :class="request.status">{{ request.status }}</span></td>
            <td>
              <div class="action-buttons" v-if="request.status === 'pending'">
                <button @click="openReviewModal(request, 'approved')" class="btn-icon success" title="Approve">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                </button>
                <button @click="openReviewModal(request, 'rejected')" class="btn-icon danger" title="Reject">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
              <span v-else class="no-actions">-</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="pagination.totalPages > 1" class="pagination">
      <button @click="changePage(pagination.page - 1)" :disabled="pagination.page === 1">Previous</button>
      <span>Page {{ pagination.page }} of {{ pagination.totalPages }}</span>
      <button @click="changePage(pagination.page + 1)" :disabled="pagination.page === pagination.totalPages">Next</button>
    </div>

    <div v-if="showReviewModal" class="modal-overlay" @click.self="closeReviewModal">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ reviewAction === 'approved' ? 'Approve' : 'Reject' }} Request</h2>
          <button @click="closeReviewModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <p class="review-info">Employee: <strong>{{ selectedRequest?.employee?.user?.firstName }} {{ selectedRequest?.employee?.user?.lastName }}</strong></p>
          <p class="review-info">Type: {{ formatType(selectedRequest?.type) }} | Days: {{ selectedRequest?.totalDays }}</p>
          <p class="review-info">Dates: {{ formatDate(selectedRequest?.startDate) }} - {{ formatDate(selectedRequest?.endDate) }}</p>
          <div class="form-group">
            <label>Comment</label>
            <textarea v-model="reviewComment" placeholder="Optional comment..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeReviewModal" class="btn btn-secondary">Cancel</button>
          <button @click="submitReview" class="btn" :class="reviewAction === 'approved' ? 'btn-success' : 'btn-danger'">
            {{ reviewAction === 'approved' ? 'Approve' : 'Reject' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../../api/axios'

const loading = ref(false)
const requests = ref([])
const employees = ref([])
const stats = ref({})
const pagination = ref({ page: 1, limit: 50, totalPages: 0 })
const filters = ref({ startDate: '', endDate: '', employeeId: '', type: '', status: '' })
const showReviewModal = ref(false)
const showCalendar = ref(false)
const selectedRequest = ref(null)
const reviewAction = ref('')
const reviewComment = ref('')

const formatType = (type) => ({ annual: 'Annual', sick: 'Sick', unpaid: 'Unpaid', parental: 'Parental', bereavement: 'Bereavement', other: 'Other' }[type] || type)

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const fetchRequests = async () => {
  loading.value = true
  try {
    const params = { page: pagination.value.page, limit: pagination.value.limit, ...filters.value }
    const response = await api.get('/api/time-off/admin/requests', { params })
    requests.value = response.data.data
    pagination.value.totalPages = response.data.totalPages
  } catch (err) {
    console.error('Failed to fetch requests:', err)
  } finally {
    loading.value = false
  }
}

const fetchStats = async () => {
  try {
    const response = await api.get('/api/time-off/admin/stats')
    stats.value = response.data
  } catch (err) {
    console.error('Failed to fetch stats:', err)
  }
}

const fetchEmployees = async () => {
  try {
    const response = await api.get('/api/time-off/admin/employees')
    employees.value = response.data
  } catch (err) {
    console.error('Failed to fetch employees:', err)
  }
}

const changePage = (page) => {
  pagination.value.page = page
  fetchRequests()
}

const openReviewModal = (request, action) => {
  selectedRequest.value = request
  reviewAction.value = action
  reviewComment.value = ''
  showReviewModal.value = true
}

const closeReviewModal = () => {
  showReviewModal.value = false
  selectedRequest.value = null
}

const submitReview = async () => {
  try {
    await api.patch(`/api/time-off/admin/requests/${selectedRequest.value.id}/review`, {
      status: reviewAction.value,
      comment: reviewComment.value
    })
    closeReviewModal()
    fetchRequests()
    fetchStats()
  } catch (err) {
    console.error('Failed to review request:', err)
    alert(err.response?.data?.message || 'Failed to review request')
  }
}

onMounted(() => {
  fetchRequests()
  fetchStats()
  fetchEmployees()
})
</script>

<style scoped>
.admin-time-off { padding: 2rem; max-width: 1400px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
.page-header h1 { font-size: 1.75rem; font-weight: 700; color: #f8fafc; margin-bottom: 0.25rem; }
.page-header p { color: #94a3b8; }
.stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
.stat-card { background: #1e293b; border: 1px solid #334155; border-radius: 0.75rem; padding: 1.25rem; display: flex; align-items: center; gap: 1rem; }
.stat-icon { width: 48px; height: 48px; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; }
.stat-icon svg { width: 24px; height: 24px; }
.stat-icon.orange { background: rgba(249,115,22,0.1); color: #f97316; }
.stat-icon.green { background: rgba(34,197,94,0.1); color: #22c55e; }
.stat-icon.red { background: rgba(239,68,68,0.1); color: #ef4444; }
.stat-content { display: flex; flex-direction: column; }
.stat-value { font-size: 1.5rem; font-weight: 700; color: #f8fafc; }
.stat-label { color: #94a3b8; font-size: 0.875rem; }
.filters-section { background: #1e293b; border: 1px solid #334155; border-radius: 0.75rem; padding: 1.25rem; margin-bottom: 1.5rem; display: flex; gap: 1rem; flex-wrap: wrap; }
.filter-group { display: flex; flex-direction: column; gap: 0.5rem; }
.filter-group label { color: #94a3b8; font-size: 0.75rem; text-transform: uppercase; }
.filter-group input, .filter-group select { background: #0f172a; border: 1px solid #334155; border-radius: 0.5rem; padding: 0.5rem 0.75rem; color: #f8fafc; min-width: 150px; }
.date-inputs { display: flex; align-items: center; gap: 0.5rem; }
.date-inputs span { color: #64748b; }
.requests-table-container { background: #1e293b; border: 1px solid #334155; border-radius: 0.75rem; overflow: hidden; }
.requests-table { width: 100%; border-collapse: collapse; }
.requests-table th { background: #0f172a; padding: 1rem; text-align: left; color: #94a3b8; font-weight: 600; font-size: 0.75rem; text-transform: uppercase; }
.requests-table td { padding: 1rem; border-top: 1px solid #334155; color: #e2e8f0; }
.employee-cell { display: flex; align-items: center; gap: 0.75rem; }
.employee-avatar { width: 36px; height: 36px; border-radius: 50%; background: #006e5b; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.75rem; font-weight: 600; }
.employee-info { display: flex; flex-direction: column; }
.employee-name { font-weight: 500; }
.employee-dept { font-size: 0.75rem; color: #64748b; }
.type-badge { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; background: #334155; color: #94a3b8; }
.status-badge { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
.status-badge.pending { background: rgba(245,158,11,0.2); color: #f59e0b; }
.status-badge.approved { background: rgba(34,197,94,0.2); color: #22c55e; }
.status-badge.rejected { background: rgba(239,68,68,0.2); color: #ef4444; }
.status-badge.canceled { background: #334155; color: #94a3b8; }
.action-buttons { display: flex; gap: 0.5rem; }
.btn-icon { background: #334155; border: none; border-radius: 0.375rem; padding: 0.5rem; cursor: pointer; color: #94a3b8; transition: all 0.2s; }
.btn-icon:hover { background: #475569; }
.btn-icon.success:hover { color: #22c55e; }
.btn-icon.danger:hover { color: #ef4444; }
.no-actions { color: #64748b; }
.loading-cell, .empty-cell { text-align: center; padding: 3rem; color: #64748b; }
.spinner { width: 32px; height: 32px; border: 3px solid #334155; border-top-color: #006e5b; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
@keyframes spin { to { transform: rotate(360deg); } }
.pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 1.5rem; }
.pagination button { background: #334155; border: none; border-radius: 0.5rem; padding: 0.5rem 1rem; color: #f8fafc; cursor: pointer; }
.pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: #1e293b; border-radius: 1rem; width: 100%; max-width: 500px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem; border-bottom: 1px solid #334155; }
.modal-header h2 { color: #f8fafc; font-size: 1.25rem; }
.close-btn { background: none; border: none; color: #94a3b8; font-size: 1.5rem; cursor: pointer; }
.modal-body { padding: 1.25rem; }
.review-info { color: #94a3b8; margin-bottom: 0.5rem; }
.review-info strong { color: #f8fafc; }
.form-group { margin-top: 1rem; }
.form-group label { display: block; color: #94a3b8; font-size: 0.875rem; margin-bottom: 0.5rem; }
.form-group textarea { width: 100%; background: #0f172a; border: 1px solid #334155; border-radius: 0.5rem; padding: 0.75rem; color: #f8fafc; min-height: 80px; resize: vertical; }
.modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1.25rem; border-top: 1px solid #334155; }
.btn { padding: 0.625rem 1rem; border-radius: 0.5rem; font-weight: 600; font-size: 0.875rem; cursor: pointer; transition: all 0.2s; border: none; }
.btn-secondary { background: #334155; color: #f8fafc; }
.btn-secondary:hover { background: #475569; }
.btn-success { background: #22c55e; color: white; }
.btn-success:hover { background: #16a34a; }
.btn-danger { background: #ef4444; color: white; }
.btn-danger:hover { background: #dc2626; }
</style>
