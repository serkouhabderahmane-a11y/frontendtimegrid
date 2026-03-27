<template>
  <div class="patients-management">
    <header class="page-header">
      <div>
        <h1>Patient Management</h1>
        <p>Manage patient records and medical information</p>
      </div>
      <div class="header-actions">
        <button @click="showAddModal = true" class="btn btn-primary">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          Add Patient
        </button>
      </div>
    </header>

    <div class="search-section">
      <div class="search-box">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input type="text" v-model="searchQuery" placeholder="Search patients..." @input="debouncedSearch" />
      </div>
      <select v-model="filterActive" @change="fetchPatients">
        <option value="">All Patients</option>
        <option value="true">Active</option>
        <option value="false">Inactive</option>
      </select>
    </div>

    <div class="patients-grid" v-if="!loading && patients.length > 0">
      <div v-for="patient in patients" :key="patient.id" class="patient-card" @click="viewPatient(patient)">
        <div class="patient-header">
          <div class="patient-avatar">
            {{ patient.firstName?.[0] }}{{ patient.lastName?.[0] }}
          </div>
          <div class="patient-info">
            <h3>{{ patient.firstName }} {{ patient.lastName }}</h3>
            <span class="patient-id">ID: {{ patient.id.slice(0, 8) }}</span>
          </div>
          <span class="status-dot" :class="{ inactive: !patient.isActive }"></span>
        </div>
        <div class="patient-details">
          <div class="detail-row">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            <span>{{ patient.email || 'No email' }}</span>
          </div>
          <div class="detail-row">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
            </svg>
            <span>{{ patient.phone || 'No phone' }}</span>
          </div>
          <div class="detail-row">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <span>{{ formatDate(patient.dateOfBirth) }} ({{ calculateAge(patient.dateOfBirth) }} yrs)</span>
          </div>
        </div>
        <div class="patient-staff" v-if="patient.staffAssignments?.length > 0">
          <span class="staff-label">Assigned Staff:</span>
          <span v-for="assignment in patient.staffAssignments.slice(0, 2)" :key="assignment.id" class="staff-badge">
            {{ assignment.staff?.user?.firstName?.[0] }}{{ assignment.staff?.user?.lastName?.[0] }}
          </span>
          <span v-if="patient.staffAssignments.length > 2">+{{ patient.staffAssignments.length - 2 }}</span>
        </div>
      </div>
    </div>

    <div v-else-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading patients...</p>
    </div>

    <div v-else class="empty-state">
      <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
      <h3>No patients found</h3>
      <p>Add your first patient to get started</p>
    </div>

    <div v-if="pagination.totalPages > 1" class="pagination">
      <button @click="changePage(pagination.page - 1)" :disabled="pagination.page === 1">Previous</button>
      <span>Page {{ pagination.page }} of {{ pagination.totalPages }}</span>
      <button @click="changePage(pagination.page + 1)" :disabled="pagination.page === pagination.totalPages">Next</button>
    </div>

    <div v-if="showAddModal" class="modal-overlay" @click.self="closeAddModal">
      <div class="modal modal-lg">
        <div class="modal-header">
          <h2>Add New Patient</h2>
          <button @click="closeAddModal" class="close-btn">&times;</button>
        </div>
        <form @submit.prevent="submitPatient" class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label>First Name *</label>
              <input type="text" v-model="newPatient.firstName" required />
            </div>
            <div class="form-group">
              <label>Last Name *</label>
              <input type="text" v-model="newPatient.lastName" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Date of Birth *</label>
              <input type="date" v-model="newPatient.dateOfBirth" required />
            </div>
            <div class="form-group">
              <label>Gender *</label>
              <select v-model="newPatient.gender" required>
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Email</label>
              <input type="email" v-model="newPatient.email" />
            </div>
            <div class="form-group">
              <label>Phone</label>
              <input type="tel" v-model="newPatient.phone" />
            </div>
          </div>
          <div class="form-group">
            <label>Address</label>
            <input type="text" v-model="newPatient.address" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>City</label>
              <input type="text" v-model="newPatient.city" />
            </div>
            <div class="form-group">
              <label>State</label>
              <input type="text" v-model="newPatient.state" />
            </div>
            <div class="form-group">
              <label>ZIP Code</label>
              <input type="text" v-model="newPatient.zipCode" />
            </div>
          </div>
          <div class="form-section-title">Emergency Contact</div>
          <div class="form-row">
            <div class="form-group">
              <label>Emergency Name</label>
              <input type="text" v-model="newPatient.emergencyName" />
            </div>
            <div class="form-group">
              <label>Emergency Phone</label>
              <input type="tel" v-model="newPatient.emergencyPhone" />
            </div>
            <div class="form-group">
              <label>Relation</label>
              <input type="text" v-model="newPatient.emergencyRelation" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Blood Type</label>
              <select v-model="newPatient.bloodType">
                <option value="">Unknown</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Allergies</label>
            <textarea v-model="newPatient.allergies" placeholder="Known allergies..."></textarea>
          </div>
          <div class="form-group">
            <label>Notes</label>
            <textarea v-model="newPatient.notes" placeholder="Additional notes..."></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" @click="closeAddModal" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary">Add Patient</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showDetailModal" class="modal-overlay" @click.self="closeDetailModal">
      <div class="modal modal-xl">
        <div class="modal-header">
          <h2>{{ selectedPatient?.firstName }} {{ selectedPatient?.lastName }}</h2>
          <button @click="closeDetailModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="patient-detail-grid">
            <div class="detail-column">
              <div class="detail-section">
                <h3>Personal Information</h3>
                <div class="detail-row"><span>Date of Birth:</span><span>{{ formatDate(selectedPatient?.dateOfBirth) }}</span></div>
                <div class="detail-row"><span>Gender:</span><span class="capitalize">{{ selectedPatient?.gender }}</span></div>
                <div class="detail-row"><span>Email:</span><span>{{ selectedPatient?.email || 'N/A' }}</span></div>
                <div class="detail-row"><span>Phone:</span><span>{{ selectedPatient?.phone || 'N/A' }}</span></div>
                <div class="detail-row"><span>Address:</span><span>{{ selectedPatient?.address || 'N/A' }}</span></div>
                <div class="detail-row"><span>Blood Type:</span><span>{{ selectedPatient?.bloodType || 'Unknown' }}</span></div>
              </div>
              <div class="detail-section">
                <h3>Emergency Contact</h3>
                <div class="detail-row"><span>Name:</span><span>{{ selectedPatient?.emergencyName || 'N/A' }}</span></div>
                <div class="detail-row"><span>Phone:</span><span>{{ selectedPatient?.emergencyPhone || 'N/A' }}</span></div>
                <div class="detail-row"><span>Relation:</span><span>{{ selectedPatient?.emergencyRelation || 'N/A' }}</span></div>
              </div>
              <div class="detail-section" v-if="selectedPatient?.allergies">
                <h3>Allergies</h3>
                <p class="allergies-text">{{ selectedPatient.allergies }}</p>
              </div>
            </div>
            <div class="detail-column">
              <div class="tabs">
                <button :class="{ active: activeTab === 'timeline' }" @click="activeTab = 'timeline'">Timeline</button>
                <button :class="{ active: activeTab === 'reports' }" @click="activeTab = 'reports'">Reports</button>
                <button :class="{ active: activeTab === 'medicines' }" @click="activeTab = 'medicines'">Medicines</button>
                <button :class="{ active: activeTab === 'appointments' }" @click="activeTab = 'appointments'">Appointments</button>
              </div>
              <div class="tab-content">
                <div v-if="activeTab === 'timeline'" class="timeline">
                  <div v-for="item in timeline" :key="item.id" class="timeline-item" :class="item.type">
                    <div class="timeline-date">{{ formatDate(item.date) }}</div>
                    <div class="timeline-title">{{ item.title }}</div>
                    <div class="timeline-desc">{{ item.description }}</div>
                  </div>
                  <div v-if="timeline.length === 0" class="empty-tab">No timeline records</div>
                </div>
                <div v-if="activeTab === 'reports'" class="reports-list">
                  <div v-for="report in medicalReports" :key="report.id" class="report-item">
                    <div class="report-header">
                      <span class="report-date">{{ formatDate(report.reportDate) }}</span>
                      <span class="report-status" :class="{ approved: report.isApproved }">{{ report.isApproved ? 'Approved' : 'Pending' }}</span>
                    </div>
                    <div class="report-doctor">Dr. {{ report.doctorName }}</div>
                    <div class="report-diagnosis">{{ report.diagnosis || 'No diagnosis' }}</div>
                  </div>
                  <div v-if="medicalReports.length === 0" class="empty-tab">No medical reports</div>
                </div>
                <div v-if="activeTab === 'medicines'" class="medicines-list">
                  <div v-for="med in medicines" :key="med.id" class="medicine-item" :class="med.status">
                    <div class="medicine-header">
                      <span class="medicine-name">{{ med.medicineName }}</span>
                      <span class="medicine-status">{{ med.status }}</span>
                    </div>
                    <div class="medicine-details">
                      {{ med.dosage }} - {{ med.frequency }}
                    </div>
                    <div class="medicine-dates">
                      {{ formatDate(med.startDate) }} {{ med.endDate ? '- ' + formatDate(med.endDate) : '' }}
                    </div>
                  </div>
                  <div v-if="medicines.length === 0" class="empty-tab">No medicine records</div>
                </div>
                <div v-if="activeTab === 'appointments'" class="appointments-list">
                  <div v-for="apt in appointments" :key="apt.id" class="appointment-item">
                    <div class="appointment-header">
                      <span class="appointment-type">{{ apt.appointmentType }}</span>
                      <span class="appointment-status" :class="apt.status">{{ apt.status }}</span>
                    </div>
                    <div class="appointment-date">{{ formatDateTime(apt.appointmentDate) }}</div>
                    <div class="appointment-staff" v-if="apt.staff">Dr. {{ apt.staff?.user?.firstName }} {{ apt.staff?.user?.lastName }}</div>
                  </div>
                  <div v-if="appointments.length === 0" class="empty-tab">No appointments</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../../stores/auth'
