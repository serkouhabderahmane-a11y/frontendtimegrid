<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Training Video Settings</h1>
      <p class="page-description">Configure training videos that employees must watch during onboarding</p>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading training settings...</p>
    </div>

    <div v-else-if="error" class="error-banner">
      {{ error }}
      <button @click="loadSettings" class="retry-btn">Retry</button>
    </div>

    <div v-else class="settings-content">
      <!-- Training Video Configuration -->
      <div class="section">
        <div class="section-header">
          <h2>Training Videos</h2>
          <button @click="showAddModal = true" class="btn-primary">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Add Video
          </button>
        </div>

        <div v-if="videos.length === 0" class="empty-state">
          <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
          </svg>
          <h3>No Training Videos</h3>
          <p>Add training videos that employees must complete during onboarding.</p>
          <button @click="showAddModal = true" class="btn-primary">Add Your First Video</button>
        </div>

        <div v-else class="video-list">
          <div v-for="video in videos" :key="video.id" class="video-card">
            <div class="video-thumbnail">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="video-info">
              <h3>{{ video.title }}</h3>
              <p>{{ video.description || 'No description' }}</p>
              <div class="video-meta">
                <span class="meta-badge" :class="video.is_required ? 'required' : 'optional'">
                  {{ video.is_required ? 'Required' : 'Optional' }}
                </span>
                <span v-if="video.duration" class="meta-duration">{{ video.duration }} min</span>
              </div>
            </div>
            <div class="video-actions">
              <button @click="editVideo(video)" class="btn-icon" title="Edit">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </button>
              <button @click="deleteVideo(video.id)" class="btn-icon btn-danger" title="Delete">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- General Settings -->
      <div class="section">
        <h2>General Settings</h2>
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="settings.requireAllVideos" @change="saveSettings">
            <span>Require all videos to be completed</span>
          </label>
          <p class="form-hint">When enabled, employees must watch all required videos before completing onboarding.</p>
        </div>
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="settings.allowSkip" @change="saveSettings">
            <span>Allow employees to skip optional videos</span>
          </label>
          <p class="form-hint">Optional videos can be skipped during onboarding.</p>
        </div>
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="settings.trackProgress" @change="saveSettings">
            <span>Track video progress</span>
          </label>
          <p class="form-hint">Record how much of each video an employee watches.</p>
        </div>
      </div>

      <!-- Completion Requirements -->
      <div class="section">
        <h2>Completion Requirements</h2>
        <div class="form-group">
          <label>Minimum watch percentage</label>
          <div class="range-input">
            <input type="range" v-model="settings.minWatchPercent" min="50" max="100" @change="saveSettings">
            <span class="range-value">{{ settings.minWatchPercent }}%</span>
          </div>
          <p class="form-hint">Employee must watch at least this percentage to mark video as complete.</p>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ editingVideo ? 'Edit Video' : 'Add Training Video' }}</h3>
          <button @click="closeModal" class="btn-icon">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <form @submit.prevent="saveVideo" class="modal-body">
          <div class="form-group">
            <label>Video Title *</label>
            <input type="text" v-model="videoForm.title" required placeholder="e.g., Workplace Safety Training">
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="videoForm.description" rows="3" placeholder="Brief description of the video content"></textarea>
          </div>
          
          <!-- Video Source Selection -->
          <div class="form-group">
            <label>Video Source</label>
            <div class="source-tabs">
              <button 
                type="button" 
                :class="['source-tab', { active: videoForm.sourceType === 'url' }]"
                @click="videoForm.sourceType = 'url'"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                </svg>
                External URL
              </button>
              <button 
                type="button" 
                :class="['source-tab', { active: videoForm.sourceType === 'upload' }]"
                @click="videoForm.sourceType = 'upload'"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                </svg>
                Upload File
              </button>
            </div>
          </div>
          
          <!-- URL Source -->
          <div v-if="videoForm.sourceType === 'url'" class="form-group">
            <label>Video URL *</label>
            <input type="url" v-model="videoForm.url" required placeholder="https://youtube.com/embed/...">
            <p class="form-hint">Enter YouTube, Vimeo, or other embed URL</p>
          </div>
          
          <!-- Upload Source -->
          <div v-if="videoForm.sourceType === 'upload'" class="form-group">
            <label>Video File *</label>
            <div v-if="!videoForm.uploadFile" class="file-upload-area" @click="triggerFileInput">
              <input 
                ref="fileInput" 
                type="file" 
                accept="video/mp4,video/webm,video/quicktime" 
                @change="handleFileSelect"
                hidden
              >
              <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
              </svg>
              <p>Click to upload video</p>
              <small>MP4, WebM, or MOV (max 500MB)</small>
            </div>
            
            <div v-else class="file-preview">
              <div class="file-info">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div>
                  <p class="file-name">{{ videoForm.uploadFile.name }}</p>
                  <p class="file-size">{{ formatFileSize(videoForm.uploadFile.size) }}</p>
                </div>
              </div>
              <button type="button" @click="clearFile" class="btn-remove">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <!-- Upload Progress -->
            <div v-if="uploading" class="upload-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
              </div>
              <p class="progress-text">{{ uploadProgress }}% uploaded</p>
            </div>
            
            <p class="form-hint">Videos are stored securely on TimeGrid servers</p>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Duration (minutes)</label>
              <input type="number" v-model="videoForm.duration" min="1" placeholder="15">
            </div>
            <div class="form-group">
              <label>Completion Threshold (%)</label>
              <input type="number" v-model="videoForm.completion_threshold" min="50" max="100" placeholder="95">
              <p class="form-hint">% of video to watch</p>
            </div>
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="videoForm.is_required">
              <span>Required for completion</span>
            </label>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn-secondary">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="saving || uploading">
              {{ saving ? 'Saving...' : (editingVideo ? 'Update' : 'Add Video') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../api/axios'

const loading = ref(true)
const error = ref(null)
const videos = ref([])
const showAddModal = ref(false)
const editingVideo = ref(null)
const saving = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const fileInput = ref(null)

const settings = ref({
  requireAllVideos: true,
  allowSkip: true,
  trackProgress: true,
  minWatchPercent: 80
})

const videoForm = ref({
  title: '',
  description: '',
  url: '',
  duration: null,
  order: 1,
  is_required: true,
  sourceType: 'url',
  uploadFile: null,
  completion_threshold: 95,
  training_task_id: 'training-acknowledgment',
})

onMounted(async () => {
  await loadSettings()
})

const loadSettings = async () => {
  loading.value = true
  error.value = null
  
  try {
    const res = await api.get('/onboarding/training-videos/settings')
    if (res.data) {
      videos.value = res.data.videos || []
      if (res.data.settings) {
        settings.value = { ...settings.value, ...res.data.settings }
      }
    }
  } catch (err) {
    console.error('Failed to load training settings:', err)
    error.value = 'Failed to load training settings'
  } finally {
    loading.value = false
  }
}

const saveSettings = async () => {
  try {
    await api.put('/onboarding/training-videos/settings', { settings: settings.value })
  } catch (err) {
    console.error('Failed to save settings:', err)
  }
}

const editVideo = (video) => {
  editingVideo.value = video
  videoForm.value = {
    title: video.title,
    description: video.description || '',
    url: video.url,
    duration: video.duration,
    order: video.order,
    is_required: video.is_required
  }
  showAddModal.value = true
}

const deleteVideo = async (id) => {
  if (!confirm('Delete this training video?')) return
  
  try {
    await api.delete(`/onboarding/training-videos/${id}`)
    videos.value = videos.value.filter(v => v.id !== id)
  } catch (err) {
    console.error('Failed to delete video:', err)
  }
}

const saveVideo = async () => {
  saving.value = true
  try {
    if (videoForm.value.sourceType === 'upload' && videoForm.value.uploadFile && !editingVideo.value) {
      uploading.value = true
      uploadProgress.value = 0
      
      const trainingTaskId = videoForm.value.training_task_id || 'training-acknowledgment'
      
      const formData = new FormData()
      formData.append('file', videoForm.value.uploadFile)
      formData.append('title', videoForm.value.title)
      formData.append('description', videoForm.value.description || '')
      formData.append('is_required', videoForm.value.is_required)
      formData.append('completion_threshold', videoForm.value.completion_threshold)
      formData.append('training_task_id', trainingTaskId)
      
      const progressInterval = setInterval(() => {
        if (uploadProgress.value < 90) {
          uploadProgress.value += 10
        }
      }, 200)
      
      try {
        const res = await api.post('/hr/training-videos/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        clearInterval(progressInterval)
        uploadProgress.value = 100
        
        videos.value.push({
          id: res.data.video_id,
          title: videoForm.value.title,
          description: videoForm.value.description,
          url: res.data.video_url,
          duration: videoForm.value.duration,
          is_required: videoForm.value.is_required,
          video_source: 'uploaded',
          completion_threshold: videoForm.value.completion_threshold,
          training_task_id: res.data.training_task_id,
        })
      } catch (err) {
        clearInterval(progressInterval)
        console.error('Upload failed:', err)
        alert('Failed to upload video. Please try again.')
      }
    } else {
      if (editingVideo.value) {
        try {
          await api.put(`/onboarding/training-videos/${editingVideo.value.id}`, {
            title: videoForm.value.title,
            description: videoForm.value.description,
            url: videoForm.value.url,
            duration: videoForm.value.duration,
            is_required: videoForm.value.is_required,
            completion_threshold: videoForm.value.completion_threshold,
          })
          const idx = videos.value.findIndex(v => v.id === editingVideo.value.id)
          if (idx >= 0) {
            videos.value[idx] = { 
              ...videos.value[idx], 
              title: videoForm.value.title,
              description: videoForm.value.description,
              url: videoForm.value.url,
              duration: videoForm.value.duration,
              is_required: videoForm.value.is_required,
              completion_threshold: videoForm.value.completion_threshold,
            }
          }
        } catch (err) {
          console.error('Failed to update video:', err)
          alert('Failed to update video')
        }
      } else {
        try {
          const res = await api.post('/onboarding/training-videos', {
            title: videoForm.value.title,
            description: videoForm.value.description,
            url: videoForm.value.url,
            duration: videoForm.value.duration,
            is_required: videoForm.value.is_required,
            completion_threshold: videoForm.value.completion_threshold,
            order: videoForm.value.order,
          })
          videos.value.push(res.data)
        } catch (err) {
          console.error('Failed to create video:', err)
          alert('Failed to create video')
        }
      }
    }
    closeModal()
  } finally {
    saving.value = false
    uploading.value = false
    uploadProgress.value = 0
  }
}

const closeModal = () => {
  showAddModal.value = false
  editingVideo.value = null
  videoForm.value = {
    title: '',
    description: '',
    url: '',
    duration: null,
    order: 1,
    is_required: true,
    sourceType: 'url',
    uploadFile: null,
    completion_threshold: 95,
    training_task_id: 'training-acknowledgment',
  }
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    const maxSize = 500 * 1024 * 1024 // 500MB
    if (file.size > maxSize) {
      alert('File too large. Maximum size is 500MB.')
      return
    }
    videoForm.value.uploadFile = file
  }
}

const clearFile = () => {
  videoForm.value.uploadFile = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
</script>

<style scoped>
.page-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 0.5rem 0;
}

.page-description {
  color: #94a3b8;
  margin: 0;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: #94a3b8;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #334155;
  border-top-color: #006e5b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-banner {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.retry-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
}

.section {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #f8fafc;
  margin: 0;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #94a3b8;
}

.empty-state svg {
  margin-bottom: 1rem;
  color: #64748b;
}

.empty-state h3 {
  color: #e2e8f0;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  margin: 0 0 1.5rem 0;
}

.video-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.video-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid #334155;
  border-radius: 0.5rem;
}

.video-thumbnail {
  width: 80px;
  height: 60px;
  background: #0f172a;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  flex-shrink: 0;
}

.video-info {
  flex: 1;
  min-width: 0;
}

.video-info h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #f8fafc;
  margin: 0 0 0.25rem 0;
}

