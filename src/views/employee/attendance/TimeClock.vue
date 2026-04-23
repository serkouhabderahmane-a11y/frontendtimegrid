<template>
  <div class="attendance-clock">
    <header class="page-header">
      <div>
        <h1>Time Clock</h1>
        <p>Track your daily attendance</p>
      </div>
    </header>

    <div class="clock-container">
      <div class="clock-card">
        <div class="current-time">{{ currentTime }}</div>
        <div class="current-date">{{ currentDate }}</div>

        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Checking attendance status...</p>
        </div>

        <div v-else-if="error" class="error-state">
          <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p>{{ error }}</p>
          <button @click="fetchTodayAttendance" class="btn btn-secondary">Retry</button>
        </div>

        <div v-else class="clock-actions">
          <div v-if="!todayAttendance" class="clock-in-section">
            <button @click="handleClockIn" :disabled="clocking" class="btn btn-clock btn-clock-in">
              <svg v-if="!clocking" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
              </svg>
              <div v-else class="spinner-small"></div>
              <span>{{ clocking ? 'Clocking In...' : 'Clock In' }}</span>
            </button>
            <p class="clock-hint">Start your work day</p>
          </div>

          <div v-else-if="!todayAttendance.clockOut" class="clock-out-section">
            <div class="session-info">
              <div class="session-stat">
                <span class="stat-label">Clocked In</span>
                <span class="stat-value">{{ formatTime(todayAttendance.clockIn) }}</span>
              </div>
              <div class="session-stat">
                <span class="stat-label">Duration</span>
                <span class="stat-value">{{ workDuration }}</span>
              </div>
            </div>
            <button @click="handleClockOut" :disabled="clocking" class="btn btn-clock btn-clock-out">
              <svg v-if="!clocking" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              <div v-else class="spinner-small"></div>
              <span>{{ clocking ? 'Clocking Out...' : 'Clock Out' }}</span>
            </button>
            <p class="clock-hint">End your work day</p>
          </div>

          <div v-else class="completed-section">
            <div class="completed-badge">
              <svg class="w-16 h-16 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3>Work Day Completed</h3>
            <div class="session-info">
              <div class="session-stat">
                <span class="stat-label">Clocked In</span>
                <span class="stat-value">{{ formatTime(todayAttendance.clockIn) }}</span>
              </div>
              <div class="session-stat">
                <span class="stat-label">Clocked Out</span>
                <span class="stat-value">{{ formatTime(todayAttendance.clockOut) }}</span>
              </div>
              <div class="session-stat">
                <span class="stat-label">Total Hours</span>
                <span class="stat-value">{{ formatMinutes(todayAttendance.totalMinutes) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="status-cards">
        <div class="status-card" :class="{ warning: todayAttendance?.isLate }">
          <div class="status-icon">
            <svg v-if="todayAttendance?.isLate" class="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <svg v-else class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="status-content">
            <span class="status-label">Status</span>
            <span class="status-value">{{ getStatusText() }}</span>
          </div>
        </div>

        <div v-if="todayAttendance?.isHolidayWork" class="status-card highlight">
          <div class="status-icon">
            <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
            </svg>
          </div>
          <div class="status-content">
            <span class="status-label">Holiday Work</span>
            <span class="status-value">Marked for OT</span>
          </div>
        </div>
      </div>
    </div>

    <div class="quick-stats">
      <h2>This Week</h2>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-value">{{ weekStats.workedDays || 0 }}</span>
          <span class="stat-label">Days Worked</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ weekStats.totalHours || 0 }}h</span>
          <span class="stat-label">Total Hours</span>
        </div>
        <div class="stat-item" :class="{ warning: weekStats.lateDays > 0 }">
          <span class="stat-value">{{ weekStats.lateDays || 0 }}</span>
          <span class="stat-label">Late Arrivals</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../../../stores/auth'
import api from '../../../api/axios'

const authStore = useAuthStore()

const loading = ref(true)
const error = ref(null)
const clocking = ref(false)
const todayAttendance = ref(null)
const weekStats = ref({ workedDays: 0, totalHours: 0, lateDays: 0 })
const currentTime = ref('')
const currentDate = ref('')

let timeInterval = null

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  currentDate.value = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