import api from '../../../api/axios'

const authStore = useAuthStore()

const loading = ref(false)
const patients = ref([])
const searchQuery = ref('')
const filterActive = ref('')
const pagination = ref({ page: 1, limit: 12, totalPages: 0 })
const showAddModal = ref(false)
const showDetailModal = ref(false)
const selectedPatient = ref(null)
const activeTab = ref('timeline')
const timeline = ref([])
const medicalReports = ref([])
const medicines = ref([])
const appointments = ref([])

const newPatient = ref({
  firstName: '', lastName: '', dateOfBirth: '', gender: '', email: '', phone: '',
  address: '', city: '', state: '', zipCode: '', emergencyName: '', emergencyPhone: '',
  emergencyRelation: '', bloodType: '', allergies: '', notes: ''
})

let searchTimeout = null

const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pagination.value.page = 1
    fetchPatients()
  }, 300)
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return 0
  const today = new Date()
  const birth = new Date(dateOfBirth)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

const fetchPatients = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.limit,
      search: searchQuery.value || undefined,
      isActive: filterActive.value ? filterActive.value === 'true' : undefined
    }
    const response = await api.get('/api/patients', { params })
    patients.value = response.data.data
    pagination.value.totalPages = response.data.totalPages
  } catch (err) {
    console.error('Failed to fetch patients:', err)
  } finally {
    loading.value = false
  }
}

