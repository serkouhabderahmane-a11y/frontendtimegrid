<template>
  <div class="candidates-page">
    <header class="page-header">
      <div>
        <h1>Candidates</h1>
        <p>Manage your candidate pipeline</p>
      </div>
      <button @click="showAddModal = true" class="add-btn">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
        </svg>
        Add Candidate
      </button>
    </header>

    <div class="filters">
      <div class="search-input">
        <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input v-model="search" placeholder="Search candidates..." @input="handleSearch" />
      </div>
      <select v-model="stateFilter" @change="handleFilter" class="filter-select">
        <option value="">All States</option>
        <option value="candidate_created">New</option>
        <option value="packet_assigned">Assigned</option>
        <option value="in_progress">In Progress</option>
        <option value="pending_hr_review">Pending Review</option>
        <option value="approved">Approved</option>
        <option value="employee_active">Active</option>
      </select>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <span>Loading candidates...</span>
    </div>
    
    <div v-else class="table-container">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Position</th>
            <th>Start Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="candidate in candidates" :key="candidate.id" class="table-row">
            <td class="name-cell">
              <div class="avatar">{{ candidate.firstName[0] }}{{ candidate.lastName[0] }}</div>
              {{ candidate.firstName }} {{ candidate.lastName }}
            </td>
            <td>{{ candidate.email }}</td>
            <td>{{ candidate.position }}</td>
            <td>{{ formatDate(candidate.startDate) }}</td>
            <td>
              <span class="status-badge" :class="candidate.state">
                {{ formatState(candidate.state) }}
              </span>
            </td>
            <td>
              <router-link :to="`/admin/candidates/${candidate.id}`" class="view-link">View</router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <Transition name="modal">
      <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Add New Candidate</h2>
            <button @click="showAddModal = false" class="close-btn">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <form @submit.prevent="handleAddCandidate" class="modal-form">
            <div class="form-row">
              <div class="form-group">
                <label>First Name</label>
                <input v-model="newCandidate.firstName" placeholder="John" required />
              </div>
              <div class="form-group">
                <label>Last Name</label>
                <input v-model="newCandidate.lastName" placeholder="Doe" required />
              </div>
            </div>
            <div class="form-group">
              <label>Email</label>
              <input v-model="newCandidate.email" type="email" placeholder="john@example.com" required />
            </div>
            <div class="form-group">
              <label>Phone</label>
              <input v-model="newCandidate.phone" placeholder="+1 (555) 000-0000" />
            </div>
            <div class="form-group">
              <label>Position</label>
              <input v-model="newCandidate.position" placeholder="Software Engineer" required />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Employment Type</label>
                <select v-model="newCandidate.employmentType" required>
                  <option value="">Select type</option>
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="intern">Intern</option>
                </select>
              </div>
            <div class="form-group">
              <label>Start Date *</label>
              <DatePicker v-model="newCandidate.startDate" placeholder="Select start date" />
            </div>
            </div>
            <div class="modal-actions">
              <button type="button" @click="showAddModal = false" class="btn-cancel">Cancel</button>
              <button type="submit" :disabled="saving" class="btn-submit">
                {{ saving ? 'Adding...' : 'Add Candidate' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useCandidatesStore } from '../../stores/candidates'
import DatePicker from '../../components/DatePicker.vue'

const authStore = useAuthStore()
const candidatesStore = useCandidatesStore()

const search = ref('')
const stateFilter = ref('')
const showAddModal = ref(false)
const saving = ref(false)
const newCandidate = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  position: '',
  employmentType: '',
  startDate: '',
})

const candidates = computed(() => candidatesStore.candidates)
const loading = computed(() => candidatesStore.loading)

const formatDate = (date) => new Date(date).toLocaleDateString()

const formatState = (state) => {
  const states = {
    candidate_created: 'New',
    packet_assigned: 'Assigned',
    in_progress: 'In Progress',
    pending_hr_review: 'Pending Review',
    approved: 'Approved',
    employee_active: 'Active',
  }
  return states[state] || state
}

const fetchCandidates = async () => {
  await candidatesStore.fetchCandidates(authStore.user.tenantId, {
    state: stateFilter.value,
    search: search.value,
  })
}