.video-info p {
  font-size: 0.875rem;
  color: #94a3b8;
  margin: 0 0 0.5rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.video-meta {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.meta-badge {
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-weight: 500;
}

.meta-badge.required {
  background: rgba(0, 110, 91, 0.1);
  color: #006e5b;
}

.meta-badge.optional {
  background: rgba(148, 163, 184, 0.1);
  color: #94a3b8;
}

.meta-duration {
  font-size: 0.75rem;
  color: #64748b;
}

.video-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #006e5b;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #005a4a;
}

.btn-secondary {
  background: #334155;
  color: #e2e8f0;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
}

.btn-icon {
  background: transparent;
  border: 1px solid #334155;
  color: #94a3b8;
  padding: 0.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover {
  background: #334155;
  color: #e2e8f0;
}

.btn-icon.btn-danger:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #e2e8f0;
  margin-bottom: 0.5rem;
}

.form-group input[type="text"],
.form-group input[type="url"],
.form-group input[type="number"],
.form-group textarea {
  width: 100%;
  padding: 0.625rem 0.875rem;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 0.375rem;
  color: #f8fafc;
  font-size: 0.875rem;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #006e5b;
}

.form-hint {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.375rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 1.125rem;
  height: 1.125rem;
  accent-color: #006e5b;
}

.checkbox-label span {
  font-size: 0.875rem;
  color: #e2e8f0;
}

.range-input {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.range-input input[type="range"] {
  flex: 1;
  accent-color: #006e5b;
}

.range-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #006e5b;
  min-width: 3rem;
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
  z-index: 100;
}

.modal {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 1rem;
  width: 500px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #334155;
}

.modal-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #f8fafc;
  margin: 0;
}

