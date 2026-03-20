<template>
  <div class="timeclock-page">
    <!-- Demo Banner -->
    <div v-if="isDemo" class="demo-banner">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <span>Demo Mode - Clock actions are disabled</span>
    </div>

    <div class="clock-container">
      <div class="clock-card">
        <div class="clock-header">
          <h1>Time Clock</h1>
          <p>{{ authStore.fullName }}</p>
        </div>
        
        <div class="current-time">{{ currentTime }}</div>
        
        <div v-if="todayEntry" class="entry-info">
          <div class="entry-status" :class="{ active: !todayEntry.clockOut }">
            <span class="status-dot"></span>
            {{ todayEntry.clockOut ? 'Clocked Out' : 'Currently Working' }}
          </div>
          <div class="entry-details">
            <div class="detail-item">
              <span class="detail-label">Clocked In</span>
              <span class="detail-value">{{ formatTime(todayEntry.clockIn) }}</span>
            </div>
            <div v-if="todayEntry.clockOut" class="detail-item">
              <span class="detail-label">Clocked Out</span>
              <span class="detail-value">{{ formatTime(todayEntry.clockOut) }}</span>
            </div>
            <div v-else class="detail-item">
              <span class="detail-label">Duration</span>
              <span class="detail-value duration">{{ calculateDuration(todayEntry.clockIn) }}</span>
            </div>
          </div>
        </div>
        
        <div class="clock-actions">
          <Transition name="pulse" mode="out-in">
            <button
              v-if="!todayEntry?.clockOut"
              @click="handleClockIn"
              class="clock-btn clock-in"
              :disabled="loading"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              {{ loading ? 'Clocking In...' : 'Clock In' }}
            </button>
            <button
              v-if="todayEntry && !todayEntry.clockOut"
              @click="handleClockOut"
              class="clock-btn clock-out"
              :disabled="loading"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              {{ loading ? 'Clocking Out...' : 'Clock Out' }}
            </button>
          </Transition>
        </div>

        <div v-if="todayEntry?.clockOut" class="completed-message">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>You're all done for today!</span>
        </div>
      </div>
      
      <!-- Recent Entries -->
      <div class="entries-card">
        <h2>Recent Entries</h2>
        <div class="entries-list">
          <div v-for="entry in entries" :key="entry.id" class="entry-row">
            <div class="entry-date">
              <span class="date-day">{{ formatDate(entry.clockIn) }}</span>
            </div>
            <div class="entry-time">
              <span>{{ formatTime(entry.clockIn) }} - {{ entry.clockOut ? formatTime(entry.clockOut) : 'Active' }}</span>
            </div>
            <div class="entry-duration">
              {{ entry.totalMinutes ? formatMinutes(entry.totalMinutes) : calculateDuration(entry.clockIn) }}
            </div>
          </div>
          <div v-if="entries.length === 0" class="no-entries">
            No recent entries
          </div>
        </div>
      </div>
    </div>

    <Transition name="slide">
      <div v-if="error" class="error-toast">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        {{ error }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import api from '../../api/axios'

const authStore = useAuthStore()

const currentTime = ref('')
const todayEntry = ref(null)
const entries = ref([])
const loading = ref(false)
const error = ref('')

const isDemo = computed(() => authStore.isDemo || authStore.accessToken?.startsWith('demo-'))

let timeInterval

const updateTime = () => {
  currentTime.value = new Date().toLocaleTimeString()
}

const formatTime = (date) => new Date(date).toLocaleTimeString()
const formatDate = (date) => new Date(date).toLocaleDateString()

const formatMinutes = (minutes) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

const calculateDuration = (clockIn) => {
  const diff = Date.now() - new Date(clockIn).getTime()
  const minutes = Math.floor(diff / 60000)
  return formatMinutes(minutes)
}

const fetchTodayEntry = async () => {
  // Demo mode - use mock data
  if (authStore.isDemo || authStore.accessToken?.startsWith('demo-')) {
    todayEntry.value = null
    return
  }
  
  try {
    const response = await api.get('/time-entries/today')
    todayEntry.value = response.data
  } catch (err) {
    console.error('Failed to fetch today entry:', err)
    // Fallback to null (no clocked in)
    todayEntry.value = null
  }
}

const fetchEntries = async () => {
  // Demo mode - use mock data
  if (authStore.isDemo || authStore.accessToken?.startsWith('demo-')) {
    entries.value = [
      { id: '1', clockIn: new Date(Date.now() - 86400000).toISOString(), clockOut: new Date(Date.now() - 86400000 + 28800000).toISOString(), totalMinutes: 480 },
      { id: '2', clockIn: new Date(Date.now() - 172800000).toISOString(), clockOut: new Date(Date.now() - 172800000 + 32400000).toISOString(), totalMinutes: 540 },
      { id: '3', clockIn: new Date(Date.now() - 259200000).toISOString(), clockOut: new Date(Date.now() - 259200000 + 28800000).toISOString(), totalMinutes: 480 },
    ]
    return
  }
  
  try {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 7)
    const response = await api.get('/time-entries', {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    })
    entries.value = response.data || []
  } catch (err) {
    console.error('Failed to fetch entries:', err)
    entries.value = []
  }
}

