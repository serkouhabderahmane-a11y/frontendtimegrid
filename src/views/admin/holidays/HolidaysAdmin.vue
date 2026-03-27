<template>
  <div class="holidays-management">
    <header class="page-header">
      <div>
        <h1>Holiday Management</h1>
        <p>Define official holidays for your organization</p>
      </div>
      <button @click="showAddModal = true" class="btn btn-primary">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
        </svg>
        Add Holiday
      </button>
    </header>

    <div class="filters-section">
      <div class="filter-group">
        <label>Date Range</label>
        <div class="date-inputs">
          <input type="date" v-model="filters.startDate" @change="fetchHolidays" />
          <span>to</span>
          <input type="date" v-model="filters.endDate" @change="fetchHolidays" />
        </div>
      </div>
      <div class="filter-group">
        <label>Type</label>
        <select v-model="filters.type" @change="fetchHolidays">
          <option value="">All Types</option>
          <option value="national">National</option>
          <option value="company">Company</option>
          <option value="regional">Regional</option>
          <option value="optional">Optional</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Status</label>
        <select v-model="filters.isActive" @change="fetchHolidays">
          <option value="">All</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>
    </div>

    <div class="holidays-list" v-if="holidays.length > 0">
      <div v-for="holiday in holidays" :key="holiday.id" class="holiday-card" :class="{ inactive: !holiday.isActive }">
        <div class="holiday-header">
          <div class="holiday-date">
            <span class="day">{{ formatDay(holiday.date) }}</span>
            <span class="month">{{ formatMonth(holiday.date) }}</span>
          </div>
          <div class="holiday-info">
            <h3>{{ holiday.name }}</h3>
            <div class="holiday-meta">
              <span class="type-badge" :class="holiday.type">{{ formatType(holiday.type) }}</span>
              <span v-if="holiday.endDate" class="date-range">{{ formatDate(holiday.date) }} - {{ formatDate(holiday.endDate) }}</span>
              <span v-else class="single-date">{{ formatDate(holiday.date) }}</span>
              <span v-if="holiday.isRecurring" class="recurring">Recurring</span>
            </div>
          </div>
          <div class="holiday-status">
            <span class="status-dot" :class="{ active: holiday.isActive }"></span>
          </div>
        </div>
        <div class="holiday-description" v-if="holiday.description">{{ holiday.description }}</div>
        <div class="holiday-assignments" v-if="holiday.assignments?.length > 0">
          <span class="assignments-label">Assigned to:</span>
          <span v-for="a in holiday.assignments" :key="a.id" class="assignment-badge">
            {{ a.department?.name || a.location?.name || a.region || 'All' }}
          </span>
        </div>
        <div class="holiday-actions">
          <button @click="openAssignModal(holiday)" class="btn btn-sm btn-secondary" v-if="holiday.isActive">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
            Assign
          </button>
          <button @click="openEditModal(holiday)" class="btn btn-sm btn-secondary">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            Edit
          </button>
          <button @click="toggleHoliday(holiday)" class="btn btn-sm" :class="holiday.isActive ? 'btn-warning' : 'btn-success'">
            {{ holiday.isActive ? 'Disable' : 'Enable' }}
          </button>
        </div>
      </div>
    </div>

    <div v-else-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading holidays...</p>
    </div>

    <div v-else class="empty-state">
      <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>
      <h3>No holidays found</h3>
      <p>Add your first holiday to get started</p>
    </div>

    <div v-if="pagination.totalPages > 1" class="pagination">
      <button @click="changePage(pagination.page - 1)" :disabled="pagination.page === 1">Previous</button>
      <span>Page {{ pagination.page }} of {{ pagination.totalPages }}</span>
      <button @click="changePage(pagination.page + 1)" :disabled="pagination.page === pagination.totalPages">Next</button>
    </div>

    <div v-if="showAddModal || showEditModal" class="modal-overlay" @click.self="closeModals">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ showEditModal ? 'Edit Holiday' : 'Add Holiday' }}</h2>
          <button @click="closeModals" class="close-btn">&times;</button>
        </div>
        <form @submit.prevent="submitHoliday" class="modal-body">
          <div class="form-group">
            <label>Name *</label>
            <input type="text" v-model="holidayForm.name" required placeholder="e.g., New Year's Day" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Start Date *</label>
              <input type="date" v-model="holidayForm.date" required />
            </div>
            <div class="form-group">
              <label>End Date</label>
              <input type="date" v-model="holidayForm.endDate" :min="holidayForm.date" />
            </div>
          </div>
          <div class="form-group">
            <label>Type *</label>
            <select v-model="holidayForm.type" required>
              <option value="">Select type...</option>
              <option value="national">National</option>
              <option value="company">Company</option>
              <option value="regional">Regional</option>
              <option value="optional">Optional</option>
            </select>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="holidayForm.description" placeholder="Optional description..."></textarea>
          </div>
          <div class="form-group checkbox-group">
            <label>
              <input type="checkbox" v-model="holidayForm.isRecurring" />
              Recurring annually
            </label>
          </div>
          <div class="modal-footer">
            <button type="button" @click="closeModals" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary">{{ showEditModal ? 'Update' : 'Add' }} Holiday</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showAssignModal" class="modal-overlay" @click.self="closeAssignModal">
      <div class="modal">
        <div class="modal-header">
          <h2>Assign Holiday</h2>
          <button @click="closeAssignModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <p class="assign-info">Holiday: <strong>{{ selectedHoliday?.name }}</strong></p>
          <div class="form-group">
            <label>Assignment Type</label>
            <select v-model="assignment.type">
              <option value="">Select type...</option>
              <option value="department">Department</option>
              <option value="location">Location</option>
              <option value="region">Region</option>
            </select>
          </div>
          <div class="form-group" v-if="assignment.type === 'department'">
            <label>Department</label>
            <select v-model="assignment.departmentId">
              <option value="">Select department...</option>
              <option v-for="dept in departments" :key="dept.id" :value="dept.id">{{ dept.name }}</option>
            </select>
          </div>
          <div class="form-group" v-if="assignment.type === 'location'">
            <label>Location</label>
            <select v-model="assignment.locationId">
              <option value="">Select location...</option>
              <option v-for="loc in locations" :key="loc.id" :value="loc.id">{{ loc.name }}</option>
            </select>
          </div>
          <div class="form-group" v-if="assignment.type === 'region'">
            <label>Region</label>
            <input type="text" v-model="assignment.region" placeholder="e.g., US-West, EU" />
          </div>
          <div class="modal-footer">
            <button type="button" @click="closeAssignModal" class="btn btn-secondary">Cancel</button>
            <button @click="submitAssignment" class="btn btn-primary">Add Assignment</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../../api/axios'

