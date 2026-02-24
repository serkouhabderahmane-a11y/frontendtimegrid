<template>
  <div class="onboarding-portal">
    <header class="portal-header">
      <div class="header-content">
        <h1>Welcome to TimeGrid</h1>
        <p>Complete your onboarding checklist to get started</p>
      </div>
      <div class="progress-section">
        <div class="progress-label">
          <span>Progress</span>
          <span>{{ progressPercent }}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <button v-if="isDemoMode" @click="resetDemo" class="btn-reset">Reset Demo</button>
      </div>
    </header>

    <div class="portal-content">
      <aside class="task-sidebar">
        <h3>Your Tasks</h3>
        <div class="task-list">
          <div 
            v-for="(taskStatus, index) in taskStatuses" 
            :key="taskStatus.taskId"
            class="task-item"
            :class="{ 
              active: currentTask?.taskId === taskStatus.taskId,
              completed: taskStatus.status === 'approved',
              locked: !canAccessTask(index)
            }"
            @click="selectTask(index)"
          >
            <div class="task-icon">
              <span v-if="taskStatus.status === 'approved'" class="check">✓</span>
              <span v-else-if="taskStatus.status === 'rejected'" class="rejected">!</span>
              <span v-else-if="!canAccessTask(index)" class="lock">🔒</span>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <div class="task-info">
              <span class="task-name">{{ taskStatus.task?.name }}</span>
              <span class="task-status-text">{{ formatStatus(taskStatus.status) }}</span>
            </div>
          </div>
        </div>
      </aside>

      <main class="task-content">
        <div v-if="!currentTask" class="welcome-screen">
          <div class="welcome-card">
            <h2>👋 Welcome, {{ onboarding?.candidate?.firstName }}!</h2>
            <p>We're excited to have you join our team. Please complete all required tasks to get started.</p>
            <div class="requirements">
              <h3>What you need to complete:</h3>
              <ul>
                <li v-for="task in requiredTasks" :key="task.taskId">
                  {{ task.task?.name }} ({{ task.task?.isRequired ? 'Required' : 'Optional' }})
                </li>
              </ul>
            </div>
            <button @click="selectTask(0)" class="btn-start">Start Onboarding</button>
          </div>
        </div>

        <div v-else class="task-detail">
          <div class="task-header">
            <h2>{{ currentTask.task?.name }}</h2>
            <p>{{ currentTask.task?.description }}</p>
            <span class="task-type-badge">{{ formatTaskType(currentTask.task?.type) }}</span>
          </div>

          <div v-if="currentTask.status === 'approved'" class="completed-message">
            <span class="check-icon">✓</span>
            <p>This task has been approved</p>
          </div>

          <div v-else-if="currentTask.status === 'rejected'" class="rejected-message">
            <span class="warning-icon">!</span>
            <p>This task was rejected</p>
            <p class="comment">Reason: {{ currentTask.reviewComment || 'No reason provided' }}</p>
            <button @click="currentTask.status = 'draft'" class="btn-retry">Fix & Resubmit</button>
          </div>

          <form v-else @submit.prevent="submitTask" class="task-form">
            <!-- Personal Information -->
            <div v-if="currentTask.task?.type === 'personal_info'" class="form-section">
              <h3>Personal Information</h3>
              <p class="form-info">The following information was provided by your employer. Please verify and complete any missing details.</p>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Legal First Name *</label>
                  <input v-model="formData.firstName" type="text" required />
                </div>
                <div class="form-group">
                  <label>Legal Last Name *</label>
                  <input v-model="formData.lastName" type="text" required />
                </div>
              </div>
              <div class="form-group">
                <label>Date of Birth *</label>
                <DatePicker v-model="formData.dateOfBirth" placeholder="Select date of birth" />
              </div>
              <div class="form-group">
                <label>Address *</label>
                <input v-model="formData.address" type="text" placeholder="Street Address" required />
                <input v-model="formData.city" type="text" placeholder="City" required class="mt-2" />
                <div class="form-row mt-2">
                  <input v-model="formData.state" type="text" placeholder="State" required />
                  <input v-model="formData.zipCode" type="text" placeholder="ZIP Code" required />
                </div>
              </div>
              <div class="form-group">
                <label>Emergency Contact Name *</label>
                <input v-model="formData.emergencyName" type="text" required />
              </div>
              <div class="form-group">
                <label>Emergency Contact Phone *</label>
                <input v-model="formData.emergencyPhone" type="tel" required />
              </div>
              <div class="form-group">
                <label>Social Security Number (Optional)</label>
                <input v-model="formData.ssn" type="text" placeholder="XXX-XX-XXXX" />
                <small>Only required if mandatory in your jurisdiction</small>
              </div>
            </div>

            <!-- Government Forms -->
            <div v-if="currentTask.task?.type === 'government_forms'" class="form-section">
              <h3>Government Tax Forms</h3>
              <div class="form-group">
                <label>Form W-4 - Employee's Withholding Certificate</label>
                <div class="form-subsection">
                  <p class="form-desc">Federal tax withholding form</p>
                  <div class="form-row">
                    <div class="form-group">
                      <label>Filing Status *</label>
                      <select v-model="formData.w4FilingStatus" required>
                        <option value="">Select...</option>
                        <option value="single">Single or Married filing separately</option>
                        <option value="married">Married filing jointly</option>
                        <option value="head">Head of household</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label>Total Dependents *</label>
                      <input v-model="formData.w4Dependents" type="number" min="0" required />
                    </div>
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label>Other Income</label>
                      <input v-model="formData.w4OtherIncome" type="number" min="0" />
                    </div>
                    <div class="form-group">
                      <label>Deductions</label>
                      <input v-model="formData.w4Deductions" type="number" min="0" />
                    </div>
                  </div>
                  <div class="form-group">
                    <label>Extra Withholding</label>
                    <input v-model="formData.w4ExtraWithholding" type="number" min="0" />
                  </div>
                  <div class="signature-field">
                    <label>Signature *</label>
                    <p class="signature-line">By typing your name, you are signing this form electronically</p>
                    <input v-model="formData.w4Signature" type="text" placeholder="Type your full legal name" required />
                    <p class="signature-date">Date: {{ new Date().toLocaleDateString() }}</p>
                  </div>
                </div>
              </div>

              <div class="form-group mt-4">
                <label>I-9 - Employment Eligibility Verification</label>
                <div class="form-subsection">
                  <p class="form-desc">Proof of identity and employment authorization</p>
                  <div class="form-group">
                    <label>Document Type *</label>
                    <select v-model="formData.i9DocType" required>
                      <option value="">Select...</option>
                      <option value="passport">Passport</option>
                      <option value="drivers_license">Driver's License</option>
                      <option value="ssn">SSN Card</option>
                      <option value="work_permit">Employment Authorization Card</option>
                    </select>
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label>Document Number *</label>
                      <input v-model="formData.i9DocNumber" type="text" required />
                    </div>
                      <div class="form-group">
                        <label>Expiration Date (if any)</label>
                        <DatePicker v-model="formData.i9Expiration" placeholder="Select expiration date" />
                      </div>
                  </div>
                  <div class="form-group">
                    <label>Citizenship/Immigration Status *</label>
                    <select v-model="formData.i9Status" required>
                      <option value="">Select...</option>
                      <option value="citizen">U.S. Citizen</option>
                      <option value="permanent_resident">Permanent Resident</option>
                      <option value="work_auth">Work Authorized</option>
                    </select>
                  </div>
                  <div class="signature-field">
                    <label>Signature *</label>
                    <input v-model="formData.i9Signature" type="text" placeholder="Type your full legal name" required />
                    <p class="signature-date">Date: {{ new Date().toLocaleDateString() }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Document Upload -->
            <div v-if="currentTask.task?.type === 'document_upload'" class="form-section">
              <h3>Document Upload</h3>
              <div class="form-group">
                <label>Select Document Type *</label>
                <select v-model="formData.docType" required>
                  <option value="">Select...</option>
                  <option value="id">Government ID</option>
                  <option value="drivers_license">Driver's License</option>
                  <option value="passport">Passport</option>
                  <option value="certification">Professional Certification</option>
                  <option value="education">Education Diploma</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div class="form-group">
                <label>Upload File *</label>
                <div class="file-upload">
                  <input type="file" @change="handleFileUpload" accept=".pdf,.jpg,.jpeg,.png" required />
                  <div class="upload-icon">📁</div>
                  <p>Click to upload or drag and drop</p>
                  <small>PDF, JPG, or PNG (max 10MB)</small>
                </div>
                <div v-if="formData.uploadedFile" class="file-preview">
                  <span class="file-name">{{ formData.uploadedFile }}</span>
                  <span class="file-remove" @click="formData.uploadedFile = null">×</span>
                </div>
              </div>
              <div class="form-group">
                <label>Expiration Date (optional)</label>
                <DatePicker v-model="formData.docExpiration" placeholder="Select expiration date" />
                <small>Leave blank if document does not expire</small>
              </div>
            </div>

            <!-- Policy Acknowledgement -->
            <div v-if="currentTask.task?.type === 'policy_acknowledgment'" class="form-section">
              <h3>Policy Acknowledgement</h3>
              <div class="policy-content">
                <h4>Employee Handbook</h4>
                <div class="policy-text">
                  <h5>1. Company Mission and Values</h5>
                  <p>Our company is committed to excellence, integrity, and innovation. We strive to create a positive work environment where every employee can thrive.</p>
                  
                  <h5>2. Code of Conduct</h5>
                  <p>All employees are expected to maintain professional conduct, respect colleagues, and adhere to company policies at all times.</p>
                  
                  <h5>3. Confidentiality</h5>
                  <p>Employees must protect confidential company information, including trade secrets, customer data, and proprietary business information.</p>
                  
                  <h5>4. Data Security</h5>
                  <p>All employees must follow security protocols to protect company and customer data from unauthorized access or disclosure.</p>
                  
                  <h5>5. Anti-Harassment Policy</h5>
                  <p>Our company maintains a zero-tolerance policy for harassment of any kind. All employees have the right to work in a harassment-free environment.</p>
                  
                  <h5>6. Attendance and Time Off</h5>
                  <p>Employees are expected to maintain regular attendance. All time off must be requested in advance and approved by your supervisor.</p>
                </div>
                <div class="scroll-indicator" ref="policyScroll" @scroll="checkScroll">
                  <div class="scroll-fake" :style="{ height: policyContentHeight + 'px' }"></div>
                </div>
              </div>
              <div class="form-group mt-4">
                <label class="checkbox-label">
                  <input v-model="formData.policyAccepted" type="checkbox" required />
                  <span>I have read and understand the company policies outlined above *</span>
                </label>
              </div>
              <div class="form-group">
                <label class="checkbox-label">
                  <input v-model="formData.policyAgreed" type="checkbox" required />
                  <span>I agree to comply with all company policies and understand that violations may result in disciplinary action *</span>
                </label>
              </div>
              <div class="signature-field">
                <label>Electronic Signature *</label>
                <input v-model="formData.policySignature" type="text" placeholder="Type your full legal name" required />
                <p class="signature-date">Date: {{ new Date().toLocaleDateString() }} | IP: {{ userIP }}</p>
              </div>
            </div>

            <!-- Training Acknowledgement -->
            <div v-if="currentTask.task?.type === 'training_acknowledgment'" class="form-section">
              <h3>Training Acknowledgement</h3>
              <p class="form-desc">Complete the required training courses and acknowledge completion</p>
              
              <div class="training-list">
                <div v-for="(training, idx) in requiredTrainings" :key="idx" class="training-item">
                  <div class="training-header">
                    <h4>{{ training.name }}</h4>
                    <span class="training-status" :class="training.status">{{ training.status }}</span>
                  </div>
                  <p>{{ training.description }}</p>
                  <div class="form-group">
                    <label>Completion Date *</label>
                    <DatePicker v-model="formData[`training_${idx}_date`]" placeholder="Select completion date" />
                  </div>
                  <div class="form-group">
                    <label>Certificate Upload (optional)</label>
                    <input type="file" accept=".pdf,.jpg,.png" />
                  </div>
                  <div class="signature-field">
                    <label>Acknowledge Completion *</label>
                    <input v-model="formData[`training_${idx}_signature`]" type="text" placeholder="Type your name to acknowledge" required />
                  </div>
                </div>
              </div>
            </div>

            <!-- E-Signature -->
            <div v-if="currentTask.task?.type === 'e_signature'" class="form-section">
              <h3>E-Signature</h3>
              
              <div class="form-group">
                <label>Select Document to Sign *</label>
                <select v-model="formData.signDocType" required>
                  <option value="">Select...</option>
                  <option value="offer_letter">Offer Letter</option>
                  <option value="nda">Non-Disclosure Agreement (NDA)</option>
                  <option value="job_description">Job Description</option>
                  <option value="arbitration">Arbitration Agreement</option>
                </select>
              </div>

              <div v-if="formData.signDocType" class="document-preview">
                <div class="doc-header">
                  <h4>{{ getDocTitle(formData.signDocType) }}</h4>
                </div>
                <div class="doc-content">
                  <p v-if="formData.signDocType === 'offer_letter'">
                    <strong>OFFER LETTER</strong><br/>
                    Dear {{ onboarding?.candidate?.firstName }},<br/><br/>
                    We are pleased to offer you the position of {{ onboarding?.candidate?.position }} at TimeGrid.<br/><br/>
                    Your start date will be {{ onboarding?.candidate?.startDate || 'to be determined' }}.<br/><br/>
                    This offer is contingent upon successful completion of background check and onboarding requirements.
                  </p>
                  <p v-else-if="formData.signDocType === 'nda'">
                    <strong>NON-DISCLOSURE AGREEMENT</strong><br/><br/>
                    In consideration of employment, you agree to maintain confidentiality of all proprietary information.
                  </p>
                  <p v-else-if="formData.signDocType === 'job_description'">
                    <strong>JOB DESCRIPTION</strong><br/><br/>
                    Position: {{ onboarding?.candidate?.position }}<br/>
                    Reports to: Department Manager<br/>
                    Location: Corporate Office
                  </p>
                  <p v-else>
                    <strong>ARBITRATION AGREEMENT</strong><br/><br/>
                    You agree that any disputes will be resolved through binding arbitration.
                  </p>
                </div>
              </div>

              <div class="form-group mt-4">
                <label>Draw Your Signature *</label>
                <canvas 
                  ref="signatureCanvas" 
                  class="signature-pad"
                  @mousedown="startDrawing"
                  @mousemove="draw"
                  @mouseup="stopDrawing"
                  @mouseleave="stopDrawing"
                  @touchstart.prevent="startDrawingTouch"
                  @touchmove.prevent="drawTouch"
                  @touchend.prevent="stopDrawing"
                ></canvas>
                <button type="button" @click="clearSignature" class="btn-clear">Clear Signature</button>
              </div>

              <div class="signature-field">
                <label>Type Your Full Legal Name *</label>
                <input v-model="formData.eSignTypedName" type="text" placeholder="Type your full legal name" required />
                <p class="signature-date">Date: {{ new Date().toLocaleDateString() }}</p>
                <p class="legal-text">By signing above, I acknowledge that I have read, understand, and agree to the document</p>
              </div>
            </div>

            <!-- Role Confirmation -->
            <div v-if="currentTask.task?.type === 'role_confirmation'" class="form-section">
              <h3>Role Confirmation</h3>
              <p class="form-desc">Please review and confirm your role details</p>

              <div class="role-details">
                <div class="detail-row">
                  <span class="label">Job Title:</span>
                  <span class="value">{{ onboarding?.candidate?.position }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Start Date:</span>
                  <span class="value">{{ onboarding?.candidate?.startDate }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Employment Type:</span>
                  <span class="value">{{ onboarding?.candidate?.employmentType }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Department:</span>
                  <span class="value">To be assigned</span>
                </div>
              </div>

              <div class="form-group mt-4">
                <label class="checkbox-label">
                  <input v-model="formData.roleConfirmed" type="checkbox" required />
                  <span>I confirm that the information above is accurate *</span>
                </label>
              </div>
              <div class="form-group">
                <label class="checkbox-label">
                  <input v-model="formData.roleUnderstood" type="checkbox" required />
                  <span>I understand my responsibilities and agree to the terms of employment *</span>
                </label>
              </div>
              <div class="signature-field">
                <label>Electronic Signature *</label>
                <input v-model="formData.roleSignature" type="text" placeholder="Type your full legal name" required />
                <p class="signature-date">Date: {{ new Date().toLocaleDateString() }}</p>
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-submit" :disabled="submitting">
                {{ submitting ? 'Submitting...' : 'Submit Task' }}
              </button>
            </div>
          </form>

          <!-- Confirmation Modal -->
          <Transition name="modal">
            <div v-if="showConfirmation" class="confirmation-overlay" @click.self="closeConfirmation">
              <div class="confirmation-content">
                <div class="success-icon">✓</div>
                <h2>Task Submitted!</h2>
                <p>Your <strong>{{ submittedTask }}</strong> has been submitted for review.</p>
                <p class="next-step">You will be notified once it's approved. You can continue with other tasks below.</p>
                <button @click="closeConfirmation" class="btn-continue">Continue</button>
              </div>
            </div>
          </Transition>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import api from '../../api/axios'
import DatePicker from '../../components/DatePicker.vue'

const route = useRoute()
const token = route.params.token

const onboarding = ref(null)
const taskStatuses = ref([])
const currentTaskIndex = ref(0)
const submitting = ref(false)
const policyScroll = ref(null)
const policyContentHeight = ref(0)
const signatureCanvas = ref(null)
const showConfirmation = ref(false)
const submittedTask = ref(null)
let isDrawing = false
let ctx = null

const STORAGE_KEY = 'onboarding_demo_data'

const loadSavedData = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.error('Error loading saved data:', e)
  }
  return null
}

const saveData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('Error saving data:', e)
  }
}

