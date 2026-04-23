<template>
  <div class="approvals-page">
    <header class="page-header">
      <div>
        <h1>Approval Queue</h1>
        <p>Review and approve pending onboarding tasks</p>
      </div>
    </header>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <span>Loading approvals...</span>
    </div>
    
    <div v-else-if="approvals.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
      <h3>All caught up!</h3>
      <p>No pending approvals at the moment</p>
    </div>
    
    <div v-else class="approvals-list">
      <TransitionGroup name="list">
        <div v-for="item in approvals" :key="item.id" class="approval-card">
          <div class="approval-header">
            <div class="task-info">
              <div class="task-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div>
                <h3>{{ item.task?.name }}</h3>
                <span class="candidate-name">
                  {{ item.onboarding?.candidate?.firstName }} {{ item.onboarding?.candidate?.lastName }}
                </span>
              </div>
            </div>
            <span class="submitted-date">Submitted {{ formatDate(item.submittedAt) }}</span>
          </div>
          
          <div v-if="item.submissionData" class="submission-preview">
            <pre>{{ formatSubmission(item.submissionData) }}</pre>
          </div>

          <div class="approval-actions">
            <button @click="handleApprove(item)" class="btn-approve">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              Approve
            </button>
            <button @click="showRejectModal(item)" class="btn-reject">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              Reject
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- Reject Modal -->
    <Transition name="modal">
      <div v-if="rejectingItem" class="modal-overlay" @click.self="rejectingItem = null">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Reject Task</h2>
            <button @click="rejectingItem = null" class="close-btn">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <p class="reject-label">Please provide a reason for rejection:</p>
            <textarea 
              v-model="rejectReason" 
              placeholder="Enter rejection reason..."
              rows="4"
            ></textarea>
          </div>
          <div class="modal-footer">
            <button @click="rejectingItem = null" class="btn-cancel">Cancel</button>
            <button @click="handleReject" class="btn-reject-confirm">Reject Task</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useHrDashboardStore } from '../../stores/hrDashboard'
import { useOnboardingStore } from '../../stores/onboarding'

const authStore = useAuthStore()
const hrStore = useHrDashboardStore()
const onboardingStore = useOnboardingStore()

const loading = computed(() => hrStore.loading)
const approvals = computed(() => hrStore.approvalQueue)
const rejectingItem = ref(null)
const rejectReason = ref('')

const formatDate = (date) => {
  if (!date) return 'N/A'
  const d = new Date(date)
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const formatSubmission = (data) => {
  try {
    return JSON.stringify(JSON.parse(data), null, 2)
  } catch {
    return data
  }
}

const handleApprove = async (item) => {
  try {
    await onboardingStore.approveTask(
      item.onboardingId,
      item.taskId,
      authStore.user.tenantId,
      ''
    )
    await hrStore.fetchApprovalQueue(authStore.user.tenantId)
  } catch (error) {
    alert('Failed to approve: ' + error.message)
  }
}

const showRejectModal = (item) => {
  rejectingItem.value = item
  rejectReason.value = ''
}

const handleReject = async () => {
  if (!rejectReason.value.trim()) {
    alert('Please provide a rejection reason')
    return
  }
  try {
    await onboardingStore.rejectTask(
      rejectingItem.value.onboardingId,
      rejectingItem.value.taskId,
      authStore.user.tenantId,
      rejectReason.value
    )
    rejectingItem.value = null
    await hrStore.fetchApprovalQueue(authStore.user.tenantId)
  } catch (error) {
    alert('Failed to reject: ' + error.message)
  }
}

onMounted(async () => {
  await hrStore.fetchApprovalQueue(authStore.user.tenantId)
})
</script>

<style scoped>
.approvals-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
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

.loading {
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

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 1rem;
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
  background: rgba(0, 110, 91, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #006e5b;
}

.empty-icon svg {
  width: 32px;
  height: 32px;
}

.empty-state h3 {
  color: #f8fafc;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #94a3b8;
}

.approvals-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.approval-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 1rem;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.approval-card:hover {
  border-color: #006e5b;
  transform: translateY(-2px);
}

.approval-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.task-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.task-icon {
  width: 3rem;
  height: 3rem;
  background: rgba(0, 110, 91, 0.1);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #006e5b;
}

.task-icon svg {
  width: 1.5rem;
  height: 1.5rem;
}

.task-info h3 {
  color: #f8fafc;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.candidate-name {
  color: #94a3b8;
  font-size: 0.875rem;
}

.submitted-date {
  color: #64748b;
  font-size: 0.75rem;
}

.submission-preview {
  background: #0f172a;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  max-height: 200px;
  overflow: auto;
}

.submission-preview pre {
  color: #e2e8f0;
  font-size: 0.75rem;
  font-family: monospace;
  white-space: pre-wrap;
  margin: 0;
}

.approval-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-approve, .btn-reject {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-approve {
  background: #006e5b;
  color: white;
  border: none;
}

.btn-approve:hover {
  background: #005a4a;
}

.btn-reject {
  background: transparent;
  color: #ef4444;
  border: 1px solid #ef4444;
}

.btn-reject:hover {
  background: rgba(239, 68, 68, 0.1);
}

.btn-approve svg, .btn-reject svg {
  width: 1rem;
  height: 1rem;
}

/* List Animation */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
}

.modal-content {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 1rem;
  width: 100%;
  max-width: 450px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #334155;
}

.modal-header h2 {
  color: #f8fafc;
  font-size: 1.25rem;
}

.close-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.25rem;
}

.modal-body {
  padding: 1.5rem;
}

.reject-label {
  color: #e2e8f0;
  margin-bottom: 0.75rem;
}

.modal-body textarea {
  width: 100%;
  padding: 0.75rem;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 0.5rem;
  color: #f8fafc;
  font-size: 0.875rem;
  resize: vertical;
}

.modal-body textarea:focus {
  outline: none;
  border-color: #006e5b;
}

.modal-footer {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid #334155;
}

.btn-cancel {
  padding: 0.625rem 1rem;
  background: transparent;
  border: 1px solid #334155;
  color: #e2e8f0;
  border-radius: 0.5rem;
  cursor: pointer;
}

.btn-cancel:hover {
  background: #334155;
}

.btn-reject-confirm {
  padding: 0.625rem 1rem;
  background: #ef4444;
  border: none;
  color: white;
  border-radius: 0.5rem;
  cursor: pointer;
}

.btn-reject-confirm:hover {
  background: #dc2626;
}

/* Modal Animation */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