.modal-body {
  padding: 1.5rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #334155;
}

/* Source tabs */
.source-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.source-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 0.5rem;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
}

.source-tab:hover {
  border-color: #006e5b;
  color: #e2e8f0;
}

.source-tab.active {
  background: #006e5b;
  border-color: #006e5b;
  color: white;
}

/* File upload area */
.file-upload-area {
  border: 2px dashed #334155;
  border-radius: 0.75rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #0f172a;
}

.file-upload-area:hover {
  border-color: #006e5b;
  background: rgba(0, 110, 91, 0.05);
}

.file-upload-area svg {
  color: #64748b;
  margin-bottom: 0.5rem;
}

.file-upload-area p {
  color: #e2e8f0;
  margin: 0.5rem 0;
}

.file-upload-area small {
  color: #64748b;
  font-size: 0.75rem;
}

/* File preview */
.file-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 0.5rem;
  padding: 1rem;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.file-info svg {
  color: #006e5b;
}

.file-name {
  color: #e2e8f0;
  font-weight: 500;
  margin: 0;
}

.file-size {
  color: #64748b;
  font-size: 0.75rem;
  margin: 0.25rem 0 0 0;
}

.btn-remove {
  background: transparent;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
}

.btn-remove:hover {
  background: rgba(239, 68, 68, 0.1);
}

/* Upload progress */
.upload-progress {
  margin-top: 1rem;
}

.upload-progress .progress-bar {
  height: 8px;
  background: #334155;
  border-radius: 4px;
  overflow: hidden;
}

.upload-progress .progress-fill {
  height: 100%;
  background: #006e5b;
  transition: width 0.3s;
}

.progress-text {
  color: #94a3b8;
  font-size: 0.75rem;
  margin: 0.5rem 0 0 0;
  text-align: center;
}
</style>