const getSavedFormData = (taskId, taskType) => {
  const saved = loadSavedData()
  if (saved && saved[taskId]) {
    return saved[taskId]
  }
  return null
}

const userIP = ref('192.168.1.1')

const formData = ref({})
const isCanvasBlank = ref(true)

const requiredTrainings = [
  { name: 'Workplace Safety Training', description: 'Learn about workplace safety protocols', status: 'pending' },
  { name: 'Harassment Prevention', description: 'Anti-harassment training', status: 'pending' },
  { name: 'Data Security Training', description: 'How to handle sensitive data', status: 'pending' }
]

const currentTask = computed(() => {
  if (currentTaskIndex.value === null || currentTaskIndex.value < 0) return null
  return taskStatuses.value[currentTaskIndex.value]
})

const progressPercent = computed(() => {
  if (!taskStatuses.value.length) return 0
  const completed = taskStatuses.value.filter(t => t.status === 'approved' || t.status === 'submitted').length
  return Math.round((completed / taskStatuses.value.length) * 100)
})

const requiredTasks = computed(() => taskStatuses.value.filter(t => t.task?.isRequired))

const isDemoMode = computed(() => {
  return localStorage.getItem('accessToken')?.startsWith('demo-')
})

const resetDemo = () => {
  if (confirm('Are you sure you want to reset all your progress?')) {
    localStorage.removeItem(STORAGE_KEY)
    window.location.reload()
  }
}

