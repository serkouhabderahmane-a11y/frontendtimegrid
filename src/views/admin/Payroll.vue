<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Payroll Management</h1>
    </div>

    <div v-if="error" class="error-banner">
      {{ error }}
      <button @click="error = null; loadPayPeriods()" class="retry-btn">Retry</button>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Current Period</div>
        <div class="stat-value">{{ currentPeriodName }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Unpaid Hours</div>
        <div class="stat-value warning">{{ unpaidHours.toFixed(1) }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Paid Hours</div>
        <div class="stat-value success">{{ paidHours.toFixed(1) }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Pending Export</div>
        <div class="stat-value">{{ pendingExportCount }}</div>
      </div>
    </div>

    <div class="section">
      <h2>Pay Periods (Auto-generated Bi-Weekly)</h2>
      <p class="section-hint">Pay periods are automatically created every 2 weeks. Click on a period to review timesheets and calculate payroll.</p>
      <table class="data-table">
        <thead>
          <tr>
            <th>Period</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
            <th>Total Hours</th>
            <th>Paid Hours</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="period in payPeriods" :key="period.id" :class="{ active: selectedPeriod?.id === period.id }">
            <td>{{ period.name }}</td>
            <td>{{ formatDate(period.startDate) }}</td>
            <td>{{ formatDate(period.endDate) }}</td>
            <td>
              <span :class="['status-badge', period.status]">{{ period.status }}</span>
            </td>
            <td>{{ getPeriodTotalHours(period) }}</td>
            <td>
              <span :class="period.status === 'exported' ? 'paid-badge' : 'unpaid-badge'">
                {{ period.status === 'exported' ? getPeriodTotalHours(period) : '0' }}
              </span>
            </td>
            <td class="actions">
              <button @click="viewPeriod(period)" class="btn-sm" :class="selectedPeriod?.id === period.id ? 'btn-info' : 'btn-primary'">
                {{ selectedPeriod?.id === period.id ? 'Viewing' : 'View Timesheets' }}
              </button>
              <button 
                v-if="period.status === 'locked'" 
                @click="calculatePayroll(period)" 
                class="btn-sm btn-success"
              >
                Calculate
              </button>
              <button 
                v-if="period.status === 'calculated'" 
                @click="openExport(period)" 
                class="btn-sm btn-primary"
              >
                Export & Pay
              </button>
              <span v-if="period.status === 'exported'" class="paid-badge">✓ Paid</span>
            </td>
          </tr>
          <tr v-if="payPeriods.length === 0">
            <td colspan="7" class="empty-state">No pay periods found. They will be auto-generated.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Timesheets Section -->
    <div class="section" v-if="selectedPeriod">
      <div class="section-header">
        <h2>Timesheets - {{ selectedPeriod.name }}</h2>
        <div class="section-actions">
          <button 
            v-if="selectedPeriod.status === 'locked'" 
            @click="calculatePayroll(selectedPeriod)" 
            class="btn-success"
          >
            Calculate Payroll
          </button>
        </div>
      </div>
      
      <table class="data-table timesheet-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Date</th>
            <th>Clock In</th>
            <th>Clock Out</th>
            <th>Break (min)</th>
            <th>Regular Hours</th>
            <th>OT Hours</th>
            <th>Total Hours</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in timesheets" :key="entry.id" :class="{ editing: editingEntryId === entry.id }">
            <td>{{ entry.employee?.user?.firstName }} {{ entry.employee?.user?.lastName }}</td>
            <td>{{ formatDate(entry.clockIn) }}</td>
            <td>{{ formatTime(entry.clockIn) }}</td>
            <td>{{ formatTime(entry.clockOut) }}</td>
            <td>
              <input 
                v-if="editingEntryId === entry.id && selectedPeriod.status === 'open'" 
                type="number" 
                v-model.number="editingEntry.breakMinutes" 
                class="edit-input"
                min="0"
              />
              <span v-else>{{ entry.breakMinutes || 0 }}</span>
            </td>
            <td>
              <input 
                v-if="editingEntryId === entry.id && selectedPeriod.status === 'open'" 
                type="number" 
                v-model.number="editingEntry.regularMinutes" 
                class="edit-input"
                min="0"
                step="15"
              />
              <span v-else class="hours-display">{{ ((entry.regularMinutes || 0) / 60).toFixed(2) }}</span>
            </td>
            <td>
              <input 
                v-if="editingEntryId === entry.id && selectedPeriod.status === 'open'" 
                type="number" 
                v-model.number="editingEntry.overtimeMinutes" 
                class="edit-input"
                min="0"
                step="15"
              />
              <span v-else class="ot-hours">{{ ((entry.overtimeMinutes || 0) / 60).toFixed(2) }}</span>
            </td>
            <td class="hours-display">{{ ((entry.totalMinutes || 0) / 60).toFixed(2) }} hrs</td>
            <td>
              <span :class="['status-badge', entry.status]">{{ entry.status }}</span>
            </td>
            <td class="actions">
              <template v-if="selectedPeriod.status === 'open'">
                <button 
                  v-if="editingEntryId !== entry.id" 
                  @click="startEdit(entry)" 
                  class="btn-sm btn-info"
                >
                  Edit
                </button>
                <template v-else>
                  <button @click="saveEdit(entry)" class="btn-sm btn-success">Save</button>
                  <button @click="cancelEdit" class="btn-sm btn-secondary">Cancel</button>
                </template>
                <button 
                  v-if="entry.status === 'submitted' && !editingEntryId" 
                  @click="approveTimesheet(entry, true)" 
                  class="btn-sm btn-success"
                >
                  Approve
                </button>
                <button 
                  v-if="entry.status === 'submitted' && !editingEntryId" 
                  @click="showReject(entry)" 
                  class="btn-sm btn-danger"
                >
                  Reject
                </button>
              </template>
            </td>
          </tr>
          <tr v-if="timesheets.length === 0">
            <td colspan="10" class="empty-state">No timesheets found for this period.</td>
          </tr>
        </tbody>
      </table>

      <div v-if="timesheets.length > 0" class="summary-section">
        <div class="summary-card">
          <div class="summary-title">Period Summary</div>
          <div class="summary-row">
            <span>Total Entries:</span>
            <span>{{ timesheets.length }}</span>
          </div>
          <div class="summary-row">
            <span>Regular Hours:</span>
            <span>{{ totalRegularHours.toFixed(2) }} hrs</span>
          </div>
          <div class="summary-row">
            <span>Overtime Hours:</span>
            <span>{{ totalOvertimeHours.toFixed(2) }} hrs</span>
          </div>
          <div class="summary-row total">
            <span>Total Hours:</span>
            <span>{{ totalHours.toFixed(2) }} hrs</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Calculated Payroll Section -->
    <div class="section" v-if="payrollRecords.length > 0">
      <div class="section-header">
        <h2>Payroll - {{ selectedPeriod?.name }}</h2>
        <button @click="openExport(selectedPeriod)" class="btn-primary">Export & Mark as Paid</button>
      </div>
      
      <table class="data-table payroll-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Regular Hrs</th>
            <th>OT Hrs</th>
            <th>Hourly Rate</th>
            <th>OT Rate</th>
            <th>Regular Pay</th>
            <th>OT Pay</th>
            <th>Gross Pay</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in payrollRecords" :key="record.employeeId">
            <td>{{ record.employeeName }}</td>
            <td>{{ ((record.totalHours - (record.overtimeHours || 0))).toFixed(2) }}</td>
            <td>{{ record.overtimeHours?.toFixed(2) }}</td>
            <td>${{ record.payRate?.toFixed(2) }}</td>
            <td>${{ record.overtimeRate?.toFixed(2) }}</td>
            <td>${{ record.regularPay?.toFixed(2) }}</td>
            <td>${{ record.overtimePay?.toFixed(2) }}</td>
            <td class="gross-pay">${{ record.grossPay?.toFixed(2) }}</td>
          </tr>
          <tr class="total-row">
            <td colspan="7"><strong>Total Gross Pay</strong></td>
            <td class="gross-pay"><strong>${{ totalGrossPay.toFixed(2) }}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Reject Modal -->
    <div v-if="showRejectModal" class="modal-overlay" @click.self="showRejectModal = false">
      <div class="modal">
        <h3>Reject Timesheet</h3>
        <form @submit.prevent="rejectTimesheet">
          <div class="form-group">
            <label>Rejection Reason *</label>
            <textarea v-model="rejectReason" required rows="4" placeholder="Enter reason for rejection"></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" @click="showRejectModal = false" class="btn-secondary">Cancel</button>
            <button type="submit" class="btn-danger">Reject</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Export Modal -->
    <div v-if="showExportModal" class="modal-overlay" @click.self="showExportModal = false">
      <div class="modal">
        <h3>Export Payroll</h3>
        <form @submit.prevent="exportPayroll">
          <div class="form-group">
            <label>Provider</label>
            <select v-model="exportData.provider" required>
              <option value="">Select provider...</option>
              <option value="ADP">ADP</option>
              <option value="Paychex">Paychex</option>
              <option value="Gusto">Gusto</option>
              <option value="Custom">Custom Export</option>
            </select>
          </div>
          <div class="form-group">
            <label>Format</label>
            <select v-model="exportData.format" required>
              <option value="csv">CSV</option>
              <option value="excel">Excel</option>
              <option value="api">API Payload</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" @click="showExportModal = false" class="btn-secondary">Cancel</button>
            <button type="submit" class="btn-primary">Export</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../../api/axios'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const isDemoMode = computed(() => authStore.isDemo)

const payPeriods = ref([])
const selectedPeriod = ref(null)
const timesheets = ref([])
const payrollRecords = ref([])
const showRejectModal = ref(false)
const showExportModal = ref(false)
const rejectReason = ref('')
const currentTimesheet = ref(null)
const editingEntryId = ref(null)
const editingEntry = ref({})
const error = ref(null)

const exportData = ref({
  provider: '',
  format: 'csv'
})

const currentPeriodName = computed(() => {
  const open = payPeriods.value.find(p => p.status === 'open')
  if (open) return open.name
  const locked = payPeriods.value.find(p => p.status === 'locked')
  if (locked) return locked.name
  return 'None'
})

const unpaidHours = computed(() => {
  return timesheets.value.reduce((sum, t) => sum + (t.totalMinutes || 0), 0) / 60
})

const paidHours = computed(() => {
  return payPeriods.value
    .filter(p => p.status === 'exported')
    .reduce((sum, p) => sum + (getPeriodTotalHours(p) || 0), 0)
})

const pendingExportCount = computed(() => {
  return payPeriods.value.filter(p => p.status === 'calculated').length
})

const totalHours = computed(() => {
  return timesheets.value.reduce((sum, t) => sum + (t.totalMinutes || 0), 0) / 60
})

const totalRegularHours = computed(() => {
  return timesheets.value.reduce((sum, t) => sum + (t.regularMinutes || 0), 0) / 60
})

const totalOvertimeHours = computed(() => {
  return timesheets.value.reduce((sum, t) => sum + (t.overtimeMinutes || 0), 0) / 60
})

const totalGrossPay = computed(() => {
  return payrollRecords.value.reduce((sum, r) => sum + (r.grossPay || 0), 0)
})

onMounted(async () => {
  await loadPayPeriods()
})

const loadPayPeriods = async () => {
  error.value = null
  try {
    const res = await api.get('/payroll/pay-periods')
    payPeriods.value = res.data
    if (!res.data || res.data.length === 0) {
      error.value = 'No pay periods yet. They will be auto-generated bi-weekly.'
    }
  } catch (err) {
    console.error('[Payroll] Failed to load pay periods:', err)
    error.value = err.message || 'Failed to load pay periods'
  }
}

const getPeriodTotalHours = (period) => {
  return period.totalHours || 0
}

const viewPeriod = async (period) => {
  selectedPeriod.value = period
  payrollRecords.value = []
  editingEntryId.value = null
  try {
    const res = await api.get(`/payroll/pay-periods/${period.id}`)
    timesheets.value = res.data.timeEntries || []
    
    if (period.status === 'calculated' || period.status === 'exported') {
      const recordsRes = await api.get(`/payroll/pay-periods/${period.id}/calculate`)
      payrollRecords.value = recordsRes.data.records || []
    }
  } catch (err) {
    console.error('Failed to load timesheets:', err)
    timesheets.value = []
  }
}

const startEdit = (entry) => {
  editingEntryId.value = entry.id
  editingEntry.value = {
    regularMinutes: entry.regularMinutes || entry.totalMinutes,
    overtimeMinutes: entry.overtimeMinutes || 0,
    breakMinutes: entry.breakMinutes || 0
  }
}

const cancelEdit = () => {
  editingEntryId.value = null
  editingEntry.value = {}
}

const saveEdit = async (entry) => {
  try {
    await api.post(`/payroll/timesheets/${entry.id}/adjust`, {
      regularMinutes: editingEntry.value.regularMinutes,
      overtimeMinutes: editingEntry.value.overtimeMinutes,
      breakMinutes: editingEntry.value.breakMinutes
    })
    entry.regularMinutes = editingEntry.value.regularMinutes
    entry.overtimeMinutes = editingEntry.value.overtimeMinutes
    entry.breakMinutes = editingEntry.value.breakMinutes
    entry.totalMinutes = (editingEntry.value.regularMinutes || 0) + (editingEntry.value.overtimeMinutes || 0)
    editingEntryId.value = null
    editingEntry.value = {}
    alert('Hours updated successfully')
  } catch (err) {
    alert('Failed to update hours')
  }
}

const calculatePayroll = async (period) => {
  try {
    const res = await api.post(`/payroll/pay-periods/${period.id}/calculate`)
    payrollRecords.value = res.data.records || []
    await loadPayPeriods()
    await viewPeriod(period)
    alert('Payroll calculated successfully')
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to calculate payroll')
  }
}

const approveTimesheet = async (entry, approved) => {
  try {
    await api.post(`/payroll/timesheets/${entry.id}/approve`, { approved, rejectionReason: null })
    await viewPeriod(selectedPeriod.value)
  } catch (err) {
    alert('Failed to approve timesheet')
  }
}

const showReject = (entry) => {
  currentTimesheet.value = entry
  showRejectModal.value = true
}

const rejectTimesheet = async () => {
  try {
    await api.post(`/payroll/timesheets/${currentTimesheet.value.id}/approve`, { 
      approved: false, 
      rejectionReason: rejectReason.value 
    })
    showRejectModal.value = false
    rejectReason.value = ''
    await viewPeriod(selectedPeriod.value)
  } catch (err) {
    alert('Failed to reject timesheet')
  }
}

const openExport = (period) => {
  selectedPeriod.value = period
  showExportModal.value = true
}

const exportPayroll = async () => {
  // Demo mode check - show warning instead of real export
  if (isDemoMode.value) {
    showExportModal.value = false
    alert('Demo Mode: Payroll export is simulated. In production, this would send data to ADP or another payroll provider. No real data is affected.')
    return
  }
  
  try {
    const res = await api.post(`/payroll/pay-periods/${selectedPeriod.value.id}/export`, exportData.value)
    alert(`Payroll exported to ${exportData.value.provider} successfully! Hours marked as paid.`)
    showExportModal.value = false
    await loadPayPeriods()
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to export payroll')
  }
}

const formatDate = (date) => new Date(date).toLocaleDateString()
const formatTime = (date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
</script>

<style scoped>
.page-container { padding: 2rem; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.page-header h1 { margin: 0; }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem; }
.stat-card { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.stat-label { color: #666; font-size: 0.875rem; }
.stat-value { font-size: 1.5rem; font-weight: bold; color: #2c5282; }
.stat-value.warning { color: #d69e2e; }
.stat-value.success { color: #38a169; }
.section { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1.5rem; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.section-header h2 { margin: 0; }
.section-hint { color: #718096; margin-bottom: 1rem; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #ddd; color: #1a202c; }
.data-table th { font-weight: 600; background: #f7fafc; color: #2d3748; }
.timesheet-table tr.editing { background: #fefcbf; }
.timesheet-table tr.active { background: #ebf8ff; }
.hours-display { font-weight: 600; color: #2c5282; }
.ot-hours { color: #d69e2e; font-weight: 600; }
.edit-input { width: 60px; padding: 0.25rem; border: 1px solid #ccc; border-radius: 4px; }
.status-badge { padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
.status-badge.open { background: #e2e8f0; color: #4a5568; }
.status-badge.locked { background: #fed7aa; color: #c05621; }
.status-badge.calculated { background: #c6f6d5; color: #276749; }
.status-badge.exported { background: #bee3f8; color: #2b6cb0; }
.status-badge.submitted { background: #fef3c7; color: #b45309; }
.status-badge.approved { background: #c6f6d5; color: #276749; }
.status-badge.rejected { background: #fed7d7; color: #c53030; }
.paid-badge { color: #38a169; font-weight: 600; }
.unpaid-badge { color: #d69e2e; }
.actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.btn-primary { background: #2c5282; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
.btn-secondary { background: #e2e8f0; color: #4a5568; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
.btn-success { background: #38a169; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
.btn-warning { background: #d69e2e; color: white; border: none; padding: 0.25rem 0.75rem; border-radius: 4px; cursor: pointer; }
.btn-danger { background: #e53e3e; color: white; border: none; padding: 0.25rem 0.75rem; border-radius: 4px; cursor: pointer; }
.btn-info { background: #3182ce; color: white; border: none; padding: 0.25rem 0.75rem; border-radius: 4px; cursor: pointer; }
.btn-sm { padding: 0.25rem 0.75rem; font-size: 0.875rem; }
.empty-state { text-align: center; padding: 2rem; color: #718096; }
.summary-section { margin-top: 1.5rem; }
.summary-card { background: #f7fafc; padding: 1rem; border-radius: 8px; max-width: 300px; }
.summary-title { font-weight: 600; margin-bottom: 0.5rem; color: #2d3748; }
.summary-row { display: flex; justify-content: space-between; padding: 0.25rem 0; color: #4a5568; }
.summary-row.total { border-top: 2px solid #cbd5e0; margin-top: 0.5rem; padding-top: 0.5rem; font-weight: 600; color: #2c5282; }
.payroll-table .gross-pay { font-weight: 600; color: #2c5282; }
.payroll-table .total-row { background: #f7fafc; }
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: white; padding: 2rem; border-radius: 8px; width: 400px; max-width: 90%; }
.modal h3 { margin-top: 0; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
.form-group input, .form-group select, .form-group textarea { width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1.5rem; }
.error-banner { background: #fed7d7; color: #c53030; padding: 1rem; border-radius: 4px; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; }
.retry-btn { background: #c53030; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
</style>