const handleClockIn = async () => {
  if (authStore.isDemo || authStore.accessToken?.startsWith('demo-')) {
    error.value = 'Clock in/out is disabled in demo mode'
    setTimeout(() => error.value = '', 3000)
    return
  }
  
  loading.value = true
  error.value = ''
  try {
    const response = await api.post('/time-entries/clock-in')
    todayEntry.value = response.data
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to clock in'
    setTimeout(() => error.value = '', 5000)
  } finally {
    loading.value = false
  }
}

const handleClockOut = async () => {
  if (authStore.isDemo || authStore.accessToken?.startsWith('demo-')) {
    error.value = 'Clock in/out is disabled in demo mode'
    setTimeout(() => error.value = '', 3000)
    return
  }
  
  loading.value = true
  error.value = ''
  try {
    const response = await api.post('/time-entries/clock-out')
    todayEntry.value = response.data
    await fetchEntries()
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to clock out'
    setTimeout(() => error.value = '', 5000)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
  fetchTodayEntry()
  fetchEntries()
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
})
</script>

<style scoped>
.timeclock-page {
  min-height: calc(100vh - 65px);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.demo-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: linear-gradient(90deg, rgba(66, 184, 131, 0.15), rgba(66, 184, 131, 0.05));
  border: 1px solid rgba(66, 184, 131, 0.3);
  color: #42b883;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  font-weight: 500;
  max-width: 500px;
  width: 100%;
}

.clock-container {
  max-width: 500px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.clock-card {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border: 1px solid #334155;
  border-radius: 1.5rem;
  padding: 2.5rem;
  text-align: center;
}

.clock-header {
  margin-bottom: 1.5rem;
}

.clock-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 0.25rem;
}

.clock-header p {
  color: #94a3b8;
}

.current-time {
  font-size: 4rem;
  font-weight: 700;
  color: #f8fafc;
  font-variant-numeric: tabular-nums;
  margin-bottom: 1.5rem;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.entry-info {
  background: #0f172a;
  border-radius: 1rem;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.entry-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #94a3b8;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.entry-status.active {
  color: #42b883;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.entry-status.active .status-dot {
  animation: blink 1s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.entry-details {
  display: flex;
  justify-content: space-around;
}

.detail-item {
  text-align: center;
}

.detail-label {
  display: block;
  color: #64748b;
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
}

.detail-value {
  color: #e2e8f0;
  font-weight: 600;
}

.detail-value.duration {
  color: #42b883;
}

.clock-actions {
  display: flex;
  justify-content: center;
}

.clock-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 3rem;
  font-size: 1.125rem;
  font-weight: 600;
  border: none;
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clock-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.clock-in {
  background: linear-gradient(135deg, #42b883, #359268);
  color: white;
}

.clock-in:hover:not(:disabled) {
  background: linear-gradient(135deg, #359268, #2d7a5a);
}

.clock-out {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.clock-out:hover:not(:disabled) {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
}

.clock-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.completed-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  color: #42b883;
  font-weight: 500;
}

/* Pulse Animation */
.pulse-enter-active,
.pulse-leave-active {
  transition: all 0.3s ease;
}

.pulse-enter-from,
.pulse-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Entries Card */
.entries-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 1rem;
  padding: 1.5rem;
}

.entries-card h2 {
  color: #f8fafc;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.entries-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.entry-row {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background: #0f172a;
  border-radius: 0.5rem;
  transition: background 0.2s;
}

.entry-row:hover {
  background: #1e293b;
}

.entry-date {
  width: 80px;
}

.date-day {
  color: #94a3b8;
  font-size: 0.875rem;
}

.entry-time {
  flex: 1;
  color: #e2e8f0;
  font-size: 0.875rem;
}

.entry-duration {
  color: #42b883;
  font-weight: 600;
  font-size: 0.875rem;
}

.no-entries {
  text-align: center;
  color: #64748b;
  padding: 2rem;
}

/* Error Toast */
.error-toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #ef4444;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 10px 30px rgba(239, 68, 68, 0.3);
  z-index: 100;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}
</style>
