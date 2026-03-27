<template>
  <div class="candidate-detail">
    <header class="page-header">
      <router-link to="/admin/candidates">← Back to Candidates</router-link>
      <h1>{{ candidate?.firstName }} {{ candidate?.lastName }}</h1>
    </header>

    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="candidate" class="candidate-info">
      <div class="info-card">
        <h2>Personal Information</h2>
        <p><strong>Email:</strong> {{ candidate.email }}</p>
        <p><strong>Phone:</strong> {{ candidate.phone || 'N/A' }}</p>
        <p><strong>Position:</strong> {{ candidate.position }}</p>
        <p><strong>Start Date:</strong> {{ formatDate(candidate.startDate) }}</p>
        <p><strong>Employment Type:</strong> {{ candidate.employmentType }}</p>
        <p><strong>Status:</strong> <span class="status-badge" :class="candidate.state">{{ formatState(candidate.state) }}</span></p>
      </div>

      <div class="workflow-card">
        <h2>Onboarding Workflow</h2>
        <div class="workflow-steps">
          <div class="workflow-step" :class="{ active: isStepActive('candidate_created'), completed: isStepCompleted('candidate_created') }">
            <div class="step-number">1</div>
            <div class="step-content">
              <span class="step-title">Candidate Created</span>
              <span class="step-desc">Candidate record created</span>
            </div>
          </div>
          <div class="workflow-step" :class="{ active: isStepActive('packet_assigned'), completed: isStepCompleted('packet_assigned') }">
            <div class="step-number">2</div>
            <div class="step-content">
              <span class="step-title">Packet Assigned</span>
              <span class="step-desc">Onboarding packet assigned</span>
            </div>
          </div>
          <div class="workflow-step" :class="{ active: isStepActive('in_progress'), completed: isStepCompleted('in_progress') }">
            <div class="step-number">3</div>
            <div class="step-content">
              <span class="step-title">In Progress</span>
              <span class="step-desc">Employee completing tasks</span>
            </div>
          </div>
          <div class="workflow-step" :class="{ active: isStepActive('pending_hr_review'), completed: isStepCompleted('pending_hr_review') }">
            <div class="step-number">4</div>
            <div class="step-content">
              <span class="step-title">HR Review</span>
              <span class="step-desc">Pending HR approval</span>
            </div>
          </div>
          <div class="workflow-step" :class="{ active: isStepActive('approved'), completed: isStepCompleted('approved') }">
            <div class="step-number">5</div>
            <div class="step-content">
              <span class="step-title">Approved</span>
              <span class="step-desc">All tasks approved</span>
            </div>
          </div>
          <div class="workflow-step" :class="{ active: isStepActive('employee_active'), completed: isStepCompleted('employee_active') }">
            <div class="step-number">6</div>
            <div class="step-content">
              <span class="step-title">Employee Active</span>
              <span class="step-desc">Can clock in</span>
            </div>
          </div>
        </div>

        <div class="workflow-actions">
          <button v-if="candidate.state === 'candidate_created'" @click="showAssignPacketModal = true" class="btn-primary">
            Assign Onboarding Packet
          </button>
          <template v-if="candidate.state === 'packet_assigned' || candidate.state === 'in_progress'">
            <button @click="openOnboardingPortal" class="btn-info">
              Open Employee Portal
            </button>
            <button @click="copyOnboardingLink" class="btn-secondary">
              {{ linkCopied ? 'Link Copied!' : 'Copy Link' }}
            </button>
            <button @click="openOnboardingPortalDirect" class="btn-secondary">
              Fill Data
            </button>
          </template>
          <button v-if="candidate.state === 'in_progress'" @click="transitionState('pending_hr_review')" class="btn-primary">
            Submit for HR Review
          </button>
          <button v-if="candidate.state === 'pending_hr_review'" @click="transitionState('approved')" class="btn-success">
            Approve & Activate
          </button>
          <span v-if="candidate.state === 'employee_active'" class="active-badge">Employee Active</span>
        </div>
      </div>

      <div v-if="candidate.onboarding" class="onboarding-card">
        <h2>Onboarding Progress</h2>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: (candidate.onboarding.progressPercent || 0) + '%' }"></div>
        </div>
        <p>{{ candidate.onboarding.progressPercent || 0 }}% Complete</p>

        <div v-if="candidate.onboarding.taskStatuses?.length" class="tasks-list">
          <h3>Tasks</h3>
          <div v-for="task in candidate.onboarding.taskStatuses" :key="task.taskId" class="task-item">
            <span>{{ task.task?.name }}</span>
            <span class="task-status" :class="task.status">{{ task.status }}</span>
          </div>
        </div>
      </div>
    </div>

    <Transition name="modal">
      <div v-if="showAssignPacketModal" class="modal-overlay" @click.self="showAssignPacketModal = false">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Assign Onboarding Packet</h2>
            <button @click="showAssignPacketModal = false" class="close-btn">×</button>
          </div>
          <form @submit.prevent="assignPacket" class="modal-form">
            <div class="form-group">
              <label>Select Packet</label>
              <select v-model="selectedPacketId" required>
                <option value="">Choose a packet...</option>
                <option value="1">Standard Employee Onboarding</option>
              </select>
            </div>
            <button type="submit" class="btn-primary">Assign & Send Invite</button>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useCandidatesStore } from '../../stores/candidates'