const canAccessTask = (index) => {
  // Allow access to the first task or any task that has been submitted
  if (index === 0) return true
  for (let i = 0; i < index; i++) {
    const prevTask = taskStatuses.value[i]
    // Allow access if previous task is submitted or approved
    if (prevTask.status !== 'submitted' && prevTask.status !== 'approved') return false
  }
  return true
}

const formatStatus = (status) => {
  const statuses = { draft: 'Not Started', submitted: 'Pending Review', approved: 'Completed', rejected: 'Needs Fix' }
  return statuses[status] || status
}

const formatTaskType = (type) => {
  const types = {
    personal_info: 'Personal Information',
    government_forms: 'Government Forms',
    document_upload: 'Document Upload',
    policy_acknowledgment: 'Policy Acknowledgement',
    training_acknowledgment: 'Training',
    e_signature: 'E-Signature',
    role_confirmation: 'Role Confirmation'
  }
  return types[type] || type
}

const getDocTitle = (type) => {
  const titles = { offer_letter: 'Offer Letter', nda: 'Non-Disclosure Agreement', job_description: 'Job Description', arbitration: 'Arbitration Agreement' }
  return titles[type] || 'Document'
}

const selectTask = async (index) => {
  if (!canAccessTask(index)) return
  currentTaskIndex.value = index
  
  const task = taskStatuses.value[index]
  const candidate = onboarding.value?.candidate
  const savedFormData = getSavedFormData(task.taskId, task.task?.type)
  
  // Pre-fill form data from saved data or candidate data
  if (task.task?.type === 'personal_info') {
    formData.value = savedFormData || {
      firstName: candidate?.firstName || '',
      lastName: candidate?.lastName || '',
      address: candidate?.address || '',
      city: candidate?.city || '',
      state: candidate?.state || '',
      zipCode: candidate?.zipCode || '',
      dateOfBirth: candidate?.dateOfBirth || '',
      emergencyName: candidate?.emergencyName || '',
      emergencyPhone: candidate?.emergencyPhone || '',
      ssn: ''
    }
  } else if (task.task?.type === 'government_forms') {
    formData.value = savedFormData || {}
  } else if (task.task?.type === 'document_upload') {
    formData.value = savedFormData || {}
  } else if (task.task?.type === 'policy_acknowledgment') {
    formData.value = savedFormData || { policyAccepted: false, policyAgreed: false, policySignature: '' }
  } else if (task.task?.type === 'training_acknowledgment') {
    formData.value = savedFormData || {}
  } else if (task.task?.type === 'e_signature') {
    formData.value = savedFormData || {}
  } else if (task.task?.type === 'role_confirmation') {
    formData.value = savedFormData || {
      roleConfirmed: false,
      roleUnderstood: false,
      roleSignature: ''
    }
  } else {
    formData.value = savedFormData || {}
  }
  
  if (currentTask.value?.task?.type === 'e_signature') {
    await nextTick()
    initCanvas()
  }
}