const loading = ref(false)
const holidays = ref([])
const departments = ref([])
const locations = ref([])
const pagination = ref({ page: 1, limit: 50, totalPages: 0 })
const filters = ref({ startDate: '', endDate: '', type: '', isActive: '' })
const showAddModal = ref(false)
const showEditModal = ref(false)
const showAssignModal = ref(false)
const selectedHoliday = ref(null)

const holidayForm = ref({ name: '', date: '', endDate: '', type: '', description: '', isRecurring: false })
const assignment = ref({ type: '', departmentId: '', locationId: '', region: '' })

const formatType = (type) => ({ national: 'National', company: 'Company', regional: 'Regional', optional: 'Optional' }[type] || type)

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

const formatDay = (date) => new Date(date).getDate()
const formatMonth = (date) => new Date(date).toLocaleDateString('en-US', { month: 'short' })

const fetchHolidays = async () => {
  loading.value = true
  try {
    const params = { page: pagination.value.page, limit: pagination.value.limit, ...filters.value }
    if (params.isActive) params.isActive = params.isActive === 'true'
    const response = await api.get('/api/holidays', { params })
    holidays.value = response.data.data
    pagination.value.totalPages = response.data.totalPages
  } catch (err) {
    console.error('Failed to fetch holidays:', err)
  } finally {
    loading.value = false
  }
}