import api from '../../api/axios'

const route = useRoute()
const authStore = useAuthStore()
const candidatesStore = useCandidatesStore()

const loading = computed(() => candidatesStore.loading)
const candidate = computed(() => candidatesStore.currentCandidate)
const showAssignPacketModal = ref(false)
const selectedPacketId = ref('')
const linkCopied = ref(false)

const formatDate = (date) => date ? new Date(date).toLocaleDateString() : 'N/A'

const formatState = (state) => {
  const states = {
    'candidate_created': 'New',
    'packet_assigned': 'Assigned',
    'in_progress': 'In Progress',
    'pending_hr_review': 'Pending Review',
    'approved': 'Approved',
    'employee_active': 'Active'
  }
  return states[state] || state
}

const stateOrder = ['candidate_created', 'packet_assigned', 'in_progress', 'pending_hr_review', 'approved', 'employee_active']

const isStepActive = (step) => candidate.value?.state === step
const isStepCompleted = (step) => {
  const currentIndex = stateOrder.indexOf(candidate.value?.state)
  const stepIndex = stateOrder.indexOf(step)
  return stepIndex < currentIndex
}

const assignPacket = async () => {
  if (!selectedPacketId.value) return
  await candidatesStore.assignPacket(authStore.user.tenantId, candidate.value.id, selectedPacketId.value)
  showAssignPacketModal.value = false
  await candidatesStore.fetchCandidate(authStore.user.tenantId, route.params.id)
}

const transitionState = async (newState) => {
  await api.post(`/onboarding/${candidate.value.onboarding?.id}/transition`, { targetState: newState })
  await candidatesStore.fetchCandidate(authStore.user.tenantId, route.params.id)
}

const openOnboardingPortal = () => {
  if (candidate.value?.onboarding?.token) {
    window.open(`/onboarding/${candidate.value.onboarding.token}`, '_blank')
  }
}

const copyOnboardingLink = async () => {
  if (candidate.value?.onboarding?.token) {
    const link = `${window.location.origin}/onboarding/${candidate.value.onboarding.token}`
    try {
      await navigator.clipboard.writeText(link)
      linkCopied.value = true
      setTimeout(() => { linkCopied.value = false }, 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }
}

const openOnboardingPortalDirect = () => {
  if (candidate.value?.onboarding?.token) {
    window.location.href = `/onboarding/${candidate.value.onboarding.token}`
  }
}

onMounted(async () => {
  await candidatesStore.fetchCandidate(authStore.user.tenantId, route.params.id)
})
</script>

<style scoped>
.candidate-detail {
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header a {
  color: #42b883;
  text-decoration: none;
}

.info-card, .onboarding-card, .workflow-card {
  background: #1e293b;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  color: #f8fafc;
}

.workflow-steps {
  display: flex;
  gap: 0.5rem;
  margin: 1.5rem 0;
  overflow-x: auto;
}

.workflow-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 100px;
  opacity: 0.4;
}

.workflow-step.active {
  opacity: 1;
}

.workflow-step.completed {
  opacity: 0.7;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #334155;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.workflow-step.active .step-number {
  background: #42b883;
}

.workflow-step.completed .step-number {
  background: #42b883;
}

.step-content {
  text-align: center;
}

.step-title {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
}

.step-desc {
  display: block;
  font-size: 0.625rem;
  color: #94a3b8;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
}

.progress-bar {
  height: 8px;
  background: #334155;
  border-radius: 4px;
  margin: 1rem 0;
}

.progress-fill {
  height: 100%;
  background: #42b883;
  border-radius: 4px;
  transition: width 0.3s;
}

.task-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  border-bottom: 1px solid #334155;
}

.task-status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.task-status.approved { background: #22c55e; color: white; }
.task-status.submitted { background: #f59e0b; color: white; }
.task-status.rejected { background: #ef4444; color: white; }
.task-status.draft { background: #6b7280; color: white; }

.workflow-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #334155;
}

.btn-primary {
  background: #42b883;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.btn-info {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.btn-secondary {
  background: #6b7280;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.btn-secondary:hover {
  background: #4b5563;
}

.btn-success {
  background: #22c55e;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.active-badge {
  background: #22c55e;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-content {
  background: #1e293b;
  padding: 2rem;
  border-radius: 12px;
  width: 400px;
  color: #f8fafc;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.5rem;
  cursor: pointer;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #e2e8f0;
}

.form-group input, .form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #334155;
  border-radius: 6px;
  background: #0f172a;
  color: #f8fafc;
}
</style>
