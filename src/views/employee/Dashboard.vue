<template>
  <div class="dashboard">
    <!-- Demo Mode Banner -->
    <div v-if="isDemo" class="demo-banner">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <span>Demo Mode - {{ demoRoleLabel }} View</span>
    </div>

    <header class="page-header">
      <div>
        <h1>Hello, {{ userName }}</h1>
        <p>{{ welcomeMessage }}</p>
      </div>
      <div class="clock-status" :class="clockStatusClass">
        <span class="status-dot"></span>
        <span>{{ clockStatusText }}</span>
      </div>
    </header>

    <!-- Error State -->
    <div v-if="hasError" class="error-banner">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Clock In/Out Card -->
    <div class="clock-card" :class="{ 'clocked-in': isClockedIn }">
      <div class="clock-time">
        <span class="time">{{ currentTime }}</span>
        <span class="date">{{ currentDate }}</span>
      </div>
      <button 
        class="clock-btn" 
        :class="isClockedIn ? 'clock-out' : 'clock-in'"
        @click="handleClockAction"
        :disabled="isDemo"
      >
        {{ isClockedIn ? 'Clock Out' : 'Clock In' }}
      </button>
      <div v-if="isDemo" class="demo-notice">
        Clock actions disabled in demo mode
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="section">
      <h2 class="section-title">Quick Actions</h2>
      <div class="actions-grid">
        <router-link to="/employee/timeclock" class="action-card">
          <div class="action-icon blue">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <span class="action-label">Time Clock</span>
        </router-link>
        
        <div class="action-card" @click="handleAddNote" :class="{ disabled: isDemo }">
          <div class="action-icon green">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </div>
          <span class="action-label">Add Note</span>
        </div>
        
        <router-link to="/onboarding" class="action-card">
          <div class="action-icon purple">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <span class="action-label">Onboarding</span>
        </router-link>
      </div>
    </div>

    <!-- Assigned Participants (for nurses/staff) -->
    <div v-if="showParticipants" class="section">
      <h2 class="section-title">My Assignments</h2>
      <div class="participants-list">
        <div v-for="participant in participants" :key="participant.id" class="participant-card">
          <div class="participant-avatar">
            {{ participant.initials }}
          </div>
          <div class="participant-info">
            <span class="participant-name">{{ participant.name }}</span>
            <span class="participant-type">{{ participant.type }}</span>
          </div>
          <button class="view-btn">View</button>
        </div>
        <div v-if="!participants.length" class="empty-state">
          <span>No assignments found</span>
        </div>
      </div>
    </div>

    <!-- Today's Notes -->
    <div class="section">
      <h2 class="section-title">Today's Notes</h2>
      <div class="notes-list">
        <div v-for="note in recentNotes" :key="note.id" class="note-card">
          <p class="note-content">{{ note.content }}</p>
          <span class="note-time">{{ note.time }}</span>
        </div>
        <div v-if="!recentNotes.length" class="empty-state">
          <span>No notes for today</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()

// State
const hasError = ref(false)
const errorMessage = ref('')
const isClockedIn = ref(false)
const clockInTime = ref(null)
const currentTime = ref('')
const currentDate = ref('')
const participants = ref([])
const recentNotes = ref([])
let timeInterval = null

// Computed
const isDemo = computed(() => authStore.accessToken?.startsWith('demo-') || authStore.isDemo)

const userName = computed(() => {
  const user = authStore.user
  if (user?.firstName && user?.lastName) {
    return `${user.firstName} ${user.lastName}`
  }
  return authStore.user?.email?.split('@')[0] || 'User'
})

const demoRoleLabel = computed(() => {
  const labels = {
    'staff': 'Staff',
    'nurse': 'Nurse',
    'med_tech': 'Med Tech',
  }
  return labels[authStore.role] || 'Employee'
})

const welcomeMessage = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning!'
  if (hour < 18) return 'Good afternoon!'
  return 'Good evening!'
})

const clockStatusClass = computed(() => {
  return isClockedIn.value ? 'active' : 'inactive'
})

const clockStatusText = computed(() => {
  if (isClockedIn.value && clockInTime.value) {
    return `Clocked in at ${clockInTime.value}`
  }
  return 'Not clocked in'
})

