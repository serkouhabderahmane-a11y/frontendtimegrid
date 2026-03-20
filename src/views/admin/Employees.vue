<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Employee Management</h1>
    </div>

    <div v-if="error" class="error-banner">
      {{ error }}
      <button @click="error = null; loadEmployees()" class="retry-btn">Retry</button>
    </div>

    <div class="section">
      <table class="data-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Employee #</th>
            <th>Department</th>
            <th>Start Date</th>
            <th>Hourly Rate</th>
            <th>Overtime Rate</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="emp in employees" :key="emp.id">
            <td>{{ emp.user?.firstName }} {{ emp.user?.lastName }}</td>
            <td>{{ emp.employeeNumber || '-' }}</td>
            <td>{{ emp.department?.name || '-' }}</td>
            <td>{{ formatDate(emp.startDate) }}</td>
            <td>
              <span v-if="editingId !== emp.id">${{ emp.hourlyRate?.toFixed(2) }}</span>
              <input 
                v-else 
                type="number" 
                v-model.number="editingData.hourlyRate" 
                class="edit-input"
                step="0.01"
                min="0"
              />
            </td>
            <td>
              <span v-if="editingId !== emp.id">${{ emp.overtimeRate?.toFixed(2) }}</span>
              <input 
                v-else 
                type="number" 
                v-model.number="editingData.overtimeRate" 
                class="edit-input"
                step="0.01"
                min="0"
              />
            </td>
            <td>
              <span :class="['status-badge', emp.onboardingStatus]">{{ formatStatus(emp.onboardingStatus) }}</span>
            </td>
            <td class="actions">
              <button 
                v-if="editingId !== emp.id" 
                @click="startEdit(emp)" 
                class="btn-sm btn-info"
              >
                Edit Rates
              </button>
              <template v-else>
                <button @click="saveEdit(emp)" class="btn-sm btn-success">Save</button>
                <button @click="cancelEdit" class="btn-sm btn-secondary">Cancel</button>
              </template>
            </td>
          </tr>
          <tr v-if="employees.length === 0">
            <td colspan="8" class="empty-state">No employees found.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2>Pay Rate Settings</h2>
      <div class="settings-grid">
        <div class="setting-card">
          <div class="setting-label">Default Hourly Rate</div>
          <div class="setting-value">${{ defaultHourlyRate.toFixed(2) }}</div>
          <div class="setting-hint">Applied to new employees</div>
        </div>
        <div class="setting-card">
          <div class="setting-label">Default Overtime Rate</div>
          <div class="setting-value">${{ defaultOvertimeRate.toFixed(2) }}</div>
          <div class="setting-hint">1.5x hourly rate by default</div>
        </div>
        <div class="setting-card">
          <div class="setting-label">Overtime Threshold</div>
          <div class="setting-value">{{ overtimeThreshold }} minutes/day</div>
          <div class="setting-hint">Hours exceeding this become overtime</div>
        </div>
        <div class="setting-card">
          <div class="setting-label">Pay Period</div>
          <div class="setting-value">Bi-weekly</div>
          <div class="setting-hint">Automatically every 2 weeks</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../../api/axios'

const employees = ref([])
const error = ref(null)
const editingId = ref(null)
const editingData = ref({})
const defaultHourlyRate = ref(15.00)
const defaultOvertimeRate = ref(22.50)
const overtimeThreshold = ref(480)

onMounted(async () => {
  await loadEmployees()
  await loadSettings()
})

const loadEmployees = async () => {
  error.value = null
  try {
    const res = await api.get('/employees')
    employees.value = res.data
    if (!res.data || res.data.length === 0) {
      error.value = 'No employees found.'
    }
  } catch (err) {
    console.error('[Employees] Failed to load:', err)
    error.value = err.message || 'Failed to load employees'
  }
}

const loadSettings = async () => {
  try {
    const res = await api.get('/tenant/settings')
    const settings = res.data.settings || {}
    defaultHourlyRate.value = settings.defaultHourlyRate || 15.00
    defaultOvertimeRate.value = settings.defaultOvertimeRate || 22.50
    overtimeThreshold.value = settings.overtimeThreshold || 480
  } catch (err) {
    console.error('Failed to load settings')
  }
}

const startEdit = (emp) => {
  editingId.value = emp.id
  editingData.value = {
    hourlyRate: emp.hourlyRate || 15,
    overtimeRate: emp.overtimeRate || 22.5
  }
}

const cancelEdit = () => {
  editingId.value = null
  editingData.value = {}
}

const saveEdit = async (emp) => {
  try {
    await api.patch(`/employees/${emp.id}`, {
      hourlyRate: editingData.value.hourlyRate,
      overtimeRate: editingData.value.overtimeRate
    })
    emp.hourlyRate = editingData.value.hourlyRate
    emp.overtimeRate = editingData.value.overtimeRate
    editingId.value = null
    editingData.value = {}
    alert('Pay rates updated successfully')
  } catch (err) {
    alert('Failed to update pay rates')
  }
}

const formatDate = (date) => date ? new Date(date).toLocaleDateString() : '-'

const formatStatus = (status) => {
  const statusMap = {
    'candidate_created': 'Pending',
    'packet_assigned': 'Assigned',
    'in_progress': 'In Progress',
    'completed': 'Completed',
    'employee_active': 'Active'
  }
  return statusMap[status] || status
}
</script>

<style scoped>
.page-container { padding: 2rem; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.page-header h1 { margin: 0; }
.section { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1.5rem; }
.section h2 { margin-top: 0; margin-bottom: 1rem; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #ddd; color: #1a202c; }
.data-table th { font-weight: 600; background: #f7fafc; color: #2d3748; }
.status-badge { padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
.status-badge.candidate_created { background: #e2e8f0; color: #4a5568; }
.status-badge.packet_assigned { background: #bee3f8; color: #2b6cb0; }
.status-badge.in_progress { background: #fef3c7; color: #b45309; }
.status-badge.completed { background: #c6f6d5; color: #276749; }
.status-badge.employee_active { background: #c6f6d5; color: #276749; }
.actions { display: flex; gap: 0.5rem; }
.edit-input { width: 80px; padding: 0.25rem; border: 1px solid #ccc; border-radius: 4px; }
.btn-primary { background: #2c5282; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
.btn-secondary { background: #e2e8f0; color: #4a5568; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
.btn-success { background: #38a169; color: white; border: none; padding: 0.25rem 0.75rem; border-radius: 4px; cursor: pointer; }
.btn-info { background: #3182ce; color: white; border: none; padding: 0.25rem 0.75rem; border-radius: 4px; cursor: pointer; }
.btn-sm { padding: 0.25rem 0.75rem; font-size: 0.875rem; }
.empty-state { text-align: center; padding: 2rem; color: #718096; }
.settings-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
.setting-card { background: #f7fafc; padding: 1.5rem; border-radius: 8px; text-align: center; }
.setting-label { color: #718096; font-size: 0.875rem; margin-bottom: 0.5rem; }
.setting-value { font-size: 1.5rem; font-weight: bold; color: #2c5282; }
.setting-hint { color: #a0aec0; font-size: 0.75rem; margin-top: 0.5rem; }
.error-banner { background: #fed7d7; color: #c53030; padding: 1rem; border-radius: 4px; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; }
.retry-btn { background: #c53030; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
</style>
