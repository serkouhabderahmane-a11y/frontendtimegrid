import axios from 'axios'

const isDemoToken = () => {
  const token = localStorage.getItem('accessToken')
  return token?.startsWith('demo-')
}

let mockCandidates = [
  { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', status: 'pending', position: 'Software Engineer', state: 'candidate_created', startDate: '2024-01-15', phone: '555-0101', employmentType: 'full-time' },
  { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', status: 'interviewing', position: 'Product Manager', state: 'packet_assigned', startDate: '2024-01-20', phone: '555-0102', employmentType: 'full-time' },
]

let mockPackets = [
  { id: '1', name: 'Standard Employee Onboarding', description: 'Default onboarding packet for full-time employees' },
]

const mockTasks = [
  { id: 't1', name: 'Personal Information', type: 'personal_info', description: 'Complete your personal profile', isRequired: true, order: 1 },
  { id: 't2', name: 'Government Forms', type: 'government_forms', description: 'W-4 and I-9 tax forms', isRequired: true, order: 2 },
  { id: 't3', name: 'Document Upload', type: 'document_upload', description: 'Upload ID and certifications', isRequired: true, order: 3 },
  { id: 't4', name: 'Policy Acknowledgement', type: 'policy_acknowledgment', description: 'Review and acknowledge company policies', isRequired: true, order: 4 },
  { id: 't5', name: 'Training Acknowledgement', type: 'training_acknowledgment', description: 'Complete required training', isRequired: true, order: 5 },
  { id: 't6', name: 'E-Signature', type: 'e_signature', description: 'Sign offer letter and NDA', isRequired: true, order: 6 },
  { id: 't7', name: 'Role Confirmation', type: 'role_confirmation', description: 'Review and confirm your role', isRequired: true, order: 7 },
]

let mockTaskStatuses = {}

const getMockData = (url, method, data) => {
  try {
    if (method === 'get' && url.includes('/candidates') && url.match(/\/candidates\/[^/]+$/)) {
      const id = url.split('/candidates/')[1]
      const candidate = mockCandidates.find(c => c.id === id)
      const statuses = mockTaskStatuses[id] || []
      if (candidate) {
        return { data: { 
          ...candidate, 
          onboarding: candidate.state !== 'candidate_created' ? { 
            id: 'onboarding-1', 
            currentState: candidate.state,
            progressPercent: candidate.state === 'employee_active' ? 100 : 50,
            taskStatuses: statuses.length ? statuses : mockTasks.map(t => ({
              taskId: t.id,
              task: t,
              status: 'draft'
            }))
          } : null
        }}
      }
    }
    if (method === 'get' && url.includes('/candidates') && !url.includes('/assign-packet')) {
      return { data: [...mockCandidates] }
    }
    if (method === 'post' && url.includes('/candidates') && !url.includes('/assign-packet')) {
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data
      const newCandidate = { 
        ...parsedData, 
        id: Date.now().toString(),
        state: 'candidate_created',
        status: 'pending'
      }
      mockCandidates.unshift(newCandidate)
      mockTaskStatuses[newCandidate.id] = mockTasks.map(t => ({
        taskId: t.id,
        task: t,
        status: 'draft'
      }))
      return { data: newCandidate }
    }
    if (method === 'post' && url.includes('/assign-packet')) {
      const candidateId = url.split('/candidates/')[1]?.split('/')[0]
      const candidate = mockCandidates.find(c => c.id === candidateId)
      if (candidate) {
        candidate.state = 'packet_assigned'
        candidate.packetId = JSON.parse(data)?.packetId || '1'
        return { data: { id: 'onboarding-1', candidateId, currentState: 'packet_assigned', secureToken: 'demo-token-123', taskStatuses: mockTasks.map(t => ({ taskId: t.id, task: t, status: 'draft' })) } }
      }
    }
    if (method === 'get' && url.includes('/packets')) {
      return { data: mockPackets }
    }
    if (url.includes('/hr-dashboard/stats')) {
      return { data: { totalCandidates: 12, pendingApprovals: 3, activeEmployees: 45, onboardingInProgress: 5 } }
    }
    if (method === 'get' && url.includes('/onboarding/token/')) {
      const token = url.split('/token/')[1]
      if (token === 'demo-token-123') {
        return { data: { 
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
          taskStatuses: mockTasks.map(t => ({ taskId: t.id, task: t, status: 'draft' }))
        }}
      }
    }
    if (method === 'post' && url.includes('/tasks/') && url.includes('/submit')) {
      const onboardingId = url.split('/onboarding/')[1]?.split('/')[0]
      const taskId = url.split('/tasks/')[1]?.split('/')[0]
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data
      for (const candidateId in mockTaskStatuses) {
        const statuses = mockTaskStatuses[candidateId]
        const taskStatus = statuses.find(ts => ts.taskId === taskId)
        if (taskStatus) {
          taskStatus.status = 'submitted'
          taskStatus.submissionData = parsedData
          taskStatus.submittedAt = new Date()
        }
      }
      return { data: { success: true } }
    }
    if (method === 'post' && url.includes('/tasks/') && url.includes('/approve')) {
      const taskId = url.split('/tasks/')[1]?.split('/')[0]
      for (const candidateId in mockTaskStatuses) {
        const statuses = mockTaskStatuses[candidateId]
        const taskStatus = statuses.find(ts => ts.taskId === taskId)
        if (taskStatus) {
          taskStatus.status = 'approved'
        }
      }
      return { data: { success: true } }
    }
    if (method === 'post' && url.includes('/tasks/') && url.includes('/reject')) {
      const taskId = url.split('/tasks/')[1]?.split('/')[0]
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data
      for (const candidateId in mockTaskStatuses) {
        const statuses = mockTaskStatuses[candidateId]
        const taskStatus = statuses.find(ts => ts.taskId === taskId)
        if (taskStatus) {
          taskStatus.status = 'rejected'
          taskStatus.reviewComment = parsedData?.comment
        }
      }
      return { data: { success: true } }
    }
  } catch (e) {
    console.error('Mock data error:', e)
  }
  return null
}

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
})

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

api.interceptors.response.use(
  response => response,
  error => {
    const url = error.config?.url || ''
    const method = error.config?.method?.toLowerCase() || 'get'
    const data = error.config?.data || '{}'
    
    if (isDemoToken()) {
      const mockData = getMockData(url, method, data)
      if (mockData) {
        return Promise.resolve(mockData)
      }
    }
    
    if (error.response?.status === 401) {
      const token = localStorage.getItem('accessToken')
      if (token?.startsWith('demo-')) {
        return Promise.reject(new Error('Demo mode not supported for this endpoint'))
      }
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
