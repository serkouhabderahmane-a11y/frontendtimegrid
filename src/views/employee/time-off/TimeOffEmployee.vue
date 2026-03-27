<template>
  <div class="time-off-management">
    <header class="page-header">
      <div>
        <h1>Time Off Requests</h1>
        <p>Request and manage your time off</p>
      </div>
      <button @click="showRequestModal = true" class="btn btn-primary">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
        </svg>
        New Request
      </button>
    </header>

    <div class="balances-section">
      <h2>Your Balances</h2>
      <div class="balances-grid">
        <div v-for="balance in balances" :key="balance.id" class="balance-card">
          <div class="balance-type">{{ formatType(balance.type) }}</div>
          <div class="balance-values">
            <div class="balance-main">
              <span class="available">{{ (balance.totalDays + balance.carryOverDays - balance.usedDays - balance.pendingDays).toFixed(1) }}</span>
              <span class="label">days available</span>
            </div>
            <div class="balance-details">
              <span>Total: {{ balance.totalDays }}</span>
              <span>Used: {{ balance.usedDays }}</span>
              <span>Pending: {{ balance.pendingDays }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="requests-section">
      <div class="section-header">
        <h2>Your Requests</h2>
        <div class="filters">
          <select v-model="filters.status" @change="fetchRequests">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="canceled">Canceled</option>
          </select>
        </div>
      </div>

      <div class="requests-list" v-if="requests.length > 0">
        <div v-for="request in requests" :key="request.id" class="request-card" :class="request.status">
          <div class="request-header">
            <span class="request-type">{{ formatType(request.type) }}</span>
            <span class="request-status" :class="request.status">{{ request.status }}</span>
          </div>
          <div class="request-dates">
            <span class="date-range">{{ formatDate(request.startDate) }} - {{ formatDate(request.endDate) }}</span>
            <span class="days-count">{{ request.totalDays }} day(s)</span>
          </div>
          <div class="request-reason" v-if="request.reason">{{ request.reason }}</div>
          <div class="request-meta">
            <span>Submitted: {{ formatDateTime(request.createdAt) }}</span>
            <span v-if="request.reviewedAt">Reviewed: {{ formatDateTime(request.reviewedAt) }}</span>
          </div>
          <div class="request-comment" v-if="request.reviewComment">
            <strong>Admin Comment:</strong> {{ request.reviewComment }}
          </div>
          <div class="request-actions" v-if="request.status === 'pending'">
            <button @click="cancelRequest(request)" class="btn btn-sm btn-danger">Cancel Request</button>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <p>No time off requests found</p>
      </div>
    </div>

    <div v-if="showRequestModal" class="modal-overlay" @click.self="closeRequestModal">
      <div class="modal">
        <div class="modal-header">
          <h2>New Time Off Request</h2>
          <button @click="closeRequestModal" class="close-btn">&times;</button>
        </div>
        <form @submit.prevent="submitRequest" class="modal-body">
          <div class="form-group">
            <label>Type *</label>
            <select v-model="newRequest.type" required>
              <option value="">Select type...</option>
              <option value="annual">Annual Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="unpaid">Unpaid Leave</option>
              <option value="parental">Parental Leave</option>
              <option value="bereavement">Bereavement</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Start Date *</label>
              <input type="date" v-model="newRequest.startDate" required :min="minDate" />
            </div>
            <div class="form-group">
              <label>End Date *</label>
              <input type="date" v-model="newRequest.endDate" required :min="newRequest.startDate || minDate" />
            </div>
          </div>
          <div class="form-group">
            <label>Days</label>
            <input type="text" :value="calculateDays" readonly class="readonly" />
          </div>
          <div class="form-group">
            <label>Reason</label>
            <textarea v-model="newRequest.reason" placeholder="Optional reason for your request..."></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" @click="closeRequestModal" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary">Submit Request</button>
          </div>
        </form>
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
const balances = ref([])
const requests = ref([])
const filters = ref({ status: '' })
const showRequestModal = ref(false)

const newRequest = ref({ type: '', startDate: '', endDate: '', reason: '' })

const minDate = computed(() => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().slice(0, 10)
})

const calculateDays = computed(() => {
  if (!newRequest.value.startDate || !newRequest.value.endDate) return '0'
  const start = new Date(newRequest.value.startDate)
  const end = new Date(newRequest.value.endDate)
  let count = 0
  const current = new Date(start)
  while (current <= end) {
    const day = current.getDay()
    if (day !== 0 && day !== 6) count++
    current.setDate(current.getDate() + 1)
  }
  return `${count} business day(s)`
})