const showParticipants = computed(() => {
  return ['nurse', 'med_tech', 'staff'].includes(authStore.role)
})

// Demo data
const demoParticipants = [
  { id: '1', name: 'John Smith', initials: 'JS', type: 'Patient' },
  { id: '2', name: 'Jane Doe', initials: 'JD', type: 'Patient' }
]

const demoNotes = [
  { id: '1', content: 'Patient showing improvement in condition', time: '10:30 AM' },
  { id: '2', content: 'Medication administered as scheduled', time: '09:15 AM' }
]

// Methods
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  currentDate.value = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

const handleClockAction = () => {
  if (isDemo.value) {
    alert('Clock in/out is disabled in demo mode')
    return
  }
  
  if (isClockedIn.value) {
    isClockedIn.value = false
    clockInTime.value = null
  } else {
    isClockedIn.value = true
    clockInTime.value = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }
}

const handleAddNote = () => {
  if (isDemo.value) {
    alert('Adding notes is disabled in demo mode')
    return
  }
  // Navigate to add note
}

const loadData = () => {
  // Load demo data
  if (isDemo.value) {
    participants.value = demoParticipants
    recentNotes.value = demoNotes
    isClockedIn.value = false
  }
}

const retry = () => {
  hasError.value = false
  loadData()
}

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
  loadData()
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
.dashboard {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

/* Demo Banner */
.demo-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: linear-gradient(90deg, rgba(66, 184, 131, 0.15), rgba(66, 184, 131, 0.05));
  border: 1px solid rgba(66, 184, 131, 0.3);
  color: #42b883;
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  font-weight: 500;
}

/* Error Banner */
.error-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
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

.clock-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.clock-status.active {
  background: rgba(66, 184, 131, 0.1);
  color: #42b883;
}

.clock-status.inactive {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

/* Clock Card */
.clock-card {
  background: #1e293b;
  border: 2px solid #334155;
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
}

.clock-card.clocked-in {
  border-color: #42b883;
  background: linear-gradient(180deg, rgba(66, 184, 131, 0.05) 0%, #1e293b 100%);
}

.clock-time {
  margin-bottom: 1.5rem;
}

.clock-time .time {
  display: block;
  font-size: 3rem;
  font-weight: 700;
  color: #f8fafc;
}

.clock-time .date {
  display: block;
  color: #94a3b8;
  margin-top: 0.5rem;
}

.clock-btn {
  padding: 1rem 3rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.clock-btn.clock-in {
  background: #42b883;
  color: white;
}

.clock-btn.clock-in:hover {
  background: #359268;
}

.clock-btn.clock-out {
  background: #ef4444;
  color: white;
}

.clock-btn.clock-out:hover {
  background: #dc2626;
}

.clock-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.demo-notice {
  margin-top: 1rem;
  color: #94a3b8;
  font-size: 0.875rem;
}

/* Section */
.section {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #f8fafc;
  margin-bottom: 1rem;
}

/* Actions Grid */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.action-card {
  background: #0f172a;
  border-radius: 0.5rem;
  padding: 1.25rem;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
}

.action-card:hover {
  background: #1e293b;
}

.action-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0.75rem;
}

.action-icon svg {
  width: 1.5rem;
  height: 1.5rem;
}

.action-icon.blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.action-icon.green { background: rgba(66, 184, 131, 0.1); color: #42b883; }
.action-icon.purple { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }

.action-label {
  display: block;
  color: #e2e8f0;
  font-weight: 500;
  font-size: 0.875rem;
}

/* Participants */
.participants-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.participant-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #0f172a;
  border-radius: 0.5rem;
  padding: 1rem;
}

.participant-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.participant-info {
  flex: 1;
}

.participant-name {
  display: block;
  color: #e2e8f0;
  font-weight: 500;
}

.participant-type {
  display: block;
  color: #94a3b8;
  font-size: 0.75rem;
}

.view-btn {
  background: #334155;
  color: #e2e8f0;
  border: none;
  padding: 0.375rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  cursor: pointer;
}

/* Notes */
.notes-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.note-card {
  background: #0f172a;
  border-radius: 0.5rem;
  padding: 1rem;
}

.note-content {
  color: #e2e8f0;
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.note-time {
  color: #64748b;
  font-size: 0.75rem;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 2rem;
  color: #64748b;
}
</style>