const viewPatient = async (patient) => {
  selectedPatient.value = patient
  showDetailModal.value = true
  activeTab.value = 'timeline'
  await loadPatientDetails(patient.id)
}

const loadPatientDetails = async (patientId) => {
  try {
    const [timelineRes, reportsRes, medicinesRes, aptsRes] = await Promise.all([
      api.get(`/api/patients/${patientId}/timeline`),
      api.get(`/api/patients/${patientId}/medical-reports`),
      api.get(`/api/patients/${patientId}/medicines`),
      api.get(`/api/patients/${patientId}/appointments`)
    ])
    timeline.value = timelineRes.data
    medicalReports.value = reportsRes.data
    medicines.value = medicinesRes.data
    appointments.value = aptsRes.data
  } catch (err) {
    console.error('Failed to load patient details:', err)
  }
}

const closeAddModal = () => {
  showAddModal.value = false
  newPatient.value = { firstName: '', lastName: '', dateOfBirth: '', gender: '', email: '', phone: '', address: '', city: '', state: '', zipCode: '', emergencyName: '', emergencyPhone: '', emergencyRelation: '', bloodType: '', allergies: '', notes: '' }
}

const submitPatient = async () => {
  try {
    await api.post('/api/patients', newPatient.value)
    closeAddModal()
    fetchPatients()
  } catch (err) {
    console.error('Failed to add patient:', err)
    alert(err.response?.data?.message || 'Failed to add patient')
  }
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedPatient.value = null
}