const checkScroll = () => {
  if (policyScroll.value) {
    const { scrollTop, scrollHeight, clientHeight } = policyScroll.value
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      formData.value.policyScrolled = true
    }
  }
}

const initCanvas = () => {
  if (signatureCanvas.value) {
    const canvas = signatureCanvas.value
    canvas.width = canvas.offsetWidth
    canvas.height = 200
    ctx = canvas.getContext('2d')
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
  }
}

const startDrawing = (e) => {
  isDrawing = true
  ctx.beginPath()
  ctx.moveTo(e.offsetX, e.offsetY)
}

const draw = (e) => {
  if (!isDrawing) return
  ctx.lineTo(e.offsetX, e.offsetY)
  ctx.stroke()
  isCanvasBlank.value = false
}

const stopDrawing = () => {
  isDrawing = false
}

const startDrawingTouch = (e) => {
  const touch = e.touches[0]
  const rect = signatureCanvas.value.getBoundingClientRect()
  isDrawing = true
  ctx.beginPath()
  ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top)
}

const drawTouch = (e) => {
  if (!isDrawing) return
  const touch = e.touches[0]
  const rect = signatureCanvas.value.getBoundingClientRect()
  ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top)
  ctx.stroke()
  isCanvasBlank.value = false
}

const stopDrawingTouch = () => {
  isDrawing = false
}

