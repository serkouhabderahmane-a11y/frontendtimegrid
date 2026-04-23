<template>
  <div class="onboarding-container">
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="error">
      <h2>Error</h2>
      <p>{{ error }}</p>
    </div>
    <div v-else-if="onboarding" class="onboarding">
      <header class="onboarding-header">
        <h1>Welcome, {{ onboarding.candidate?.firstName }}!</h1>
        <p class="subtitle">Complete your onboarding to get started</p>
      </header>

      <div class="progress-section">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: onboarding.progressPercent + '%' }"></div>
        </div>
        <span class="progress-text">{{ onboarding.progressPercent }}% Complete</span>
      </div>

      <div class="state-indicator">
        <span class="badge" :class="onboarding.currentState">
          {{ formatState(onboarding.currentState) }}
        </span>
      </div>

      <div class="tasks-list">
        <h2>Onboarding Tasks</h2>
        <div v-for="task in tasks" :key="task.taskId" class="task-card" :class="task.status">
          <div class="task-header">
            <h3>{{ task.taskName }}</h3>
            <span class="task-status" :class="task.status">{{ formatStatus(task.status) }}</span>
          </div>
          
          <div class="task-content">
            <component
              :is="getTaskComponent(task.taskType)"
              :task="task"
              :submission-data="task.submissionData"
              @save="handleSaveDraft(task.taskId, $event)"
              @submit="handleSubmit(task.taskId, $event)"
            />
          </div>

          <div v-if="task.status === 'rejected'" class="rejection-reason">
            <strong>Rejection Reason:</strong>
            <p>{{ task.reviewComment }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useOnboardingStore } from '../../stores/onboarding'
import PersonalInfoTask from '../../components/employee/tasks/PersonalInfoTask.vue'
import DocumentUploadTask from '../../components/employee/tasks/DocumentUploadTask.vue'
import PolicyAcknowledgmentTask from '../../components/employee/tasks/PolicyAcknowledgmentTask.vue'
import ESignatureTask from '../../components/employee/tasks/ESignatureTask.vue'
import RoleConfirmationTask from '../../components/employee/tasks/RoleConfirmationTask.vue'

const route = useRoute()
const onboardingStore = useOnboardingStore()

const loading = computed(() => onboardingStore.loading)
const error = computed(() => onboardingStore.error)
const onboarding = computed(() => onboardingStore.onboarding)
const tasks = computed(() => onboardingStore.tasks)

const formatState = (state) => {
  const states = {
    candidate_created: 'Candidate Created',
    packet_assigned: 'Packet Assigned',
    in_progress: 'In Progress',
    pending_hr_review: 'Pending HR Review',
    approved: 'Approved',
    employee_active: 'Active Employee',
  }
  return states[state] || state
}

const formatStatus = (status) => {
  const statuses = {
    draft: 'Draft',
    submitted: 'Submitted',
    approved: 'Approved',
    rejected: 'Rejected',
  }
  return statuses[status] || status
}

const getTaskComponent = (type) => {
  const components = {
    personal_info: PersonalInfoTask,
    document_upload: DocumentUploadTask,
    policy_acknowledgment: PolicyAcknowledgmentTask,
    e_signature: ESignatureTask,
    role_confirmation: RoleConfirmationTask,
  }
  return components[type] || null
}

const handleSaveDraft = async (taskId, data) => {
  await onboardingStore.saveDraft(onboarding.value.id, taskId, onboarding.value.tenantId, data)
}

const handleSubmit = async (taskId, data) => {
  await onboardingStore.submitTask(onboarding.value.id, taskId, onboarding.value.tenantId, data)
}

onMounted(async () => {
  const token = route.params.token
  await onboardingStore.fetchByToken(token)
})
</script>

<style scoped>
.onboarding-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
}

.error {
  color: #e74c3c;
}

.onboarding-header {
  text-align: center;
  margin-bottom: 2rem;
}

.subtitle {
  color: #666;
}

.progress-section {
  margin-bottom: 1.5rem;
}

.progress-bar {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: #006e5b;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.875rem;
  color: #666;
}

.state-indicator {
  text-align: center;
  margin-bottom: 2rem;
}

.badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.badge.candidate_created { background: #e3f2fd; color: #1976d2; }
.badge.packet_assigned { background: #fff3e0; color: #f57c00; }
.badge.in_progress { background: #f3e5f5; color: #7b1fa2; }
.badge.pending_hr_review { background: #fff8e1; color: #ffa000; }
.badge.approved { background: #e8f5e9; color: #388e3c; }
.badge.employee_active { background: #006e5b; color: white; }

.tasks-list h2 {
  margin-bottom: 1rem;
}

.task-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.task-card.approved {
  border-color: #006e5b;
}

.task-card.rejected {
  border-color: #e74c3c;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.task-status {
  font-size: 0.875rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
}

.task-status.draft { background: #f5f5f5; color: #666; }
.task-status.submitted { background: #fff3e0; color: #f57c00; }
.task-status.approved { background: #e8f5e9; color: #388e3c; }
.task-status.rejected { background: #ffebee; color: #c62828; }

.rejection-reason {
  margin-top: 1rem;
  padding: 1rem;
  background: #ffebee;
  border-radius: 4px;
  color: #c62828;
}
</style>
