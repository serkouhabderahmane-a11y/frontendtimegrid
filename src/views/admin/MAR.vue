<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Medication Administration Records (MAR)</h1>
      <button @click="showExportModal = true" class="btn-primary">Export MAR</button>
    </div>

    <div v-if="error" class="error-banner">
      {{ error }}
      <button @click="error = null; loadRecords()" class="retry-btn">Retry</button>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total Records</div>
        <div class="stat-value">{{ records.length }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Given</div>
        <div class="stat-value given">{{ records.filter(r => r.outcome === 'given').length }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Missed</div>
        <div class="stat-value missed">{{ records.filter(r => r.outcome === 'missed').length }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Refused</div>
        <div class="stat-value refused">{{ records.filter(r => r.outcome === 'refused').length }}</div>
      </div>
    </div>

    <div class="filters">
      <select v-model="filterOutcome" @change="loadRecords">
        <option value="">All Outcomes</option>
        <option value="scheduled">Scheduled</option>
        <option value="given">Given</option>
        <option value="missed">Missed</option>
        <option value="refused">Refused</option>
        <option value="locked">Locked</option>
      </select>
      <input v-model="filterEmployee" placeholder="Search by employee name..." @input="loadRecords" />
    </div>

    <div class="section">
      <table class="data-table">
        <thead>
          <tr>
            <th>Scheduled Time</th>
            <th>Employee</th>
            <th>Medication</th>
            <th>Outcome</th>
            <th>Outcome Time</th>
            <th>Reason</th>
            <th>Staff</th>
            <th>Locked</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in records" :key="record.id">
            <td>{{ formatDateTime(record.scheduledTime) }}</td>
            <td>{{ record.employee?.user?.firstName }} {{ record.employee?.user?.lastName }}</td>
            <td>{{ record.medicationName }}</td>
            <td>
              <span :class="['status-badge', record.outcome]">{{ record.outcome }}</span>
            </td>
            <td>{{ record.outcomeTime ? formatDateTime(record.outcomeTime) : '-' }}</td>
            <td>{{ record.reasonNotGiven || '-' }}</td>
            <td>{{ record.administeredBy || '-' }}</td>
            <td>{{ record.lockedAt ? 'Yes' : 'No' }}</td>
            <td class="actions">
              <button @click="viewRecord(record)" class="btn-sm">View</button>
              <button 
                v-if="record.outcome !== 'locked'" 
                @click="lockRecord(record)" 
                class="btn-sm btn-warning"
              >
                Lock
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="records.length === 0" class="empty-state">No MAR records found</div>
    </div>

    <!-- View Record Modal -->
    <div v-if="showViewModal" class="modal-overlay" @click.self="showViewModal = false">
      <div class="modal modal-lg">
        <h3>MAR Entry Details</h3>
        <div class="record-details">
          <div class="detail-row">
            <strong>Employee:</strong> {{ selectedRecord?.employee?.user?.firstName }} {{ selectedRecord?.employee?.user?.lastName }}
          </div>
          <div class="detail-row">
            <strong>Medication:</strong> {{ selectedRecord?.medicationName }}
          </div>
          <div class="detail-row">
            <strong>Scheduled Time:</strong> {{ formatDateTime(selectedRecord?.scheduledTime) }}
          </div>
          <div class="detail-row">
            <strong>Outcome:</strong> <span :class="['status-badge', selectedRecord?.outcome]">{{ selectedRecord?.outcome }}</span>
          </div>
          <div class="detail-row" v-if="selectedRecord?.outcomeTime">
            <strong>Outcome Time:</strong> {{ formatDateTime(selectedRecord.outcomeTime) }}
          </div>
          <div class="detail-row" v-if="selectedRecord?.reasonNotGiven">
            <strong>Reason if not given:</strong> {{ selectedRecord.reasonNotGiven }}
          </div>
          <div class="detail-row" v-if="selectedRecord?.administeredBy">
            <strong>Administered By:</strong> {{ selectedRecord.administeredBy }}
          </div>
          <div class="detail-row">
            <strong>Created:</strong> {{ formatDateTime(selectedRecord?.createdAt) }}
          </div>
          <div class="detail-row" v-if="selectedRecord?.lockedAt">
            <strong>Locked:</strong> {{ formatDateTime(selectedRecord.lockedAt) }} by {{ selectedRecord.lockedBy }}
          </div>
        </div>
        <div class="modal-actions">
          <button @click="showViewModal = false" class="btn-secondary">Close</button>
        </div>
      </div>
    </div>

    <!-- Export Modal -->
    <div v-if="showExportModal" class="modal-overlay" @click.self="showExportModal = false">
      <div class="modal">
        <h3>Export MAR Records</h3>
        <form @submit.prevent="exportRecords">
          <div class="form-group">
            <label>Start Date</label>
            <input v-model="exportData.startDate" type="date" required />
          </div>
          <div class="form-group">
            <label>End Date</label>
            <input v-model="exportData.endDate" type="date" required />
          </div>
          <div class="form-group">
            <label>Employee (Optional)</label>
            <input v-model="exportData.employeeId" placeholder="Employee ID" />
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
import { ref, onMounted } from 'vue'
import api from '../../api/axios'

const records = ref([])
const filterOutcome = ref('')
const filterEmployee = ref('')
const showViewModal = ref(false)
const showExportModal = ref(false)
const selectedRecord = ref(null)
const error = ref(null)

const exportData = ref({
  startDate: '',
  endDate: '',
  employeeId: ''
})

onMounted(() => {
  loadRecords()
})

const loadRecords = async () => {
  error.value = null
  try {
    console.log('[MAR] Loading records...')
    const params = new URLSearchParams()
    if (filterOutcome.value) params.append('outcome', filterOutcome.value)
    if (filterEmployee.value) params.append('employeeName', filterEmployee.value)
    const res = await api.get(`/mar?${params}`)
    console.log('[MAR] Got response:', res.data)
    records.value = res.data
    if (!res.data || res.data.length === 0) {
      error.value = 'No MAR records found.'
    }
  } catch (err) {
    console.error('[MAR] Failed to load records:', err)
    error.value = err.message || 'Failed to load MAR records'
  }
}

const viewRecord = (record) => {
  selectedRecord.value = record
  showViewModal.value = true
}

const lockRecord = async (record) => {
  if (!confirm('Are you sure you want to lock this MAR entry? It cannot be edited after.')) return
  try {
    await api.post(`/mar/${record.id}/lock`)
    await loadRecords()
    alert('MAR entry locked successfully')
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to lock MAR entry')
  }
}

const exportRecords = async () => {
  try {
    await api.post('/mar/export', {
      startDate: exportData.value.startDate,
      endDate: exportData.value.endDate,
      employeeId: exportData.value.employeeId || undefined
    })
    alert('MAR records exported successfully')
    showExportModal.value = false
  } catch (err) {
    alert('Failed to export MAR records')
  }
}

const formatDateTime = (date) => date ? new Date(date).toLocaleString() : '-'
</script>

<style scoped>
.page-container { padding: 2rem; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.page-header h1 { margin: 0; }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem; }
.stat-card { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.stat-label { color: #666; font-size: 0.875rem; }
.stat-value { font-size: 2rem; font-weight: bold; color: #2c5282; }
.stat-value.given { color: #38a169; }
.stat-value.missed { color: #d69e2e; }
.stat-value.refused { color: #e53e3e; }
.filters { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
.filters select, .filters input { padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; }
.filters input { flex: 1; max-width: 300px; }
.section { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #ddd; color: #1a202c; }
.data-table th { font-weight: 600; background: #f7fafc; color: #2d3748; font-size: 0.875rem; }
.status-badge { padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
.status-badge.scheduled { background: #e2e8f0; color: #4a5568; }
.status-badge.given { background: #c6f6d5; color: #276749; }
.status-badge.missed { background: #fef3c7; color: #b45309; }
.status-badge.refused { background: #fed7d7; color: #c53030; }
.status-badge.locked { background: #bee3f8; color: #2b6cb0; }
.actions { display: flex; gap: 0.5rem; }
.btn-primary { background: #2c5282; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
.btn-secondary { background: #e2e8f0; color: #4a5568; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
.btn-warning { background: #d69e2e; color: white; border: none; padding: 0.25rem 0.75rem; border-radius: 4px; cursor: pointer; }
.btn-sm { padding: 0.25rem 0.75rem; font-size: 0.875rem; }
.empty-state { text-align: center; padding: 2rem; color: #999; }
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: white; padding: 2rem; border-radius: 8px; width: 400px; max-width: 90%; }
.modal-lg { width: 600px; }
.modal h3 { margin-top: 0; }
.record-details { margin-top: 1rem; }
.detail-row { padding: 0.5rem 0; border-bottom: 1px solid #eee; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
.form-group input { width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1.5rem; }
.error-banner { background: #fed7d7; color: #c53030; padding: 1rem; border-radius: 4px; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; }
.retry-btn { background: #c53030; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
</style>
