<template>
  <div class="page-container">
    <div class="page-header">
      <h1>My Daily Notes</h1>
      <button @click="showCreateModal = true" class="btn-primary">Add Note</button>
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
    </div>

    <div class="section">
      <table class="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Content</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="note in notes" :key="note.id">
            <td>{{ formatDate(note.date) }}</td>
            <td class="content-cell">{{ note.content.substring(0, 100) }}{{ note.content.length > 100 ? '...' : '' }}</td>
            <td>
              <span :class="['status-badge', note.status]">{{ note.status }}</span>
            </td>
            <td class="actions">
              <button @click="viewNote(note)" class="btn-sm">View</button>
              <button 
                v-if="note.status === 'draft'" 
                @click="editNote(note)" 
                class="btn-sm btn-info"
              >
                Edit
              </button>
              <button 
                v-if="note.status === 'draft'" 
                @click="submitNote(note)" 
                class="btn-sm btn-success"
              >
                Submit
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="notes.length === 0" class="empty-state">No notes found. Click "Add Note" to create your first daily note.</div>
    </div>

    <!-- View Note Modal -->
    <div v-if="showViewModal" class="modal-overlay" @click.self="showViewModal = false">
      <div class="modal modal-lg">
        <h3>Daily Note - {{ formatDate(selectedNote?.date) }}</h3>
        <div class="note-details">
          <p><strong>Status:</strong> <span :class="['status-badge', selectedNote?.status]">{{ selectedNote?.status }}</span></p>
          <div class="note-content">
            <strong>Content:</strong>
            <div class="content-box">{{ selectedNote?.content }}</div>
          </div>
          <p><strong>Created:</strong> {{ formatDateTime(selectedNote?.createdAt) }}</p>
          <p v-if="selectedNote?.reviewedAt"><strong>Reviewed:</strong> {{ formatDateTime(selectedNote.reviewedAt) }}</p>
        </div>
        <div class="modal-actions">
          <button @click="showViewModal = false" class="btn-secondary">Close</button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Note Modal -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click.self="closeFormModal">
      <div class="modal modal-lg">
        <h3>{{ showEditModal ? 'Edit Note' : 'Add New Note' }}</h3>
        <form @submit.prevent="saveNote">
          <div class="form-group">
            <label>Date</label>
            <input v-model="formData.date" type="date" required />
          </div>
          <div class="form-group">
            <label>Content</label>
            <textarea v-model="formData.content" rows="8" required class="form-textarea"></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeFormModal" class="btn-secondary">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="saving">{{ saving ? 'Saving...' : 'Save' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../api/axios'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()

const notes = ref([])
const filterStatus = ref('')
const showViewModal = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const selectedNote = ref(null)
const error = ref(null)
const saving = ref(false)

const formData = ref({
  date: new Date().toISOString().split('T')[0],
  content: '',
  participantId: ''
})

onMounted(() => {
  loadNotes()
})

const loadNotes = async () => {
  error.value = null
  try {
    const params = new URLSearchParams()
    if (filterStatus.value) params.append('status', filterStatus.value)
    const res = await api.get(`/daily-notes?${params}`)
    notes.value = res.data
    if (!res.data || res.data.length === 0) {
      error.value = 'No daily notes found.'
    }
  } catch (err) {
    console.error('[EmployeeDailyNotes] Failed to load notes:', err)
    error.value = err.response?.data?.message || err.message || 'Failed to load notes'
  }
}

const viewNote = (note) => {
  selectedNote.value = note
  showViewModal.value = true
}

const editNote = (note) => {
  selectedNote.value = note
  formData.value = {
    date: new Date(note.date).toISOString().split('T')[0],
    content: note.content,
    participantId: note.participantId || ''
  }
  showEditModal.value = true
}

const submitNote = async (note) => {
  try {
    await api.post(`/daily-notes/${note.id}/submit`)
    await loadNotes()
    alert('Note submitted successfully')
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to submit note')
  }
}

const saveNote = async () => {
  saving.value = true
  try {
    if (showEditModal.value && selectedNote.value) {
      await api.put(`/daily-notes/${selectedNote.value.id}`, {
        content: formData.value.content,
        date: formData.value.date
      })
    } else {
      await api.post('/daily-notes', {
        date: formData.value.date,
        content: formData.value.content,
        participantId: formData.value.participantId || undefined
      })
    }
    await loadNotes()
    closeFormModal()
    alert(showEditModal.value ? 'Note updated successfully' : 'Note created successfully')
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to save note')
  } finally {
    saving.value = false
  }
}

const closeFormModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  selectedNote.value = null
  formData.value = {
    date: new Date().toISOString().split('T')[0],
    content: '',
    participantId: ''
  }
}

const formatDate = (date) => new Date(date).toLocaleDateString()
const formatDateTime = (date) => date ? new Date(date).toLocaleString() : '-'
</script>

<style scoped>
.page-container { padding: 2rem; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.page-header h1 { margin: 0; color: #f8fafc; }
.filters { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
.filters select { padding: 0.5rem; border: 1px solid #334155; border-radius: 4px; background: #1e293b; color: #e2e8f0; }
.section { background: #1e293b; padding: 1.5rem; border-radius: 8px; border: 1px solid #334155; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #334155; color: #e2e8f0; }
.data-table th { font-weight: 600; background: #0f172a; color: #94a3b8; }
.content-cell { max-width: 300px; overflow: hidden; text-overflow: ellipsis; }
.status-badge { padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
.status-badge.draft { background: #334155; color: #94a3b8; }
.status-badge.submitted { background: #854d0e; color: #fef3c7; }
.status-badge.locked { background: #166534; color: #dcfce7; }
.actions { display: flex; gap: 0.5rem; }
.btn-primary { background: #42b883; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
.btn-primary:hover { background: #359268; }
.btn-primary:disabled { background: #64748b; cursor: not-allowed; }
.btn-secondary { background: #334155; color: #e2e8f0; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
.btn-info { background: #3b82f6; color: white; border: none; padding: 0.25rem 0.75rem; border-radius: 4px; cursor: pointer; }
.btn-success { background: #42b883; color: white; border: none; padding: 0.25rem 0.75rem; border-radius: 4px; cursor: pointer; }
.btn-sm { padding: 0.25rem 0.75rem; font-size: 0.875rem; background: #334155; color: #e2e8f0; border: none; border-radius: 4px; cursor: pointer; }
.empty-state { text-align: center; padding: 2rem; color: #64748b; }
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: #1e293b; padding: 2rem; border-radius: 8px; width: 500px; max-width: 90%; border: 1px solid #334155; }
.modal-lg { width: 600px; }
.modal h3 { margin-top: 0; color: #f8fafc; }
.note-details p { margin: 0.5rem 0; color: #e2e8f0; }
.note-content { margin: 1rem 0; }
.content-box { background: #0f172a; padding: 1rem; border-radius: 4px; margin-top: 0.5rem; white-space: pre-wrap; color: #e2e8f0; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; color: #e2e8f0; }
.form-group input, .form-textarea { width: 100%; padding: 0.5rem; border: 1px solid #334155; border-radius: 4px; background: #0f172a; color: #e2e8f0; }
.form-textarea { resize: vertical; min-height: 150px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1.5rem; }
.error-banner { background: #7f1d1d; color: #fecaca; padding: 1rem; border-radius: 4px; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; }
.retry-btn { background: #dc2626; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
</style>