const clearSignature = () => {
  if (ctx) {
    ctx.clearRect(0, 0, signatureCanvas.value.width, signatureCanvas.value.height)
    isCanvasBlank.value = true
  }
}

const handleFileUpload = (e) => {
  const file = e.target.files[0]
  if (file) {
    formData.value.uploadedFile = file.name
  }
}

const submitTask = async () => {
  submitting.value = true
  try {
    const isDemo = localStorage.getItem('accessToken')?.startsWith('demo-')
    const currentTaskId = currentTask.value.taskId
    
    if (isDemo) {
      // Save form data to localStorage
      const savedData = loadSavedData() || {}
      savedData[currentTaskId] = { ...formData.value }
      saveData(savedData)
      
      // Update the task status in the array
      const taskIndex = taskStatuses.value.findIndex(t => t.taskId === currentTaskId)
      if (taskIndex !== -1) {
        taskStatuses.value[taskIndex].status = 'submitted'
        taskStatuses.value[taskIndex].submissionData = formData.value
        taskStatuses.value[taskIndex].submittedAt = new Date()
      }
      await new Promise(r => setTimeout(r, 500))
      
      // Auto-advance to next task
      if (currentTaskIndex.value < taskStatuses.value.length - 1) {
        await selectTask(currentTaskIndex.value + 1)
      } else {
        submittedTask.value = currentTask.value.task?.name
        showConfirmation.value = true
      }
    } else {
      await api.post(`/onboarding/${onboarding.value.id}/tasks/${currentTask.value.taskId}/submit`, {
        submissionData: formData.value
      })
      // Auto-advance to next task
      if (currentTaskIndex.value < taskStatuses.value.length - 1) {
        await selectTask(currentTaskIndex.value + 1)
      } else {
        submittedTask.value = currentTask.value.task?.name
        showConfirmation.value = true
      }
    }
  } catch (err) {
    console.error('Submit error:', err)
    alert('Failed to submit task: ' + err.message)
  } finally {
    submitting.value = false
  }
}