const formatType = (type) => {
  const types = { annual: 'Annual', sick: 'Sick', unpaid: 'Unpaid', parental: 'Parental', bereavement: 'Bereavement', other: 'Other' }
  return types[type] || type
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const fetchBalances = async () => {
  try {
    const response = await api.get('/api/time-off/balances/my')
    balances.value = response.data
  } catch (err) {
    console.error('Failed to fetch balances:', err)
  }
}

const fetchRequests = async () => {
  try {
    const params = { ...filters.value }
    const response = await api.get('/api/time-off/requests/my', { params })
    requests.value = response.data
  } catch (err) {
    console.error('Failed to fetch requests:', err)
  }
}

const closeRequestModal = () => {
  showRequestModal.value = false
  newRequest.value = { type: '', startDate: '', endDate: '', reason: '' }
}

const submitRequest = async () => {
  try {
    await api.post('/api/time-off/requests', newRequest.value)
    closeRequestModal()
    fetchRequests()
    fetchBalances()
  } catch (err) {
    console.error('Failed to submit request:', err)
    alert(err.response?.data?.message || 'Failed to submit request')
  }
}

const cancelRequest = async (request) => {
  if (!confirm('Are you sure you want to cancel this request?')) return
  try {
    await api.post(`/api/time-off/requests/${request.id}/cancel`, {})
    fetchRequests()
    fetchBalances()
  } catch (err) {
    console.error('Failed to cancel request:', err)
    alert(err.response?.data?.message || 'Failed to cancel request')
  }
}

onMounted(() => {
  fetchBalances()
  fetchRequests()
})
</script>

<style scoped>
.time-off-management { padding: 2rem; max-width: 900px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
.page-header h1 { font-size: 1.75rem; font-weight: 700; color: #f8fafc; margin-bottom: 0.25rem; }
.page-header p { color: #94a3b8; }
.balances-section { margin-bottom: 2rem; }
.balances-section h2, .requests-section h2 { font-size: 1.125rem; color: #f8fafc; margin-bottom: 1rem; }
.balances-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
.balance-card { background: #1e293b; border: 1px solid #334155; border-radius: 0.75rem; padding: 1.25rem; }
.balance-type { color: #94a3b8; font-size: 0.875rem; text-transform: uppercase; margin-bottom: 0.5rem; }
.balance-main { display: flex; align-items: baseline; gap: 0.5rem; margin-bottom: 0.5rem; }
.balance-main .available { font-size: 2rem; font-weight: 700; color: #f8fafc; }
.balance-main .label { color: #64748b; font-size: 0.875rem; }
.balance-details { display: flex; gap: 1rem; font-size: 0.75rem; color: #64748b; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.filters select { background: #1e293b; border: 1px solid #334155; border-radius: 0.5rem; padding: 0.5rem 1rem; color: #f8fafc; }
.requests-list { display: flex; flex-direction: column; gap: 1rem; }
.request-card { background: #1e293b; border: 1px solid #334155; border-radius: 0.75rem; padding: 1.25rem; }
.request-card.pending { border-left: 3px solid #f59e0b; }
.request-card.approved { border-left: 3px solid #22c55e; }
.request-card.rejected { border-left: 3px solid #ef4444; }
.request-card.canceled { opacity: 0.6; }
.request-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
.request-type { color: #f8fafc; font-weight: 600; }
.request-status { font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 0.25rem; text-transform: capitalize; }
.request-status.pending { background: rgba(245,158,11,0.2); color: #f59e0b; }
.request-status.approved { background: rgba(34,197,94,0.2); color: #22c55e; }
.request-status.rejected { background: rgba(239,68,68,0.2); color: #ef4444; }
.request-status.canceled { background: #334155; color: #94a3b8; }
.request-dates { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
.date-range { color: #f8fafc; }
.days-count { color: #42b883; font-weight: 600; }
.request-reason { color: #94a3b8; font-size: 0.875rem; margin-bottom: 0.75rem; padding: 0.5rem; background: #0f172a; border-radius: 0.25rem; }
.request-meta { font-size: 0.75rem; color: #64748b; display: flex; gap: 1rem; margin-bottom: 0.5rem; }
.request-comment { font-size: 0.875rem; color: #94a3b8; padding: 0.5rem; background: #0f172a; border-radius: 0.25rem; margin-bottom: 0.75rem; }
.request-actions { display: flex; gap: 0.5rem; }
.empty-state { text-align: center; padding: 3rem; color: #64748b; }
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: #1e293b; border-radius: 1rem; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem; border-bottom: 1px solid #334155; }
.modal-header h2 { color: #f8fafc; font-size: 1.25rem; }
.close-btn { background: none; border: none; color: #94a3b8; font-size: 1.5rem; cursor: pointer; }
.modal-body { padding: 1.25rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; color: #94a3b8; font-size: 0.875rem; margin-bottom: 0.5rem; }
.form-group input, .form-group select, .form-group textarea { width: 100%; background: #0f172a; border: 1px solid #334155; border-radius: 0.5rem; padding: 0.75rem; color: #f8fafc; }
.form-group input.readonly { background: #1e293b; }
.form-group textarea { min-height: 80px; resize: vertical; }
.modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1.25rem; border-top: 1px solid #334155; }
.btn { padding: 0.625rem 1rem; border-radius: 0.5rem; font-weight: 600; font-size: 0.875rem; cursor: pointer; transition: all 0.2s; border: none; }
.btn-sm { padding: 0.375rem 0.75rem; font-size: 0.75rem; }
.btn-primary { background: #42b883; color: white; }
.btn-primary:hover { background: #359268; }
.btn-secondary { background: #334155; color: #f8fafc; }
.btn-secondary:hover { background: #475569; }
.btn-danger { background: rgba(239,68,68,0.2); color: #ef4444; }
.btn-danger:hover { background: rgba(239,68,68,0.3); }
</style>