const fetchDepartments = async () => {
  try {
    const response = await api.get('/api/holidays/admin/departments')
    departments.value = response.data
  } catch (err) {
    console.error('Failed to fetch departments:', err)
  }
}

const fetchLocations = async () => {
  try {
    const response = await api.get('/api/holidays/admin/locations')
    locations.value = response.data
  } catch (err) {
    console.error('Failed to fetch locations:', err)
  }
}

const changePage = (page) => {
  pagination.value.page = page
  fetchHolidays()
}

const closeModals = () => {
  showAddModal.value = false
  showEditModal.value = false
  selectedHoliday.value = null
  holidayForm.value = { name: '', date: '', endDate: '', type: '', description: '', isRecurring: false }
}

const openEditModal = (holiday) => {
  selectedHoliday.value = holiday
  holidayForm.value = {
    name: holiday.name,
    date: holiday.date.slice(0, 10),
    endDate: holiday.endDate?.slice(0, 10) || '',
    type: holiday.type,
    description: holiday.description || '',
    isRecurring: holiday.isRecurring
  }
  showEditModal.value = true
}

const submitHoliday = async () => {
  try {
    if (showEditModal.value && selectedHoliday.value) {
      await api.patch(`/api/holidays/${selectedHoliday.value.id}`, holidayForm.value)
    } else {
      await api.post('/api/holidays', holidayForm.value)
    }
    closeModals()
    fetchHolidays()
  } catch (err) {
    console.error('Failed to save holiday:', err)
    alert(err.response?.data?.message || 'Failed to save holiday')
  }
}

const toggleHoliday = async (holiday) => {
  try {
    if (holiday.isActive) {
      await api.delete(`/api/holidays/${holiday.id}`)
    } else {
      await api.patch(`/api/holidays/${holiday.id}`, { isActive: true })
    }
    fetchHolidays()
  } catch (err) {
    console.error('Failed to toggle holiday:', err)
    alert(err.response?.data?.message || 'Failed to toggle holiday')
  }
}

const openAssignModal = (holiday) => {
  selectedHoliday.value = holiday
  assignment.value = { type: '', departmentId: '', locationId: '', region: '' }
  showAssignModal.value = true
}

const closeAssignModal = () => {
  showAssignModal.value = false
  selectedHoliday.value = null
}

const submitAssignment = async () => {
  if (!assignment.value.type) {
    alert('Please select an assignment type')
    return
  }
  const data = {}
  if (assignment.value.type === 'department') data.departmentId = assignment.value.departmentId
  if (assignment.value.type === 'location') data.locationId = assignment.value.locationId
  if (assignment.value.type === 'region') data.region = assignment.value.region

  try {
    await api.post(`/api/holidays/${selectedHoliday.value.id}/assignments`, data)
    closeAssignModal()
    fetchHolidays()
  } catch (err) {
    console.error('Failed to add assignment:', err)
    alert(err.response?.data?.message || 'Failed to add assignment')
  }
}

onMounted(() => {
  const year = new Date().getFullYear()
  filters.value.startDate = `${year}-01-01`
  filters.value.endDate = `${year + 1}-12-31`
  fetchHolidays()
  fetchDepartments()
  fetchLocations()
})
</script>