const closeConfirmation = () => {
  showConfirmation.value = false
  submittedTask.value = null
  // Move to next task
  if (currentTaskIndex.value < taskStatuses.value.length - 1) {
    selectTask(currentTaskIndex.value + 1)
  }
}

onMounted(async () => {
  try {
    const isDemo = localStorage.getItem('accessToken')?.startsWith('demo-')
    let data
    if (isDemo) {
      // Load saved data from localStorage
      const savedData = loadSavedData()
      
      data = { 
        id: 'onboarding-1', 
        currentState: 'in_progress',
        candidate: { 
          firstName: 'John', 
          lastName: 'Doe', 
          email: 'john@example.com',
          phone: '555-0101',
          position: 'Software Engineer', 
          startDate: '2024-01-15', 
          employmentType: 'full-time',
          address: '123 Main Street',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102'
        },
        taskStatuses: [
          { taskId: 't1', task: { name: 'Personal Information', type: 'personal_info', description: 'Complete your personal profile', isRequired: true, order: 1 }, status: savedData?.['t1'] ? 'submitted' : 'draft' },
          { taskId: 't2', task: { name: 'Government Forms', type: 'government_forms', description: 'W-4 and I-9 tax forms', isRequired: true, order: 2 }, status: savedData?.['t2'] ? 'submitted' : 'draft' },
          { taskId: 't3', task: { name: 'Document Upload', type: 'document_upload', description: 'Upload ID and certifications', isRequired: true, order: 3 }, status: savedData?.['t3'] ? 'submitted' : 'draft' },
          { taskId: 't4', task: { name: 'Policy Acknowledgement', type: 'policy_acknowledgment', description: 'Review and acknowledge company policies', isRequired: true, order: 4 }, status: savedData?.['t4'] ? 'submitted' : 'draft' },
          { taskId: 't5', task: { name: 'Training Acknowledgement', type: 'training_acknowledgment', description: 'Complete required training', isRequired: true, order: 5 }, status: savedData?.['t5'] ? 'submitted' : 'draft' },
          { taskId: 't6', task: { name: 'E-Signature', type: 'e_signature', description: 'Sign offer letter and NDA', isRequired: true, order: 6 }, status: savedData?.['t6'] ? 'submitted' : 'draft' },
          { taskId: 't7', task: { name: 'Role Confirmation', type: 'role_confirmation', description: 'Review and confirm your role', isRequired: true, order: 7 }, status: savedData?.['t7'] ? 'submitted' : 'draft' },
        ]
      }
      
      // Update submission data from saved
      if (savedData) {
        for (const taskId in savedData) {
          const taskStatus = data.taskStatuses.find(t => t.taskId === taskId)
          if (taskStatus) {
            taskStatus.submissionData = savedData[taskId]
          }
        }
      }
    } else {
      const response = await api.get(`/onboarding/token/${token}`)
      data = response.data
    }
    onboarding.value = data
    taskStatuses.value = data.taskStatuses || []
    
    // Find first incomplete task to start from
    const firstIncompleteIndex = taskStatuses.value.findIndex(t => t.status !== 'submitted' && t.status !== 'approved')
    if (firstIncompleteIndex > 0) {
      await selectTask(firstIncompleteIndex)
    } else if (firstIncompleteIndex === 0 || taskStatuses.value.length > 0) {
      await selectTask(0)
    }
  } catch (err) {
    console.error('Failed to load onboarding:', err)
  }
})
</script>