const handleSearch = () => fetchCandidates()
const handleFilter = () => fetchCandidates()

const handleAddCandidate = async () => {
  if (!newCandidate.value.employmentType) {
    alert('Please select an employment type')
    return
  }
  if (!newCandidate.value.startDate) {
    alert('Please select a start date')
    return
  }
  saving.value = true
  try {
    await candidatesStore.createCandidate(authStore.user.tenantId, newCandidate.value)
    showAddModal.value = false
    newCandidate.value = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      position: '',
      employmentType: '',
      startDate: '',
    }
  } catch (error) {
    console.error('=== handleAddCandidate ERROR ===');
    console.error('Error Message:', error.message);
    console.error('Error Name:', error.name);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Status Text:', error.response.statusText);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received - Request:', error.request);
    }
    console.error('Full Error:', error);

    let msg = 'Failed to add candidate';
    const details = [];

    if (error.response) {
      if (error.response.data?.message) {
        msg = error.response.data.message;
      }
      if (error.response.data?.error) {
        details.push(`Error: ${error.response.data.error}`);
      }
      if (error.response.data?.errors) {
        details.push(`Validation: ${JSON.stringify(error.response.data.errors)}`);
      }
      details.push(`Status: ${error.response.status} ${error.response.statusText}`);
    } else if (error.request) {
      msg = 'No response from server';
      details.push('Check if backend is running');
    } else {
      msg = error.message || 'Unknown error';
    }

    console.error('Alert Message:', msg);
    console.error('Alert Details:', details.join(' | '));
    alert(`${msg}${details.length ? '\n\n' + details.join('\n') : ''}`);
  } finally {
    saving.value = false
  }
}

onMounted(() => fetchCandidates())
</script>

<style scoped>
.candidates-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
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

.add-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.add-btn:hover {
  background: #359268;
  transform: translateY(-2px);
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.search-input {
  flex: 1;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: #64748b;
}

.search-input input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 0.5rem;
  color: #f8fafc;
  font-size: 0.875rem;
}

.search-input input:focus {
  outline: none;
  border-color: #42b883;
}

.filter-select {
  padding: 0.75rem 1rem;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 0.5rem;
  color: #f8fafc;
  font-size: 0.875rem;
  min-width: 160px;
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
  border-top-color: #42b883;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.table-container {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 1rem;
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  text-align: left;
  padding: 1rem;
  background: #0f172a;
  color: #94a3b8;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

td {
  padding: 1rem;
  color: #e2e8f0;
  font-size: 0.875rem;
  border-bottom: 1px solid #334155;
}

.table-row {
  transition: background 0.2s;
}

.table-row:hover {
  background: rgba(66, 184, 131, 0.05);
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
}

.avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, #42b883, #359268);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge.candidate_created { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.status-badge.packet_assigned { background: rgba(249, 115, 22, 0.1); color: #f97316; }
.status-badge.in_progress { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
.status-badge.pending_hr_review { background: rgba(234, 179, 8, 0.1); color: #eab308; }
.status-badge.approved { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
.status-badge.employee_active { background: rgba(66, 184, 131, 0.1); color: #42b883; }

.view-link {
  color: #42b883;
  text-decoration: none;
  font-weight: 500;
}

.view-link:hover {
  text-decoration: underline;
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
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
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
  font-weight: 600;
}

.close-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.25rem;
}

.close-btn:hover {
  color: #e2e8f0;
}

.modal-form {
  padding: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  color: #e2e8f0;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 0.5rem;
  color: #f8fafc;
  font-size: 0.875rem;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #42b883;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #334155;
}

.btn-cancel {
  padding: 0.625rem 1rem;
  background: transparent;
  border: 1px solid #334155;
  color: #e2e8f0;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
}

.btn-cancel:hover {
  background: #334155;
}

.btn-submit {
  padding: 0.625rem 1rem;
  background: #42b883;
  border: none;
  color: white;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
}

.btn-submit:hover:not(:disabled) {
  background: #359268;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95) translateY(20px);
}
</style>
