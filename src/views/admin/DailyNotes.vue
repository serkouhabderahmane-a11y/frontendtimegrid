<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Daily Notes & Compliance</h1>
      <button @click="showExportModal = true" class="btn-primary">Export for Compliance</button>
    </div>

    <div v-if="error" class="error-banner">
      {{ error }}
      <button @click="error = null; loadNotes()" class="retry-btn">Retry</button>
    </div>

    <div class="filters">
      <select v-model="filterStatus" @change="loadNotes">
        <option value="">All Status</option>
        <option value="draft">Draft</option>
        <option value="submitted">Submitted</option>
        <option value="locked">Locked</option>
      </select>
      <input v-model="filterEmployee" placeholder="Search by employee name..." @input="loadNotes" />
    </div>

    <div class="section">
      <table class="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Employee</th>
            <th>Content</th>
            <th>Status</th>
            <th>Reviewed At</th>
            <th>Locked At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="note in notes" :key="note.id">
            <td>{{ formatDate(note.date) }}</td>
            <td>{{ note.employee?.user?.firstName }} {{ note.employee?.user?.lastName }}</td>
            <td class="content-cell">{{ note.content.substring(0, 100) }}{{ note.content.length > 100 ? '...' : '' }}</td>
            <td>
              <span :class="['status-badge', note.status]">{{ note.status }}</span>
            </td>
            <td>{{ note.reviewedAt ? formatDateTime(note.reviewedAt) : '-' }}</td>
            <td>{{ note.lockedAt ? formatDateTime(note.lockedAt) : '-' }}</td>
            <td class="actions">
              <button @click="viewNote(note)" class="btn-sm">View</button>
              <button 
                v-if="note.status === 'submitted'" 
                @click="reviewNote(note)" 
                class="btn-sm btn-info"
              >
                Review
              </button>
              <button 
                v-if="note.status === 'submitted'" 
                @click="lockNote(note)" 
                class="btn-sm btn-warning"
              >
                Lock
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="notes.length === 0" class="empty-state">No notes found</div>
    </div>

    <!-- View Note Modal -->
    <div v-if="showViewModal" class="modal-overlay" @click.self="showViewModal = false">
      <div class="modal modal-lg">
        <h3>Daily Note - {{ formatDate(selectedNote?.date) }}</h3>
        <div class="note-details">
          <p><strong>Employee:</strong> {{ selectedNote?.employee?.user?.firstName }} {{ selectedNote?.employee?.user?.lastName }}</p>
          <p><strong>Status:</strong> <span :class="['status-badge', selectedNote?.status]">{{ selectedNote?.status }}</span></p>
          <div class="note-content">
            <strong>Content:</strong>
            <div class="content-box">{{ selectedNote?.content }}</div>
          </div>
          <div v-if="selectedNote?.attachments?.length" class="attachments">
            <strong>Attachments:</strong>
            <ul>
              <li v-for="(att, idx) in JSON.parse(selectedNote.attachments)" :key="idx">{{ att }}</li>
            </ul>
          </div>
          <p><strong>Created:</strong> {{ formatDateTime(selectedNote?.createdAt) }}</p>
          <p v-if="selectedNote?.reviewedAt"><strong>Reviewed:</strong> {{ formatDateTime(selectedNote.reviewedAt) }} by {{ selectedNote.reviewedBy }}</p>
          <p v-if="selectedNote?.lockedAt"><strong>Locked:</strong> {{ formatDateTime(selectedNote.lockedAt) }} by {{ selectedNote.lockedBy }}</p>
        </div>
        <div class="modal-actions">
          <button @click="showViewModal = false" class="btn-secondary">Close</button>
        </div>
      </div>
    </div>

    <!-- Export Modal -->
    <div v-if="showExportModal" class="modal-overlay" @click.self="showExportModal = false">
      <div class="modal">
        <h3>Export Notes for Compliance</h3>
        <form @submit.prevent="exportNotes">
          <div class="form-group">
            <label>Start Date</label>
            <input v-model="exportData.startDate" type="date" required />
          </div>
          <div class="form-group">
            <label>End Date</label>
            <input v-model="exportData.endDate" type="date" required />
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