<style scoped>
.onboarding-portal {
  min-height: 100vh;
  background: #0f172a;
}

.portal-header {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  padding: 2rem;
  border-bottom: 1px solid #334155;
}

.header-content h1 {
  color: #f8fafc;
  margin-bottom: 0.5rem;
}

.header-content p {
  color: #94a3b8;
}

.progress-section {
  margin-top: 1.5rem;
  max-width: 400px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  color: #94a3b8;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.progress-bar {
  height: 8px;
  background: #334155;
  border-radius: 4px;
}

.progress-fill {
  height: 100%;
  background: #42b883;
  border-radius: 4px;
  transition: width 0.3s;
}

.btn-reset {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  margin-left: auto;
}

.btn-reset:hover {
  background: #dc2626;
}

.portal-content {
  display: flex;
  min-height: calc(100vh - 200px);
}

.task-sidebar {
  width: 280px;
  background: #1e293b;
  padding: 1.5rem;
  border-right: 1px solid #334155;
}

.task-sidebar h3 {
  color: #f8fafc;
  margin-bottom: 1rem;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 0.5rem;
  transition: all 0.2s;
}

.task-item:hover:not(.locked) {
  background: #334155;
}

.task-item.active {
  background: #42b883;
}

.task-item.completed {
  opacity: 0.7;
}

.task-item.locked {
  opacity: 0.4;
  cursor: not-allowed;
}

.task-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #334155;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f8fafc;
  font-weight: 600;
}

.task-item.active .task-icon {
  background: white;
  color: #42b883;
}

.task-item.completed .task-icon {
  background: #42b883;
}

.check {
  color: white;
}

.rejected {
  color: #ef4444;
}

.lock {
  font-size: 0.875rem;
}

.task-info {
  flex: 1;
}

.task-name {
  display: block;
  color: #f8fafc;
  font-size: 0.875rem;
  font-weight: 500;
}

.task-status-text {
  display: block;
  color: #94a3b8;
  font-size: 0.75rem;
}

.task-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.welcome-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.welcome-card {
  background: #1e293b;
  padding: 3rem;
  border-radius: 16px;
  text-align: center;
  max-width: 500px;
}

.welcome-card h2 {
  color: #f8fafc;
  margin-bottom: 1rem;
}

.welcome-card p {
  color: #94a3b8;
  margin-bottom: 1.5rem;
}

.requirements {
  background: #0f172a;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  text-align: left;
}

.requirements h3 {
  color: #f8fafc;
  font-size: 1rem;
  margin-bottom: 0.75rem;
}

.requirements ul {
  color: #94a3b8;
  padding-left: 1.25rem;
}

.requirements li {
  margin-bottom: 0.5rem;
}

.btn-start {
  background: #42b883;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-start:hover {
  background: #359268;
  transform: translateY(-2px);
}

.task-detail {
  background: #1e293b;
  border-radius: 16px;
  padding: 2rem;
}

.task-header {
  margin-bottom: 2rem;
}

.task-header h2 {
  color: #f8fafc;
  margin-bottom: 0.5rem;
}

.task-header p {
  color: #94a3b8;
}

.task-type-badge {
  display: inline-block;
  background: #334155;
  color: #94a3b8;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  margin-top: 0.5rem;
}

.completed-message, .rejected-message {
  text-align: center;
  padding: 2rem;
  border-radius: 8px;
}

