<template>
  <div class="announcements-page">
    <header class="page-header">
      <div>
        <h1>Announcements</h1>
        <p>Stay updated with company news and updates</p>
      </div>
      <button v-if="canCreate" class="btn btn-primary" @click="showCreateModal = true">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
        </svg>
        New Announcement
      </button>
    </header>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading announcements...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="fetchAnnouncements" class="btn btn-secondary">Retry</button>
    </div>

    <div v-else class="announcements-list">
      <div v-for="announcement in announcements" :key="announcement.id" class="card announcement-card">
        <div class="announcement-header">
          <div class="announcement-icon" :class="announcement.type">
            <svg v-if="announcement.type === 'info'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <svg v-else-if="announcement.type === 'warning'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <svg v-else fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/>
            </svg>
          </div>
          <div class="announcement-meta">
            <span class="announcement-date">{{ formatDate(announcement.createdAt) }}</span>
            <span class="announcement-author">by {{ announcement.author?.name || 'System' }}</span>
          </div>
          <div class="announcement-actions" v-if="canEdit">
            <button @click="editAnnouncement(announcement)" class="btn-icon">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
              </svg>
            </button>
            <button @click="deleteAnnouncement(announcement.id)" class="btn-icon btn-icon-danger">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>
        <h3>{{ announcement.title }}</h3>
        <p>{{ announcement.content }}</p>
      </div>

      <div v-if="announcements.length === 0" class="empty-state">
        <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
        </svg>
        <h3>No announcements yet</h3>
        <p>Create your first announcement to share news with your organization.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import api from '../api/axios'

const authStore = useAuthStore()

const loading = ref(true)
const error = ref(null)
const announcements = ref([])
const showCreateModal = ref(false)

const canCreate = computed(() => authStore.hasPermission('announcements.create') || authStore.isAdmin || authStore.isHR)
const canEdit = computed(() => authStore.hasPermission('announcements.edit') || authStore.isAdmin || authStore.isHR)

const fetchAnnouncements = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await api.get('/api/announcements')
    announcements.value = response.data
  } catch (e) {
    console.error('Failed to fetch announcements:', e)
    error.value = 'Failed to load announcements'
  } finally {
    loading.value = false
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const editAnnouncement = (announcement) => {
  console.log('Edit announcement:', announcement)
}

const deleteAnnouncement = async (id) => {
  if (confirm('Are you sure you want to delete this announcement?')) {
    try {
      await api.delete(`/api/announcements/${id}`)
      announcements.value = announcements.value.filter(a => a.id !== id)
    } catch (e) {
      console.error('Failed to delete announcement:', e)
    }
  }
}

onMounted(() => {
  fetchAnnouncements()
})
</script>

<style scoped>
.announcements-page {
  max-width: 900px;
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
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #42b883;
  color: white;
}

.btn-primary:hover {
  background: #359268;
}

.btn-secondary {
  background: #334155;
  color: #f8fafc;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #94a3b8;
}

.error-state {
  color: #ef4444;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #334155;
  border-top-color: #42b883;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.announcements-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 1rem;
  padding: 1.5rem;
}

.announcement-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.announcement-icon {
  width: 40px;
  height: 40px;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.announcement-icon svg {
  width: 20px;
  height: 20px;
}

.announcement-icon.info {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.announcement-icon.update {
  background: rgba(66, 184, 131, 0.1);
  color: #42b883;
}

.announcement-icon.warning {
  background: rgba(249, 115, 22, 0.1);
  color: #f97316;
}

.announcement-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.announcement-date {
  color: #94a3b8;
  font-size: 0.875rem;
}

.announcement-author {
  color: #64748b;
  font-size: 0.75rem;
}

.announcement-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid #334155;
  border-radius: 0.5rem;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #334155;
  color: #f8fafc;
}

.btn-icon-danger:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
  color: #ef4444;
}

.announcement-card h3 {
  color: #f8fafc;
  margin-bottom: 0.75rem;
}

.announcement-card p {
  color: #94a3b8;
  line-height: 1.6;
}

.empty-state svg {
  color: #64748b;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: #f8fafc;
  margin-bottom: 0.5rem;
}
</style>