const workDuration = computed(() => {
  if (!todayAttendance.value?.clockIn) return '00:00:00'
  const now = new Date()
  const start = new Date(todayAttendance.value.clockIn)
  const diff = Math.floor((now - start) / 1000)
  const hours = Math.floor(diff / 3600)
  const minutes = Math.floor((diff % 3600) / 60)
  const seconds = diff % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

const formatTime = (date) => {
  if (!date) return '--:--'
  return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

const formatMinutes = (minutes) => {
  if (!minutes) return '0h 0m'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

const getStatusText = () => {
  if (!todayAttendance.value) return 'Not Clocked In'
  if (todayAttendance.value.isLate) return 'Late Arrival'
  if (todayAttendance.value.isEarlyLeave) return 'Early Departure'
  if (todayAttendance.value.clockOut) return 'Completed'
  return 'Working'
}

const fetchTodayAttendance = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await api.get('/api/attendance/today')
    todayAttendance.value = response.data
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to fetch attendance'
  } finally {
    loading.value = false
  }
}

const fetchWeekStats = async () => {
  try {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const response = await api.get('/api/attendance/my-stats', {
      params: {
        startDate: startOfWeek.toISOString(),
        endDate: today.toISOString()
      }
    })
    weekStats.value = {
      workedDays: response.data.presentDays || 0,
      totalHours: response.data.totalHours || 0,
      lateDays: response.data.lateCount || 0
    }
  } catch (err) {
    console.error('Failed to fetch week stats:', err)
  }
}

const handleClockIn = async () => {
  clocking.value = true
  try {
    const response = await api.post('/api/attendance/clock-in', {
      deviceType: navigator.platform
    })
    todayAttendance.value = response.data
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to clock in'
  } finally {
    clocking.value = false
  }
}

const handleClockOut = async () => {
  clocking.value = true
  try {
    const response = await api.post('/api/attendance/clock-out', {})
    todayAttendance.value = response.data
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to clock out'
  } finally {
    clocking.value = false
  }
}

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
  fetchTodayAttendance()
  fetchWeekStats()
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
.attendance-clock {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
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

.clock-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.clock-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
}

.current-time {
  font-size: 3.5rem;
  font-weight: 700;
  color: #f8fafc;
  font-variant-numeric: tabular-nums;
}

.current-date {
  font-size: 1rem;
  color: #94a3b8;
  margin-bottom: 2rem;
}

.loading-state, .error-state {
  padding: 2rem;
}

.error-state {
  color: #ef4444;
}

.error-state svg {
  margin: 0 auto 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #334155;
  border-top-color: #006e5b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.spinner-small {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.clock-actions {
  padding: 1rem 0;
}

.clock-hint {
  color: #64748b;
  font-size: 0.875rem;
  margin-top: 0.75rem;
}

.btn-clock {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  border: none;
  font-weight: 700;
  font-size: 1.125rem;
  cursor: pointer;
  transition: all 0.3s;
  margin: 0 auto;
}

.btn-clock:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-clock-in {
  background: linear-gradient(135deg, #006e5b, #005a4a);
  color: white;
}

.btn-clock-in:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(0, 110, 91, 0.4);
}

.btn-clock-out {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.btn-clock-out:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
}

.session-info {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.session-stat {
  text-align: center;
}

.session-stat .stat-label {
  display: block;
  color: #64748b;
  font-size: 0.75rem;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}

.session-stat .stat-value {
  color: #f8fafc;
  font-size: 1.25rem;
  font-weight: 600;
}

.completed-section {
  padding: 1rem;
}

.completed-badge {
  margin-bottom: 1rem;
}

.completed-section h3 {
  color: #f8fafc;
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.status-cards {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.status-card {
  flex: 1;
  min-width: 200px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 0.75rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.status-card.warning {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
}

.status-card.highlight {
  border-color: #8b5cf6;
  background: rgba(139, 92, 246, 0.1);
}

.status-icon {
  flex-shrink: 0;
}

.status-content {
  display: flex;
  flex-direction: column;
}

.status-content .status-label {
  color: #64748b;
  font-size: 0.75rem;
  text-transform: uppercase;
}

.status-content .status-value {
  color: #f8fafc;
  font-weight: 600;
}

.quick-stats {
  margin-top: 2rem;
}

.quick-stats h2 {
  color: #f8fafc;
  font-size: 1.125rem;
  margin-bottom: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat-item {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 0.75rem;
  padding: 1.25rem;
  text-align: center;
}

.stat-item.warning {
  border-color: #f59e0b;
}

.stat-item .stat-value {
  display: block;
  font-size: 1.75rem;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 0.25rem;
}

.stat-item.warning .stat-value {
  color: #f59e0b;
}

.stat-item .stat-label {
  color: #64748b;
  font-size: 0.875rem;
}

.btn {
  padding: 0.625rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: #334155;
  color: #f8fafc;
  border: none;
}

.btn-secondary:hover {
  background: #475569;
}
</style>