<style scoped>
.holidays-management { padding: 2rem; max-width: 1200px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
.page-header h1 { font-size: 1.75rem; font-weight: 700; color: #f8fafc; margin-bottom: 0.25rem; }
.page-header p { color: #94a3b8; }
.filters-section { background: #1e293b; border: 1px solid #334155; border-radius: 0.75rem; padding: 1.25rem; margin-bottom: 1.5rem; display: flex; gap: 1rem; flex-wrap: wrap; }
.filter-group { display: flex; flex-direction: column; gap: 0.5rem; }
.filter-group label { color: #94a3b8; font-size: 0.75rem; text-transform: uppercase; }
.filter-group input, .filter-group select { background: #0f172a; border: 1px solid #334155; border-radius: 0.5rem; padding: 0.5rem 0.75rem; color: #f8fafc; min-width: 150px; }
.date-inputs { display: flex; align-items: center; gap: 0.5rem; }
.date-inputs span { color: #64748b; }
.holidays-list { display: flex; flex-direction: column; gap: 1rem; }
.holiday-card { background: #1e293b; border: 1px solid #334155; border-radius: 0.75rem; padding: 1.25rem; }
.holiday-card.inactive { opacity: 0.6; }
.holiday-header { display: flex; gap: 1rem; align-items: flex-start; }
.holiday-date { width: 60px; height: 60px; background: linear-gradient(135deg, #42b883, #359268); border-radius: 0.75rem; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; flex-shrink: 0; }
.holiday-date .day { font-size: 1.5rem; font-weight: 700; line-height: 1; }
.holiday-date .month { font-size: 0.75rem; text-transform: uppercase; }
.holiday-info { flex: 1; }
.holiday-info h3 { color: #f8fafc; font-size: 1.125rem; margin-bottom: 0.5rem; }
.holiday-meta { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
.type-badge { font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 0.25rem; text-transform: capitalize; }
.type-badge.national { background: rgba(59,130,246,0.2); color: #3b82f6; }
.type-badge.company { background: rgba(139,92,246,0.2); color: #8b5cf6; }
.type-badge.regional { background: rgba(249,115,22,0.2); color: #f97316; }
.type-badge.optional { background: rgba(34,197,94,0.2); color: #22c55e; }
.date-range, .single-date { color: #94a3b8; font-size: 0.875rem; }
.recurring { font-size: 0.75rem; color: #42b883; background: rgba(66,184,131,0.1); padding: 0.125rem 0.5rem; border-radius: 0.25rem; }
.holiday-status { flex-shrink: 0; }
.status-dot { width: 12px; height: 12px; border-radius: 50%; background: #ef4444; }
.status-dot.active { background: #22c55e; }
.holiday-description { color: #94a3b8; font-size: 0.875rem; margin: 0.75rem 0; padding-left: 4.5rem; }
.holiday-assignments { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; padding-left: 4.5rem; margin-bottom: 0.75rem; }
.assignments-label { color: #64748b; font-size: 0.75rem; }
.assignment-badge { font-size: 0.75rem; padding: 0.125rem 0.5rem; background: #334155; color: #94a3b8; border-radius: 0.25rem; }
.holiday-actions { display: flex; gap: 0.5rem; padding-left: 4.5rem; }
.loading-state, .empty-state { text-align: center; padding: 4rem; color: #64748b; }
.empty-state h3 { color: #f8fafc; margin: 1rem 0 0.5rem; }
.spinner { width: 40px; height: 40px; border: 3px solid #334155; border-top-color: #42b883; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
@keyframes spin { to { transform: rotate(360deg); } }
.pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 1.5rem; }
.pagination button { background: #334155; border: none; border-radius: 0.5rem; padding: 0.5rem 1rem; color: #f8fafc; cursor: pointer; }
.pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
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
.form-group textarea { min-height: 80px; resize: vertical; }
.checkbox-group label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }
.checkbox-group input { width: auto; }
.assign-info { color: #94a3b8; margin-bottom: 1rem; }
.assign-info strong { color: #f8fafc; }
.modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1.25rem; border-top: 1px solid #334155; }
.btn { padding: 0.625rem 1rem; border-radius: 0.5rem; font-weight: 600; font-size: 0.875rem; cursor: pointer; transition: all 0.2s; border: none; display: inline-flex; align-items: center; gap: 0.375rem; }
.btn-sm { padding: 0.375rem 0.75rem; font-size: 0.75rem; }
.btn-primary { background: #42b883; color: white; }
.btn-primary:hover { background: #359268; }
.btn-secondary { background: #334155; color: #f8fafc; }
.btn-secondary:hover { background: #475569; }
.btn-success { background: rgba(34,197,94,0.2); color: #22c55e; }
.btn-success:hover { background: rgba(34,197,94,0.3); }
.btn-warning { background: rgba(245,158,11,0.2); color: #f59e0b; }
.btn-warning:hover { background: rgba(245,158,11,0.3); }
</style>