const changePage = (page) => {
  pagination.value.page = page
  fetchPatients()
}

onMounted(() => {
  fetchPatients()
})
</script>

<style scoped>
.patients-management { padding: 2rem; max-width: 1400px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
.page-header h1 { font-size: 1.75rem; font-weight: 700; color: #f8fafc; margin-bottom: 0.25rem; }
.page-header p { color: #94a3b8; }
.header-actions { display: flex; gap: 0.75rem; }
.search-section { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
.search-box { flex: 1; display: flex; align-items: center; gap: 0.75rem; background: #1e293b; border: 1px solid #334155; border-radius: 0.5rem; padding: 0.75rem 1rem; }
.search-box input { flex: 1; background: none; border: none; color: #f8fafc; outline: none; }
.search-box input::placeholder { color: #64748b; }
.search-box svg { color: #64748b; }
.search-section select { background: #1e293b; border: 1px solid #334155; border-radius: 0.5rem; padding: 0.75rem 1rem; color: #f8fafc; min-width: 150px; }
.patients-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem; }
.patient-card { background: #1e293b; border: 1px solid #334155; border-radius: 0.75rem; padding: 1.25rem; cursor: pointer; transition: all 0.2s; }
.patient-card:hover { border-color: #42b883; transform: translateY(-2px); }
.patient-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }
.patient-avatar { width: 48px; height: 48px; border-radius: 50%; background: #42b883; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; }
.patient-info { flex: 1; }
.patient-info h3 { color: #f8fafc; font-size: 1rem; margin-bottom: 0.125rem; }
.patient-id { font-size: 0.75rem; color: #64748b; }
.status-dot { width: 10px; height: 10px; border-radius: 50%; background: #22c55e; }
.status-dot.inactive { background: #ef4444; }
.patient-details { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
.detail-row { display: flex; align-items: center; gap: 0.5rem; color: #94a3b8; font-size: 0.875rem; }
.detail-row svg { flex-shrink: 0; color: #64748b; }
.patient-staff { display: flex; align-items: center; gap: 0.5rem; padding-top: 0.75rem; border-top: 1px solid #334155; font-size: 0.75rem; }
.staff-label { color: #64748b; }
.staff-badge { width: 24px; height: 24px; border-radius: 50%; background: #334155; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-size: 0.625rem; }
.loading-state, .empty-state { text-align: center; padding: 4rem; color: #64748b; }
.empty-state h3 { color: #f8fafc; margin: 1rem 0 0.5rem; }
.spinner { width: 40px; height: 40px; border: 3px solid #334155; border-top-color: #42b883; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
@keyframes spin { to { transform: rotate(360deg); } }
.pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 1.5rem; }
.pagination button { background: #334155; border: none; border-radius: 0.5rem; padding: 0.5rem 1rem; color: #f8fafc; cursor: pointer; }
.pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: #1e293b; border-radius: 1rem; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
.modal-lg { max-width: 700px; }
.modal-xl { max-width: 900px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem; border-bottom: 1px solid #334155; }
.modal-header h2 { color: #f8fafc; font-size: 1.25rem; }
.close-btn { background: none; border: none; color: #94a3b8; font-size: 1.5rem; cursor: pointer; }
.modal-body { padding: 1.25rem; }
.form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; color: #94a3b8; font-size: 0.875rem; margin-bottom: 0.5rem; }
.form-group input, .form-group select, .form-group textarea { width: 100%; background: #0f172a; border: 1px solid #334155; border-radius: 0.5rem; padding: 0.75rem; color: #f8fafc; }
.form-group textarea { min-height: 80px; resize: vertical; }
.form-section-title { color: #f8fafc; font-size: 1rem; font-weight: 600; margin: 1.5rem 0 1rem; padding-top: 1rem; border-top: 1px solid #334155; }
.modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1.25rem; border-top: 1px solid #334155; }
.btn { padding: 0.625rem 1rem; border-radius: 0.5rem; font-weight: 600; font-size: 0.875rem; cursor: pointer; transition: all 0.2s; border: none; }
.btn-primary { background: #42b883; color: white; }
.btn-primary:hover { background: #359268; }
.btn-secondary { background: #334155; color: #f8fafc; }
.btn-secondary:hover { background: #475569; }
.patient-detail-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 1.5rem; }
.detail-section { background: #0f172a; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem; }
.detail-section h3 { color: #f8fafc; font-size: 0.875rem; margin-bottom: 0.75rem; padding-bottom: 0.5rem; border-bottom: 1px solid #334155; }
.detail-section .detail-row { display: flex; justify-content: space-between; padding: 0.375rem 0; font-size: 0.875rem; }
.detail-section .detail-row span:first-child { color: #64748b; }
.detail-section .detail-row span:last-child { color: #f8fafc; }
.capitalize { text-transform: capitalize; }
.allergies-text { color: #f8fafc; font-size: 0.875rem; background: rgba(239,68,68,0.1); padding: 0.5rem; border-radius: 0.25rem; }
.tabs { display: flex; gap: 0.5rem; margin-bottom: 1rem; border-bottom: 1px solid #334155; }
.tabs button { background: none; border: none; color: #64748b; padding: 0.75rem 1rem; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; }
.tabs button.active { color: #42b883; border-bottom-color: #42b883; }
.tab-content { min-height: 300px; }
.timeline-item { background: #0f172a; border-radius: 0.5rem; padding: 1rem; margin-bottom: 0.75rem; border-left: 3px solid #42b883; }
.timeline-item.medical_report { border-left-color: #3b82f6; }
.timeline-item.medicine { border-left-color: #22c55e; }
.timeline-item.appointment { border-left-color: #f59e0b; }
.timeline-date { font-size: 0.75rem; color: #64748b; margin-bottom: 0.25rem; }
.timeline-title { color: #f8fafc; font-weight: 500; margin-bottom: 0.25rem; }
.timeline-desc { font-size: 0.875rem; color: #94a3b8; }
.empty-tab { text-align: center; padding: 2rem; color: #64748b; }
.report-item, .medicine-item, .appointment-item { background: #0f172a; border-radius: 0.5rem; padding: 1rem; margin-bottom: 0.75rem; }
.report-header, .medicine-header, .appointment-header { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
.report-date, .appointment-date { font-size: 0.875rem; color: #94a3b8; }
.report-status, .medicine-status, .appointment-status { font-size: 0.75rem; padding: 0.125rem 0.5rem; border-radius: 0.25rem; background: #334155; color: #94a3b8; text-transform: capitalize; }
.report-status.approved { background: rgba(34,197,94,0.2); color: #22c55e; }
.medicine-item.active .medicine-status { background: rgba(34,197,94,0.2); color: #22c55e; }
.appointment-status.scheduled { background: rgba(59,130,246,0.2); color: #3b82f6; }
.appointment-status.completed { background: rgba(34,197,94,0.2); color: #22c55e; }
.appointment-status.canceled { background: rgba(239,68,68,0.2); color: #ef4444; }
.report-doctor, .appointment-staff { font-size: 0.875rem; color: #f8fafc; }
.report-diagnosis, .medicine-details, .medicine-dates { font-size: 0.75rem; color: #64748b; margin-top: 0.25rem; }
.medicine-name, .appointment-type { color: #f8fafc; font-weight: 500; }
</style>