.completed-message {
  background: rgba(66, 184, 131, 0.1);
}

.rejected-message {
  background: rgba(239, 68, 68, 0.1);
}

.check-icon, .warning-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.completed-message .check-icon { color: #42b883; }
.rejected-message .warning-icon { color: #ef4444; }

.comment {
  color: #94a3b8;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.btn-retry {
  background: #f59e0b;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  margin-top: 1rem;
  cursor: pointer;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section h3 {
  color: #f8fafc;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #334155;
}

.form-info {
  color: #94a3b8;
  background: #0f172a;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  color: #e2e8f0;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input, .form-group select, .form-group textarea {
  width: 100%;
  padding: 0.75rem;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 6px;
  color: #f8fafc;
  font-size: 0.875rem;
}

.form-group input:focus, .form-group select:focus {
  outline: none;
  border-color: #42b883;
}

.form-group small {
  display: block;
  color: #64748b;
  margin-top: 0.25rem;
  font-size: 0.75rem;
}

.mt-2 { margin-top: 0.5rem; }
.mt-4 { margin-top: 1.5rem; }

.form-subsection {
  background: #0f172a;
  padding: 1.5rem;
  border-radius: 8px;
}

.form-desc {
  color: #94a3b8;
  margin-bottom: 1rem;
}

.signature-field {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #334155;
}

.signature-field label {
  display: block;
  color: #e2e8f0;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.signature-line {
  color: #64748b;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.signature-date {
  color: #64748b;
  font-size: 0.75rem;
  margin-top: 0.5rem;
}

.file-upload {
  border: 2px dashed #334155;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.file-upload:hover {
  border-color: #42b883;
}

.upload-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.file-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #0f172a;
  padding: 0.75rem;
  border-radius: 6px;
  margin-top: 0.75rem;
}

.file-name {
  color: #42b883;
}

.file-remove {
  color: #ef4444;
  cursor: pointer;
  font-size: 1.25rem;
}

.policy-content {
  background: #0f172a;
  border-radius: 8px;
  padding: 1.5rem;
  max-height: 300px;
  overflow-y: auto;
}

.policy-text h5 {
  color: #f8fafc;
  margin: 1rem 0 0.5rem;
}

.policy-text p {
  color: #94a3b8;
  line-height: 1.6;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
}

.checkbox-label input {
  width: auto !important;
  margin-top: 0.25rem;
}

.checkbox-label span {
  color: #e2e8f0;
}

.training-item {
  background: #0f172a;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.training-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.training-header h4 {
  color: #f8fafc;
}

.training-status {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.training-status.pending {
  background: #f59e0b;
  color: white;
}

.document-preview {
  background: #0f172a;
  border-radius: 8px;
  overflow: hidden;
}

.doc-header {
  background: #334155;
  padding: 1rem;
}

.doc-header h4 {
  color: #f8fafc;
}

.doc-content {
  padding: 1.5rem;
  color: #94a3b8;
  line-height: 1.8;
}

.signature-pad {
  background: white;
  border-radius: 8px;
  cursor: crosshair;
  width: 100%;
}

.btn-clear {
  background: #334155;
  color: #94a3b8;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  margin-top: 0.5rem;
  cursor: pointer;
}

.legal-text {
  color: #64748b;
  font-size: 0.75rem;
  margin-top: 0.5rem;
}

.role-details {
  background: #0f172a;
  padding: 1.5rem;
  border-radius: 8px;
}

.detail-row {
  display: flex;
  padding: 0.75rem 0;
  border-bottom: 1px solid #334155;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row .label {
  color: #94a3b8;
  width: 150px;
}

.detail-row .value {
  color: #f8fafc;
  font-weight: 500;
}

.form-actions {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #334155;
}

.btn-submit {
  background: #42b883;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-submit:hover:not(:disabled) {
  background: #359268;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.confirmation-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.confirmation-content {
  background: #1e293b;
  padding: 3rem;
  border-radius: 16px;
  text-align: center;
  max-width: 400px;
}

.success-icon {
  width: 80px;
  height: 80px;
  background: #42b883;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: white;
  margin: 0 auto 1.5rem;
}

.confirmation-content h2 {
  color: #f8fafc;
  margin-bottom: 1rem;
}

.confirmation-content p {
  color: #94a3b8;
  margin-bottom: 0.5rem;
}

.confirmation-content .next-step {
  font-size: 0.875rem;
  margin-top: 1rem;
}

.btn-continue {
  background: #42b883;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1.5rem;
  transition: all 0.2s;
}

.btn-continue:hover {
  background: #359268;
  transform: translateY(-2px);
}

.modal-enter-active, .modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