const notes = ref([])
const filterStatus = ref('')
const filterEmployee = ref('')
const showViewModal = ref(false)
const showExportModal = ref(false)
const selectedNote = ref(null)
const error = ref(null)

const exportData = ref({
  startDate: '',
  endDate: ''
})

onMounted(() => {
  loadNotes()
})

const loadNotes = async () => {
  error.value = null
  try {
    console.log('[DailyNotes] Loading notes...')
    const params = new URLSearchParams()
    if (filterStatus.value) params.append('status', filterStatus.value)
    if (filterEmployee.value) params.append('employeeName', filterEmployee.value)
    const res = await api.get(`/daily-notes?${params}`)
    console.log('[DailyNotes] Got response:', res.data)
    notes.value = res.data
    if (!res.data || res.data.length === 0) {
      error.value = 'No daily notes found.'
    }
  } catch (err) {
    console.error('[DailyNotes] Failed to load notes:', err)
    error.value = err.message || 'Failed to load notes'
  }
}

const viewNote = (note) => {
  selectedNote.value = note
  showViewModal.value = true
}

const reviewNote = async (note) => {
  try {
    await api.post(`/daily-notes/${note.id}/review`)
    await loadNotes()
    alert('Note reviewed successfully')
  } catch (err) {
    alert('Failed to review note')
  }
}

const lockNote = async (note) => {
  if (!confirm('Are you sure you want to lock this note? It cannot be edited after.')) return
  try {
    await api.post(`/daily-notes/${note.id}/lock`)
    await loadNotes()
    alert('Note locked successfully')
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to lock note')
  }
}

const exportNotes = async () => {
  try {
    await api.post('/daily-notes/export', {
      startDate: exportData.value.startDate,
      endDate: exportData.value.endDate
    })
    alert('Notes exported successfully')
    showExportModal.value = false
  } catch (err) {
    alert('Failed to export notes')
  }
}

const formatDate = (date) => new Date(date).toLocaleDateString()
const formatDateTime = (date) => date ? new Date(date).toLocaleString() : '-'
</script>

<style scoped>
.page-container { padding: 2rem; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.page-header h1 { margin: 0; }
.filters { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
.filters select, .filters input { padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; }
.filters input { flex: 1; max-width: 300px; }
.section { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #ddd; color: #1a202c; }
.data-table th { font-weight: 600; background: #f7fafc; color: #2d3748; }
.content-cell { max-width: 200px; overflow: hidden; text-overflow: ellipsis; }
.status-badge { padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
.status-badge.draft { background: #e2e8f0; color: #4a5568; }
.status-badge.submitted { background: #fef3c7; color: #b45309; }
.status-badge.locked { background: #c6f6d5; color: #276749; }
.actions { display: flex; gap: 0.5rem; }
.btn-primary { background: #2c5282; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
.btn-secondary { background: #e2e8f0; color: #4a5568; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
.btn-info { background: #3182ce; color: white; border: none; padding: 0.25rem 0.75rem; border-radius: 4px; cursor: pointer; }
.btn-warning { background: #d69e2e; color: white; border: none; padding: 0.25rem 0.75rem; border-radius: 4px; cursor: pointer; }
.btn-sm { padding: 0.25rem 0.75rem; font-size: 0.875rem; }
.empty-state { text-align: center; padding: 2rem; color: #999; }
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: white; padding: 2rem; border-radius: 8px; width: 400px; max-width: 90%; }
.modal-lg { width: 600px; }
.modal h3 { margin-top: 0; }
.note-details p { margin: 0.5rem 0; }
.note-content { margin: 1rem 0; }
.content-box { background: #f7fafc; padding: 1rem; border-radius: 4px; margin-top: 0.5rem; white-space: pre-wrap; }
.attachments { margin: 1rem 0; }
.attachments ul { margin-top: 0.5rem; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
.form-group input { width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1.5rem; }
.error-banner { background: #fed7d7; color: #c53030; padding: 1rem; border-radius: 4px; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; }
.retry-btn { background: #c53030; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
</style>
