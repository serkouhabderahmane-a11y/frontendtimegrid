import axios from 'axios'

const isDemoToken = () => {
  const token = localStorage.getItem('accessToken')
  return token?.startsWith('demo-') || token?.startsWith('demo-token-')
}

const isDemoMode = () => localStorage.getItem('isDemo') === 'true'

// Demo data store - in-memory for CRUD operations
const demoDataStore = {
  employees: [],
  timeEntries: [],
  notes: [],
  medications: [],
  posts: [],
  onboardingTasks: [],
  
  // Initialize with seed data
  init() {
    if (this.employees.length === 0) {
      this.employees = [
        { id: 'demo-emp-1', first_name: 'John', last_name: 'Smith', email: 'john.smith@demo.com', role: 'staff', status: 'active', department: 'Operations' },
        { id: 'demo-emp-2', first_name: 'Jane', last_name: 'Doe', email: 'jane.doe@demo.com', role: 'nurse', status: 'active', department: 'Care' },
        { id: 'demo-emp-3', first_name: 'Bob', last_name: 'Wilson', email: 'bob.wilson@demo.com', role: 'staff', status: 'active', department: 'Operations' },
      ]
    }
    if (this.posts.length === 0) {
      this.posts = [
        { id: 'demo-post-1', title: 'Welcome to TimeGrid', content: 'This is a demo post. Feel free to create your own!', author_id: 'demo-admin', likes: 5, created_at: new Date().toISOString() },
      ]
    }
  },
  
  reset() {
    this.employees = []
    this.timeEntries = []
    this.notes = []
    this.medications = []
    this.posts = []
    this.onboardingTasks = []
    this.init()
  }
}

demoDataStore.init()

// Mock Data for Payroll
let mockPayPeriods = [
  { id: '1', name: 'January 2024', startDate: '2024-01-01', endDate: '2024-01-15', status: 'open' },
  { id: '2', name: 'December 2023', startDate: '2023-12-16', endDate: '2023-12-31', status: 'calculated', calculatedAt: '2024-01-05T10:00:00Z' },
]

let mockTimesheets = [
  { id: 't1', employeeId: 'e1', employee: { user: { firstName: 'John', lastName: 'Doe' } }, clockIn: '2024-01-10T09:00:00Z', clockOut: '2024-01-10T17:00:00Z', totalMinutes: 480, regularMinutes: 480, overtimeMinutes: 0, breakMinutes: 30, status: 'submitted', payPeriodId: '1' },
  { id: 't2', employeeId: 'e2', employee: { user: { firstName: 'Jane', lastName: 'Smith' } }, clockIn: '2024-01-10T08:30:00Z', clockOut: '2024-01-10T17:30:00Z', totalMinutes: 540, regularMinutes: 480, overtimeMinutes: 60, breakMinutes: 30, status: 'approved', payPeriodId: '1' },
  { id: 't3', employeeId: 'e1', employee: { user: { firstName: 'John', lastName: 'Doe' } }, clockIn: '2024-01-11T09:00:00Z', clockOut: '2024-01-11T18:00:00Z', totalMinutes: 540, regularMinutes: 480, overtimeMinutes: 60, breakMinutes: 30, status: 'approved', payPeriodId: '1' },
  { id: 't4', employeeId: 'e2', employee: { user: { firstName: 'Jane', lastName: 'Smith' } }, clockIn: '2024-01-12T08:30:00Z', clockOut: '2024-01-12T17:00:00Z', totalMinutes: 510, regularMinutes: 480, overtimeMinutes: 30, breakMinutes: 30, status: 'submitted', payPeriodId: '1' },
]

let mockPayrollRecords = [
  { employeeId: 'e1', employeeName: 'John Doe', totalHours: 42.5, breakDeductions: 1, overtimeHours: 2.5, overtimePay: 56.25, regularPay: 637.50, grossPay: 693.75, payRate: 15 },
  { employeeId: 'e2', employeeName: 'Jane Smith', totalHours: 40, breakDeductions: 1, overtimeHours: 0, overtimePay: 0, regularPay: 600, grossPay: 600, payRate: 15 },
]

// Mock Data for Daily Notes
let mockDailyNotes = [
  { id: 'n1', tenantId: 't1', employeeId: 'e1', date: '2024-01-15', content: 'Employee completed all assigned tasks on time. Good progress on project X.', attachments: '[]', status: 'submitted', reviewedAt: null, lockedAt: null, employee: { user: { firstName: 'John', lastName: 'Doe' } } },
  { id: 'n2', tenantId: 't1', employeeId: 'e2', date: '2024-01-15', content: 'Arrived 15 minutes late due to traffic. Informed manager in advance.', attachments: '[]', status: 'locked', reviewedAt: '2024-01-16T09:00:00Z', lockedAt: '2024-01-16T10:00:00Z', employee: { user: { firstName: 'Jane', lastName: 'Smith' } } },
  { id: 'n3', tenantId: 't1', employeeId: 'e1', date: '2024-01-14', content: 'Team meeting attended. Discussed sprint goals.', attachments: '[]', status: 'draft', reviewedAt: null, lockedAt: null, employee: { user: { firstName: 'John', lastName: 'Doe' } } },
]

// Mock Data for MAR
let mockMARRecords = [
  { id: 'm1', tenantId: 't1', employeeId: 'e1', medicationName: 'Insulin', scheduledTime: '2024-01-15T08:00:00Z', outcome: 'given', outcomeTime: '2024-01-15T08:05:00Z', reasonNotGiven: null, administeredBy: 'Jane Smith', lockedAt: null, employee: { user: { firstName: 'John', lastName: 'Doe' } } },
  { id: 'm2', tenantId: 't1', employeeId: 'e2', medicationName: 'Blood Pressure Med', scheduledTime: '2024-01-15T09:00:00Z', outcome: 'missed', outcomeTime: null, reasonNotGiven: 'Patient was not present', administeredBy: null, lockedAt: '2024-01-15T12:00:00Z', employee: { user: { firstName: 'Jane', lastName: 'Smith' } } },
  { id: 'm3', tenantId: 't1', employeeId: 'e1', medicationName: 'Vitamin D', scheduledTime: '2024-01-15T12:00:00Z', outcome: 'refused', outcomeTime: '2024-01-15T12:00:00Z', reasonNotGiven: 'Patient refused medication', administeredBy: 'Jane Smith', lockedAt: null, employee: { user: { firstName: 'John', lastName: 'Doe' } } },
]

let mockCandidates = [
  { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', status: 'pending', position: 'Software Engineer', state: 'candidate_created', startDate: '2024-01-15', phone: '555-0101', employmentType: 'full-time' },
  { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', status: 'interviewing', position: 'Product Manager', state: 'packet_assigned', startDate: '2024-01-20', phone: '555-0102', employmentType: 'full-time' },
]

let mockEmployees = [
  { id: 'e1', userId: 'u1', employeeNumber: 'EMP001', departmentId: 'd1', startDate: '2024-01-01', onboardingStatus: 'employee_active', canClockIn: true, hourlyRate: 18.00, overtimeRate: 27.00, user: { firstName: 'John', lastName: 'Doe' }, department: { name: 'Engineering' } },
  { id: 'e2', userId: 'u2', employeeNumber: 'EMP002', departmentId: 'd2', startDate: '2023-06-15', onboardingStatus: 'employee_active', canClockIn: true, hourlyRate: 22.00, overtimeRate: 33.00, user: { firstName: 'Jane', lastName: 'Smith' }, department: { name: 'Operations' } },
  { id: 'e3', userId: 'u3', employeeNumber: 'EMP003', departmentId: 'd1', startDate: '2023-09-01', onboardingStatus: 'employee_active', canClockIn: true, hourlyRate: 20.00, overtimeRate: 30.00, user: { firstName: 'Bob', lastName: 'Wilson' }, department: { name: 'Engineering' } },
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

// Demo Training Videos - HR Configured
const DEMO_TRAINING_VIDEOS_STORAGE_KEY = 'demo_training_videos'
const DEMO_TRAINING_PROGRESS_KEY = 'demo_training_progress'
const DEMO_VIDEO_ASSIGNMENTS_KEY = 'demo_training_video_assignments'

// Government Forms Persistence (Demo Mode)
const GOV_FORMS_DRAFT_KEY = 'demo_gov_forms_draft'
const GOV_FORMS_SNAPSHOT_KEY = 'demo_gov_forms_snapshot'

const getGovFormsDraft = () => {
  try {
    const saved = localStorage.getItem(GOV_FORMS_DRAFT_KEY)
    return saved ? JSON.parse(saved) : null
  } catch (e) { return null }
}

const saveGovFormsDraft = (data) => {
  try {
    localStorage.setItem(GOV_FORMS_DRAFT_KEY, JSON.stringify({
      ...data,
      savedAt: new Date().toISOString(),
      version: '1.0'
    }))
  } catch (e) {}
}

const getGovFormsSnapshot = () => {
  try {
    const saved = localStorage.getItem(GOV_FORMS_SNAPSHOT_KEY)
    return saved ? JSON.parse(saved) : null
  } catch (e) { return null }
}

const saveGovFormsSnapshot = (data) => {
  try {
    localStorage.setItem(GOV_FORMS_SNAPSHOT_KEY, JSON.stringify({
      ...data,
      submittedAt: new Date().toISOString(),
      version: '1.0',
      snapshotId: `snap-${Date.now()}`
    }))
  } catch (e) {}
}

const clearGovFormsDraft = () => {
  try {
    localStorage.removeItem(GOV_FORMS_DRAFT_KEY)
  } catch (e) {}
}

// Video Assignment Management
const getVideoAssignments = () => {
  try {
    const saved = localStorage.getItem(DEMO_VIDEO_ASSIGNMENTS_KEY)
    return saved ? JSON.parse(saved) : {}
  } catch (e) { return {} }
}

const saveVideoAssignment = (videoId, trainingTaskId) => {
  try {
    const assignments = getVideoAssignments()
    if (!assignments[trainingTaskId]) {
      assignments[trainingTaskId] = []
    }
    if (!assignments[trainingTaskId].includes(videoId)) {
      assignments[trainingTaskId].push(videoId)
    }
    localStorage.setItem(DEMO_VIDEO_ASSIGNMENTS_KEY, JSON.stringify(assignments))
  } catch (e) {}
}

const getVideosForTask = (trainingTaskId) => {
  try {
    const videos = getDemoTrainingVideos()
    const assignments = getVideoAssignments()
    const taskVideoIds = assignments[trainingTaskId] || []
    
    // Filter videos that are assigned to this task
    if (taskVideoIds.length > 0) {
      return videos.filter(v => taskVideoIds.includes(v.id))
    }
    return []
  } catch (e) { return [] }
}

const getDemoTrainingVideos = () => {
  try {
    const saved = localStorage.getItem(DEMO_TRAINING_VIDEOS_STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e) {}
  // Default videos if none configured - self-hosted format
  return [
    {
      id: 'vid-1',
      title: 'Workplace Safety Fundamentals',
      description: 'Learn essential workplace safety protocols and emergency procedures.',
      video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      video_source: 'url',
      duration_seconds: 600,
      thumbnail_url: null,
      is_required: true,
      completion_threshold: 90,
      display_order: 1,
    },
    {
      id: 'vid-2',
      title: 'Harassment Prevention Training',
      description: 'Understanding and preventing workplace harassment.',
      video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      video_source: 'url',
      duration_seconds: 1200,
      thumbnail_url: null,
      is_required: true,
      completion_threshold: 90,
      display_order: 2,
    },
    {
      id: 'vid-3',
      title: 'Data Security & Privacy',
      description: 'Best practices for handling sensitive data and maintaining privacy.',
      video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      video_source: 'url',
      duration_seconds: 900,
      thumbnail_url: null,
      is_required: true,
      completion_threshold: 90,
      display_order: 3,
    },
    {
      id: 'vid-4',
      title: 'Company Culture & Values',
      description: 'An introduction to our company culture, mission, and core values.',
      video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      video_source: 'url',
      duration_seconds: 480,
      thumbnail_url: null,
      is_required: false,
      completion_threshold: 80,
      display_order: 4,
    },
  ]
}

const getDemoTrainingProgress = () => {
  try {
    const saved = localStorage.getItem(DEMO_TRAINING_PROGRESS_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e) {}
  return {}
}

const saveDemoTrainingProgress = (progress) => {
  try {
    localStorage.setItem(DEMO_TRAINING_PROGRESS_KEY, JSON.stringify(progress))
  } catch (e) {}
}

let mockSocialFeedPosts = [
  {
    id: 'demo-post-1',
    tenantId: 'demo-tenant-1',
    authorId: 'demo-admin-1',
    content: '🎉 Welcome to our new HR platform! This is your central hub for all employee management, time tracking, and company announcements. Feel free to explore and let us know if you have any questions!',
    isPinned: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    author: { id: 'demo-admin-1', firstName: 'Michael', lastName: 'Chen', role: 'admin' },
    reactions: [
      { postId: 'demo-post-1', userId: 'demo-hr-1', type: 'love' },
      { postId: 'demo-post-1', userId: 'demo-manager-1', type: 'celebrate' },
      { postId: 'demo-post-1', userId: 'demo-employee-1', type: 'like' },
      { postId: 'demo-post-1', userId: 'demo-employee-2', type: 'celebrate' },
    ],
    comments: [
      { id: 'c1', postId: 'demo-post-1', userId: 'demo-hr-1', content: 'This looks amazing! Great work on the setup!', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), user: { id: 'demo-hr-1', firstName: 'Sarah', lastName: 'Johnson' } },
      { id: 'c2', postId: 'demo-post-1', userId: 'demo-employee-1', content: 'Excited to try this out! 👀', createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(), user: { id: 'demo-employee-1', firstName: 'John', lastName: 'Smith' } },
    ]
  },
  {
    id: 'demo-post-2',
    tenantId: 'demo-tenant-1',
    authorId: 'demo-hr-1',
    content: '📢 Important Reminder: Please submit your timesheets by Friday at 5 PM. Late submissions may delay payroll processing!',
    isPinned: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    author: { id: 'demo-hr-1', firstName: 'Sarah', lastName: 'Johnson', role: 'hr' },
    reactions: [{ postId: 'demo-post-2', userId: 'demo-employee-1', type: 'like' }],
    comments: []
  },
  {
    id: 'demo-post-3',
    tenantId: 'demo-tenant-1',
    authorId: 'demo-manager-1',
    content: 'Great job team on completing the Q1 deliverables! 🎯 Your hard work and dedication are truly appreciated.',
    isPinned: false,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    author: { id: 'demo-manager-1', firstName: 'Emily', lastName: 'Davis', role: 'manager' },
    reactions: [
      { postId: 'demo-post-3', userId: 'demo-hr-1', type: 'love' },
      { postId: 'demo-post-3', userId: 'demo-employee-2', type: 'celebrate' },
    ],
    comments: []
  },
]

let mockChatConversations = [
  {
    id: 'demo-conv-1',
    tenantId: 'demo-tenant-1',
    participants: [
      { userId: 'demo-hr-1', firstName: 'Sarah', lastName: 'Johnson', role: 'hr' },
      { userId: 'demo-employee-1', firstName: 'John', lastName: 'Smith', role: 'employee' },
    ],
    lastMessage: { content: 'That\'s wonderful to hear! Let me know if you have any questions.', createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-conv-2',
    tenantId: 'demo-tenant-1',
    participants: [
      { userId: 'demo-admin-1', firstName: 'Michael', lastName: 'Chen', role: 'admin' },
      { userId: 'demo-manager-1', firstName: 'Emily', lastName: 'Davis', role: 'manager' },
    ],
    lastMessage: { content: 'Of course! I\'ll prepare the documentation beforehand.', createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-conv-3',
    tenantId: 'demo-tenant-1',
    participants: [
      { userId: 'demo-employee-1', firstName: 'John', lastName: 'Smith', role: 'employee' },
      { userId: 'demo-employee-2', firstName: 'Lisa', lastName: 'Brown', role: 'employee' },
    ],
    lastMessage: { content: 'Sure! Meet at the cafeteria in 30?', createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
]

let mockChatMessages = {
  'demo-conv-1': [
    { id: 'm1', conversationId: 'demo-conv-1', senderId: 'demo-hr-1', content: 'Hi John! Just wanted to check in - how\'s your onboarding going?', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), sender: { id: 'demo-hr-1', firstName: 'Sarah', lastName: 'Johnson' } },
    { id: 'm2', conversationId: 'demo-conv-1', senderId: 'demo-employee-1', content: 'Hi Sarah! It\'s going great, thank you for asking!', createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(), sender: { id: 'demo-employee-1', firstName: 'John', lastName: 'Smith' } },
    { id: 'm3', conversationId: 'demo-conv-1', senderId: 'demo-hr-1', content: 'That\'s wonderful to hear! Let me know if you have any questions.', createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), sender: { id: 'demo-hr-1', firstName: 'Sarah', lastName: 'Johnson' } },
  ],
  'demo-conv-2': [
    { id: 'm4', conversationId: 'demo-conv-2', senderId: 'demo-admin-1', content: 'Emily, can we discuss the Q2 hiring plan tomorrow?', createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), sender: { id: 'demo-admin-1', firstName: 'Michael', lastName: 'Chen' } },
    { id: 'm5', conversationId: 'demo-conv-2', senderId: 'demo-manager-1', content: 'Of course! I\'ll prepare the documentation beforehand.', createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), sender: { id: 'demo-manager-1', firstName: 'Emily', lastName: 'Davis' } },
  ],
  'demo-conv-3': [
    { id: 'm6', conversationId: 'demo-conv-3', senderId: 'demo-employee-2', content: 'Hey John! Are you free for lunch today?', createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), sender: { id: 'demo-employee-2', firstName: 'Lisa', lastName: 'Brown' } },
    { id: 'm7', conversationId: 'demo-conv-3', senderId: 'demo-employee-1', content: 'Sure! Meet at the cafeteria in 30?', createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), sender: { id: 'demo-employee-1', firstName: 'John', lastName: 'Smith' } },
  ],
}

const mockChatUsers = [
  { id: 'demo-hr-1', firstName: 'Sarah', lastName: 'Johnson', email: 'hr@demo.com', role: 'hr' },
  { id: 'demo-admin-1', firstName: 'Michael', lastName: 'Chen', email: 'admin@demo.com', role: 'admin' },
  { id: 'demo-manager-1', firstName: 'Emily', lastName: 'Davis', email: 'manager@demo.com', role: 'manager' },
  { id: 'demo-employee-1', firstName: 'John', lastName: 'Smith', email: 'john@demo.com', role: 'employee' },
  { id: 'demo-employee-2', firstName: 'Lisa', lastName: 'Brown', email: 'lisa@demo.com', role: 'employee' },
  { id: 'demo-employee-3', firstName: 'David', lastName: 'Wilson', email: 'david@demo.com', role: 'employee' },
  { id: 'demo-employee-4', firstName: 'Anna', lastName: 'Martinez', email: 'anna@demo.com', role: 'employee' },
]

const getMockData = (url, method, data) => {
  try {
    // Extract path from URL if full URL is provided
    const path = url.includes('http') ? new URL(url).pathname : url
    
    // Mock Auth endpoints for demo mode
    if (method === 'get' && path === '/auth/me') {
      return { data: { id: 'demo-hr-1', email: 'hr@demo.com', firstName: 'Sarah', lastName: 'Johnson', role: 'hr', tenantId: 'demo-tenant-1' } }
    }
    if (method === 'post' && path === '/auth/login') {
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data
      const user = mockChatUsers.find(u => u.email === parsedData.email)
      if (user) {
        return { 
          data: { 
            user: { ...user, tenantId: 'demo-tenant-1' }, 
            accessToken: 'demo-token-' + Date.now(), 
            refreshToken: 'demo-refresh-' + Date.now() 
          } 
        }
      }
    }
    
    if (method === 'get' && path.includes('/candidates') && path.match(/\/candidates\/[^/]+$/)) {
      const id = path.split('/candidates/')[1]
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
    if (method === 'get' && path.includes('/candidates') && !path.includes('/assign-packet')) {
      return { data: [...mockCandidates] }
    }
    if (method === 'post' && path.includes('/candidates') && !path.includes('/assign-packet')) {
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
    if (method === 'post' && path.includes('/assign-packet')) {
      const candidateId = path.split('/candidates/')[1]?.split('/')[0]
      const candidate = mockCandidates.find(c => c.id === candidateId)
      if (candidate) {
        candidate.state = 'packet_assigned'
        candidate.packetId = JSON.parse(data)?.packetId || '1'
        return { data: { id: 'onboarding-1', candidateId, currentState: 'packet_assigned', secureToken: 'demo-token-123', taskStatuses: mockTasks.map(t => ({ taskId: t.id, task: t, status: 'draft' })) } }
      }
    }
    if (method === 'get' && path.includes('/packets')) {
      return { data: mockPackets }
    }
    if (path.includes('/hr-dashboard/stats')) {
      return { data: { totalCandidates: 12, pendingApprovals: 3, activeEmployees: 45, onboardingInProgress: 5 } }
    }
    if (method === 'get' && path === '/employees') {
      return { data: mockEmployees }
    }
    if (method === 'patch' && path.match(/^\/employees\/[^/]+$/)) {
      const id = path.split('/employees/')[1]
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data
      const emp = mockEmployees.find(e => e.id === id)
      if (emp) {
        if (parsedData.hourlyRate !== undefined) emp.hourlyRate = parsedData.hourlyRate
        if (parsedData.overtimeRate !== undefined) emp.overtimeRate = parsedData.overtimeRate
      }
      return { data: emp }
    }
    if (method === 'get' && path === '/tenant/settings') {
      return { data: { settings: { defaultHourlyRate: 15, defaultOvertimeRate: 22.5, overtimeThreshold: 480 } } }
    }
    if (method === 'get' && path.includes('/onboarding/token/')) {
      const token = path.split('/token/')[1]
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
    if (method === 'post' && path.includes('/tasks/') && path.includes('/submit')) {
      const onboardingId = path.split('/onboarding/')[1]?.split('/')[0]
      const taskId = path.split('/tasks/')[1]?.split('/')[0]
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
    if (method === 'post' && path.includes('/tasks/') && path.includes('/approve')) {
      const taskId = path.split('/tasks/')[1]?.split('/')[0]
      for (const candidateId in mockTaskStatuses) {
        const statuses = mockTaskStatuses[candidateId]
        const taskStatus = statuses.find(ts => ts.taskId === taskId)
        if (taskStatus) {
          taskStatus.status = 'approved'
        }
      }
      return { data: { success: true } }
    }
    if (method === 'post' && path.includes('/tasks/') && path.includes('/reject')) {
      const taskId = path.split('/tasks/')[1]?.split('/')[0]
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
    
    // Training Video endpoints
    if (method === 'get' && path.match(/^\/onboarding\/training\/([^/]+)\/videos$/)) {
      const trainingId = path.match(/^\/onboarding\/training\/([^/]+)\/videos$/)[1]
      
      // Get videos assigned to this specific training task
      const taskVideos = getVideosForTask(trainingId)
      const progress = getDemoTrainingProgress()
      
      // If no task-specific videos, fall back to all videos (for demo compatibility)
      const videos = taskVideos.length > 0 ? taskVideos : getDemoTrainingVideos()
      
      const videosWithProgress = videos.map(v => ({
        ...v,
        progress: progress[v.id] || {
          watched_seconds: 0,
          total_seconds: v.duration_seconds,
          completion_percentage: 0,
          is_completed: false,
          completed_at: null,
        }
      }))
      
      // Return empty array if no videos (never return null)
      return { data: { videos: videosWithProgress } }
    }
    
    if (method === 'get' && path.match(/^\/onboarding\/training\/([^/]+)\/progress$/)) {
      const trainingId = path.match(/^\/onboarding\/training\/([^/]+)\/progress$/)[1]
      
      // Get videos assigned to this specific training task
      const taskVideos = getVideosForTask(trainingId)
      const progress = getDemoTrainingProgress()
      
      // If no task-specific videos, fall back to all videos (for demo compatibility)
      const videos = taskVideos.length > 0 ? taskVideos : getDemoTrainingVideos()
      
      const videosWithProgress = videos.map(v => ({
        video_id: v.id,
        video_title: v.title,
        watched_seconds: progress[v.id]?.watched_seconds || 0,
        total_seconds: v.duration_seconds,
        completion_percentage: progress[v.id]?.completion_percentage || 0,
        is_completed: progress[v.id]?.is_completed || false,
        completed_at: progress[v.id]?.completed_at || null,
      }))
      const completedRequired = videos.filter(v => v.is_required && progress[v.id]?.is_completed).length
      const requiredCount = videos.filter(v => v.is_required).length
      return { data: {
        training_definition_id: trainingId,
        training_name: 'Required Training',
        has_videos: videos.length > 0,
        videos: videosWithProgress,
        all_required_completed: completedRequired >= requiredCount,
        videos_completed: completedRequired,
        videos_required: requiredCount,
        videos_total: videos.length,
        completion_percentage: videos.length > 0 && requiredCount > 0 ? Math.round((completedRequired / requiredCount) * 100) : 0,
        acknowledged: false,
        acknowledged_at: null,
        certificate_uploaded: false,
        can_acknowledge: completedRequired >= requiredCount,
        cannot_acknowledge_reason: completedRequired < requiredCount && requiredCount > 0 ? `${requiredCount - completedRequired} required video(s) must be completed` : null,
      }}
    }
    
    if (method === 'post' && path === '/onboarding/training/video/progress') {
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data
      const videos = getDemoTrainingVideos()
      const progress = getDemoTrainingProgress()
      const video = videos.find(v => v.id === parsedData.video_id)
      if (video) {
        const isCompleted = parsedData.completion_percentage >= video.completion_threshold
        progress[parsedData.video_id] = {
          watched_seconds: parsedData.watched_duration,
          total_seconds: video.duration_seconds,
          completion_percentage: Math.min(100, parsedData.completion_percentage),
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
          last_position: parsedData.current_position,
        }
        saveDemoTrainingProgress(progress)
        console.log('[Demo Training] Progress updated:', progress[parsedData.video_id])
      }
      return { data: {
        video_id: parsedData.video_id,
        video_title: video?.title || 'Unknown',
        watched_seconds: parsedData.watched_duration,
        total_seconds: video?.duration_seconds || 0,
        completion_percentage: Math.min(100, parsedData.completion_percentage),
        is_completed: parsedData.completion_percentage >= (video?.completion_threshold || 90),
        completed_at: parsedData.completion_percentage >= (video?.completion_threshold || 90) ? new Date().toISOString() : null,
      }}
    }
    
    if (method === 'post' && path === '/onboarding/training/acknowledge') {
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data
      const videos = getDemoTrainingVideos()
      const progress = getDemoTrainingProgress()
      const completedRequired = videos.filter(v => v.is_required && progress[v.id]?.is_completed).length
      const requiredCount = videos.filter(v => v.is_required).length
      
      if (completedRequired < requiredCount) {
        return { error: { message: `${requiredCount - completedRequired} required video(s) must be completed before acknowledging` }}
      }
      
      console.log('[Demo Training] Training acknowledged, videos completed:', completedRequired)
      return { data: {
        id: `ack-${Date.now()}`,
        acknowledged: true,
        acknowledged_at: new Date().toISOString(),
      }}
    }
    
    // Government Forms Persistence Endpoints
    if (method === 'get' && path.match(/^\/onboarding\/government-forms\/draft$/)) {
      const draft = getGovFormsDraft()
      const snapshot = getGovFormsSnapshot()
      
      if (snapshot) {
        return { data: {
          status: 'submitted',
          snapshot: snapshot,
          draft: null,
          message: 'Form has been submitted'
        }}
      }
      
      if (draft) {
        return { data: {
          status: 'draft',
          draft: draft,
          snapshot: null,
          savedAt: draft.savedAt,
          version: draft.version || '1.0'
        }}
      }
      
      return { data: {
        status: 'empty',
        draft: null,
        snapshot: null,
        version: '1.0'
      }}
    }
    
    if (method === 'post' && path === '/onboarding/government-forms/draft') {
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data
      saveGovFormsDraft(parsedData)
      
      console.log('[Gov Forms] Draft saved:', parsedData)
      return { data: {
        success: true,
        status: 'draft',
        savedAt: new Date().toISOString(),
        version: '1.0'
      }}
    }
    
    if (method === 'post' && path === '/onboarding/government-forms/submit') {
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data
      
      // Validate required fields before submission
      if (!parsedData.w4FilingStatus || !parsedData.w4Dependents) {
        return { error: { message: 'W-4 form is incomplete' }, status: 400 }
      }
      if (!parsedData.i9DocType || !parsedData.i9DocNumber || !parsedData.i9Status) {
        return { error: { message: 'I-9 form is incomplete' }, status: 400 }
      }
      if (!parsedData.i9UploadedFileData) {
        return { error: { message: 'I-9 document upload is required' }, status: 400 }
      }
      
      // Create immutable snapshot
      saveGovFormsSnapshot(parsedData)
      clearGovFormsDraft()
      
      console.log('[Gov Forms] Form submitted, snapshot created')
      return { data: {
        success: true,
        status: 'submitted',
        submittedAt: new Date().toISOString(),
        snapshotId: `snap-${Date.now()}`
      }}
    }
    
    // HR Video Upload Endpoint
    if (method === 'post' && path === '/hr/training-videos/upload') {
      // Parse multipart form data from simulated FormData
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data
      
      // This is actually called from FormData, so we extract fields from the parsed object
      const title = parsedData.title || 'Untitled Video'
      const description = parsedData.description || ''
      const isRequired = parsedData.is_required !== 'false'
      const completionThreshold = parseInt(parsedData.completion_threshold) || 95
      const trainingTaskId = parsedData.training_task_id
      
      if (!trainingTaskId) {
        return { error: { message: 'training_task_id is required. Video must be linked to a training task.' }, status: 400 }
      }
      
      // Create video record
      const videoId = `uploaded-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const fileId = videoId
      
      const video = {
        id: videoId,
        title: title,
        description: description,
        video_url: `local:demo-tenant/${fileId}`,
        video_source: 'uploaded',
        duration_seconds: 0,
        thumbnail_url: null,
        is_required: isRequired,
        completion_threshold: completionThreshold,
        display_order: 1,
        uploaded_at: new Date().toISOString(),
        file_id: fileId,
        training_task_id: trainingTaskId,
      }
      
      // Save video to storage
      const videos = getDemoTrainingVideos()
      videos.push(video)
      try {
        localStorage.setItem(DEMO_TRAINING_VIDEOS_STORAGE_KEY, JSON.stringify(videos))
      } catch (e) {}
      
      // CRITICAL: Assign video to training task (this is what makes it visible to employees!)
      saveVideoAssignment(videoId, trainingTaskId)
      
      console.log('[HR Video Upload] Video saved and assigned to task:', videoId, trainingTaskId)
      
      return { data: {
        video_id: videoId,
        file_id: fileId,
        filename: 'uploaded-video.mp4',
        file_size: 0,
        duration_seconds: 0,
        title: title,
        video_url: `/api/videos/stream/demo-tenant/${fileId}`,
        video_source: 'uploaded',
        content_type: 'video/mp4',
        training_task_id: trainingTaskId,
      }}
    }
    
    // HR Training Videos Settings (list all videos with assignments)
    if (method === 'get' && path === '/onboarding/training-videos/settings') {
      const videos = getDemoTrainingVideos()
      const assignments = getVideoAssignments()
      
      // Get all videos with their assignment info
      const videosWithAssignments = videos.map(v => {
        const taskIds = Object.keys(assignments).filter(taskId => 
          assignments[taskId]?.includes(v.id)
        )
        return {
          id: v.id,
          title: v.title,
          description: v.description,
          url: v.video_url,
          video_source: v.video_source,
          duration: v.duration_seconds,
          is_required: v.is_required,
          completion_threshold: v.completion_threshold,
          assigned_tasks: taskIds,
          uploaded_at: v.uploaded_at,
        }
      })
      
      return { data: {
        videos: videosWithAssignments,
        settings: {
          requireAllVideos: true,
          allowSkip: true,
          trackProgress: true,
          minWatchPercent: 80,
        }
      }}
    }
    
    // Video streaming URL endpoint
    if (method === 'get' && path.match(/\/training\/([^/]+)\/videos\/([^/]+)\/stream-url/)) {
      const match = path.match(/\/training\/([^/]+)\/videos\/([^/]+)\/stream-url/)
      const trainingId = match[1]
      const videoId = match[2]
      
      const videos = getDemoTrainingVideos()
      const video = videos.find(v => v.id === videoId)
      
      if (!video) {
        return { error: { message: 'Video not found' }, status: 404 }
      }
      
      // For self-hosted videos, generate a mock signed URL
      if (video.video_source === 'uploaded') {
        const expires = Math.floor(Date.now() / 1000) + 3600
        const sig = 'demo-signature-' + videoId
        const streamUrl = `/api/videos/stream/demo-tenant/${videoId}?expires=${expires}&sig=${sig}`
        
        return { data: {
          video_id: videoId,
          stream_url: streamUrl,
          thumbnail_url: `/api/videos/thumbnail/demo-tenant/${videoId}`,
          expires_at: new Date(expires * 1000).toISOString(),
          content_type: 'video/mp4',
          source: 'uploaded',
          file_id: videoId,
        }}
      }
      
      // For external URLs, return the original
      return { data: {
        video_id: videoId,
        stream_url: video.video_url,
        thumbnail_url: null,
        expires_at: null,
        content_type: 'video/mp4',
        source: 'external',
        file_id: null,
      }}
    }
    
    // Video progress heartbeat
    if (method === 'post' && path.match(/\/training\/video\/progress\/heartbeat/)) {
      return { data: { status: 'ok', position: 0 }}
    }
    
    // Mock Payroll endpoints
    if (method === 'get' && path.match(/^\/payroll\/pay-periods(\?.*)?$/)) {
      return { data: mockPayPeriods }
    }
    if (method === 'get' && path.match(/^\/payroll\/pay-periods\/[^/]+$/)) {
      const id = path.split('/payroll/pay-periods/')[1]
      const period = mockPayPeriods.find(p => p.id === id)
      if (period) {
        return { data: { ...period, timeEntries: mockTimesheets } }
      }
    }
    if (method === 'post' && path.includes('/payroll/pay-periods') && !path.includes('/lock') && !path.includes('/calculate') && !path.includes('/export')) {
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data
      const newPeriod = {
        id: Date.now().toString(),
        name: parsedData.name,
        startDate: parsedData.startDate,
        endDate: parsedData.endDate,
        status: 'open'
      }
      mockPayPeriods.push(newPeriod)
      return { data: newPeriod }
    }
    if (method === 'post' && path.includes('/payroll/pay-periods/') && path.includes('/lock')) {
      const id = path.split('/pay-periods/')[1].split('/')[0]
      const period = mockPayPeriods.find(p => p.id === id)
      if (period) {
        period.status = 'locked'
        period.lockedAt = new Date()
      }
      return { data: period }
    }
    if (method === 'post' && path.includes('/payroll/pay-periods/') && path.includes('/calculate')) {
      const id = path.split('/pay-periods/')[1].split('/')[0]
      const period = mockPayPeriods.find(p => p.id === id)
      if (period) {
        period.status = 'calculated'
        period.calculatedAt = new Date()
      }
      return { data: { payPeriodId: id, records: mockPayrollRecords } }
    }
    if (method === 'post' && path.includes('/payroll/pay-periods/') && path.includes('/export')) {
      return { data: { payPeriodReference: 'Jan 2024', exportDate: new Date(), provider: 'ADP', data: mockPayrollRecords } }
    }
    if (method === 'post' && path.includes('/payroll/timesheets/') && path.includes('/approve')) {
      const id = path.split('/timesheets/')[1].split('/')[0]
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data
      const entry = mockTimesheets.find(t => t.id === id)
      if (entry) {
        entry.status = parsedData.approved ? 'approved' : 'rejected'
        entry.approvedAt = new Date()
        entry.rejectionReason = parsedData.rejectionReason
      }
      return { data: entry }
    }
    if (method === 'post' && path.includes('/payroll/timesheets/') && path.includes('/adjust')) {
      const id = path.split('/timesheets/')[1].split('/')[0]
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data
      const entry = mockTimesheets.find(t => t.id === id)
      if (entry) {
        entry.regularMinutes = parsedData.regularMinutes
        entry.overtimeMinutes = parsedData.overtimeMinutes || 0
        entry.breakMinutes = parsedData.breakMinutes || 0
        entry.totalMinutes = (parsedData.regularMinutes || 0) + (parsedData.overtimeMinutes || 0)
      }
      return { data: entry }
    }
    if (method === 'get' && path.includes('/time-entries/admin/all')) {
      return { data: mockTimesheets }
    }
    
    // Mock Daily Notes endpoints
    if (method === 'get' && path.match(/^\/daily-notes(\?.*)?$/)) {
      let filtered = mockDailyNotes
      const urlObj = new URL(path, 'http://localhost')
      const status = urlObj.searchParams.get('status')
      const employeeName = urlObj.searchParams.get('employeeName')
      if (status) filtered = filtered.filter(n => n.status === status)
      if (employeeName) {
        const search = employeeName.toLowerCase()
        filtered = filtered.filter(n => 
          n.employee?.user?.firstName?.toLowerCase().includes(search) ||
          n.employee?.user?.lastName?.toLowerCase().includes(search)
        )
      }
      return { data: filtered }
    }
    if (method === 'post' && path.includes('/daily-notes/') && path.includes('/review')) {
      const id = path.split('/daily-notes/')[1]
      const note = mockDailyNotes.find(n => n.id === id)
      if (note) {
        note.reviewedAt = new Date()
      }
      return { data: note }
    }
    if (method === 'post' && path.includes('/daily-notes/') && path.includes('/lock')) {
      const id = path.split('/daily-notes/')[1]
      const note = mockDailyNotes.find(n => n.id === id)
      if (note) {
        note.status = 'locked'
        note.lockedAt = new Date()
      }
      return { data: note }
    }
    if (method === 'post' && path.includes('/daily-notes/export')) {
      return { data: { startDate: '2024-01-01', endDate: '2024-01-31', exportDate: new Date(), notesCount: mockDailyNotes.length, data: mockDailyNotes } }
    }
    
    // Mock MAR endpoints
    if (method === 'get' && path.match(/^\/mar(\?.*)?$/)) {
      let filtered = mockMARRecords
      const urlObj = new URL(path, 'http://localhost')
      const outcome = urlObj.searchParams.get('outcome')
      const employeeName = urlObj.searchParams.get('employeeName')
      if (outcome) filtered = filtered.filter(r => r.outcome === outcome)
      if (employeeName) {
        const search = employeeName.toLowerCase()
        filtered = filtered.filter(r => 
          r.employee?.user?.firstName?.toLowerCase().includes(search) ||
          r.employee?.user?.lastName?.toLowerCase().includes(search)
        )
      }
      return { data: filtered }
    }
    if (method === 'post' && path.includes('/mar/') && path.includes('/lock')) {
      const id = path.split('/mar/')[1]
      const record = mockMARRecords.find(r => r.id === id)
      if (record) {
        record.outcome = 'locked'
        record.lockedAt = new Date()
      }
      return { data: record }
    }
    if (method === 'post' && path.includes('/mar/export')) {
      return { data: { startDate: '2024-01-01', endDate: '2024-01-31', exportDate: new Date(), entriesCount: mockMARRecords.length, data: mockMARRecords } }
    }

    // Mock Social Feed endpoints
    if (method === 'get' && path.match(/^\/social-feed\/posts(\?.*)?$/)) {
      return { data: [...mockSocialFeedPosts] }
    }
    if (method === 'post' && path.match(/^\/social-feed\/posts$/)) {
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data
      const currentUser = mockChatUsers[0]
      const newPost = {
        id: `post-${Date.now()}`,
        tenantId: 'demo-tenant-1',
        authorId: currentUser.id,
        content: parsedData.content,
        imageUrl: parsedData.imageUrl || null,
        isPinned: false,
        createdAt: new Date().toISOString(),
        author: { id: currentUser.id, firstName: currentUser.firstName, lastName: currentUser.lastName, role: currentUser.role },
        reactions: [],
        comments: [],
      }
      mockSocialFeedPosts.unshift(newPost)
      return { data: newPost }
    }
    if (method === 'post' && path.match(/\/social-feed\/posts\/[^/]+\/reactions$/)) {
      const postId = path.split('/posts/')[1].split('/')[0]
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data
      const post = mockSocialFeedPosts.find(p => p.id === postId)
      if (post) {
        const reaction = { postId, userId: 'demo-hr-1', type: parsedData.type }
        post.reactions.push(reaction)
        return { data: reaction }
      }
    }
    if (method === 'delete' && path.match(/\/social-feed\/posts\/[^/]+\/reactions$/)) {
      return { data: { success: true } }
    }
    if (method === 'post' && path.match(/\/social-feed\/posts\/[^/]+\/comments$/)) {
      const postId = path.split('/posts/')[1].split('/')[0]
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data
      const post = mockSocialFeedPosts.find(p => p.id === postId)
      if (post) {
        const comment = {
          id: `comment-${Date.now()}`,
          postId,
          userId: 'demo-hr-1',
          content: parsedData.content,
          createdAt: new Date().toISOString(),
          user: { id: 'demo-hr-1', firstName: 'Sarah', lastName: 'Johnson' },
        }
        post.comments.push(comment)
        return { data: comment }
      }
    }

    // Mock Chat endpoints
    if (method === 'get' && path.match(/^\/chat\/conversations(\?.*)?$/)) {
      return { data: [...mockChatConversations] }
    }
    if (method === 'get' && path.match(/^\/chat\/conversations\/[^/]+$/)) {
      const convId = path.split('/conversations/')[1]
      if (!convId.includes('/messages')) {
        const conv = mockChatConversations.find(c => c.id === convId)
        return { data: conv || null }
      }
    }
    if (method === 'post' && path.match(/^\/chat\/conversations$/)) {
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data
      const participantIds = parsedData.participantIds || (parsedData.userId ? [parsedData.userId] : [])
      const currentUserId = 'demo-hr-1'
      const allParticipantIds = [...participantIds, currentUserId].filter((v, i, a) => a.indexOf(v) === i)
      const participants = allParticipantIds.map(id => {
        const user = mockChatUsers.find(u => u.id === id)
        if (!user) return null
        return { userId: id, firstName: user.firstName, lastName: user.lastName, role: user.role }
      }).filter(p => p)
      const existingConv = mockChatConversations.find(c => 
        c.participants.every(p => allParticipantIds.includes(p.userId)) &&
        allParticipantIds.every(id => c.participants.some(p => p.userId === id))
      )
      if (existingConv) {
        return { data: existingConv }
      }
      const newConv = {
        id: `conv-${Date.now()}`,
        tenantId: 'demo-tenant-1',
        participants,
        lastMessage: null,
        updatedAt: new Date().toISOString(),
      }
      mockChatConversations.push(newConv)
      mockChatMessages[newConv.id] = []
      return { data: newConv }
    }
    if (method === 'get' && path.match(/^\/chat\/conversations\/[^/]+\/messages(\?.*)?$/)) {
      const convId = path.split('/conversations/')[1].split('/')[0]
      return { data: mockChatMessages[convId] || [] }
    }
    if (method === 'post' && path.match(/^\/chat\/conversations\/[^/]+\/messages$/)) {
      const convId = path.split('/conversations/')[1].split('/')[0]
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data
      const currentUser = mockChatUsers.find(u => u.id === 'demo-hr-1')
      const newMessage = {
        id: `msg-${Date.now()}`,
        conversationId: convId,
        senderId: 'demo-hr-1',
        content: parsedData.content,
        createdAt: new Date().toISOString(),
        sender: { id: 'demo-hr-1', firstName: currentUser.firstName, lastName: currentUser.lastName },
      }
      if (!mockChatMessages[convId]) {
        mockChatMessages[convId] = []
      }
      mockChatMessages[convId].push(newMessage)
      const conv = mockChatConversations.find(c => c.id === convId)
      if (conv) {
        conv.lastMessage = newMessage
        conv.updatedAt = newMessage.createdAt
      }
      return { data: newMessage }
    }
    if (method === 'get' && path.match(/^\/chat\/users(\?.*)?$/)) {
      return { data: mockChatUsers }
    }
  } catch (e) {
    console.error('Mock data error:', e)
  }
  return null
}

// Demo CRUD operations - handle demo/* endpoints
const handleDemoCRUD = (path, method, data) => {
  const parsedData = typeof data === 'string' ? JSON.parse(data) : data
  
  // Employees
  if (path.match(/^\/demo\/employees$/) && method === 'get') {
    return { data: { data: demoDataStore.employees, total: demoDataStore.employees.length } }
  }
  if (path.match(/^\/demo\/employees$/) && method === 'post') {
    const newEmp = {
      id: `demo-emp-${Date.now()}`,
      ...parsedData,
      created_at: new Date().toISOString(),
      is_demo_created: true
    }
    demoDataStore.employees.push(newEmp)
    return { data: { success: true, data: newEmp } }
  }
  if (path.match(/^\/demo\/employees\/[^/]+$/) && method === 'get') {
    const id = path.split('/employees/')[1]
    const emp = demoDataStore.employees.find(e => e.id === id)
    return emp ? { data: { data: emp } } : null
  }
  if (path.match(/^\/demo\/employees\/[^/]+$/) && method === 'put') {
    const id = path.split('/employees/')[1]
    const idx = demoDataStore.employees.findIndex(e => e.id === id)
    if (idx >= 0) {
      demoDataStore.employees[idx] = { ...demoDataStore.employees[idx], ...parsedData, updated_at: new Date().toISOString() }
      return { data: { success: true, data: demoDataStore.employees[idx] } }
    }
    return null
  }
  if (path.match(/^\/demo\/employees\/[^/]+$/) && method === 'delete') {
    const id = path.split('/employees/')[1]
    const idx = demoDataStore.employees.findIndex(e => e.id === id)
    if (idx >= 0) {
      demoDataStore.employees.splice(idx, 1)
      return { data: { success: true, message: 'Employee deleted' } }
    }
    return null
  }
  
  // Time Entries
  if (path.match(/^\/demo\/time-entries$/) && method === 'get') {
    return { data: { data: demoDataStore.timeEntries } }
  }
  if (path.match(/^\/demo\/timeclock\/clock-in$/) && method === 'post') {
    const newEntry = {
      id: `demo-time-${Date.now()}`,
      clock_in: new Date().toISOString(),
      status: 'active',
      employee_id: 'current-user',
      created_at: new Date().toISOString(),
      is_demo_created: true
    }
    demoDataStore.timeEntries.push(newEntry)
    return { data: { success: true, data: newEntry } }
  }
  if (path.match(/^\/demo\/timeclock\/clock-out\/[^/]+$/) && method === 'post') {
    const id = path.split('/clock-out/')[1]
    const idx = demoDataStore.timeEntries.findIndex(e => e.id === id)
    if (idx >= 0) {
      demoDataStore.timeEntries[idx].clock_out = new Date().toISOString()
      demoDataStore.timeEntries[idx].status = 'completed'
      demoDataStore.timeEntries[idx].updated_at = new Date().toISOString()
      return { data: { success: true, data: demoDataStore.timeEntries[idx] } }
    }
    return null
  }
  if (path.match(/^\/demo\/time-entries$/) && method === 'post') {
    const newEntry = {
      id: `demo-time-${Date.now()}`,
      ...parsedData,
      created_at: new Date().toISOString(),
      is_demo_created: true
    }
    demoDataStore.timeEntries.push(newEntry)
    return { data: { success: true, data: newEntry } }
  }
  
  // Notes
  if (path.match(/^\/demo\/notes$/) && method === 'get') {
    return { data: { data: demoDataStore.notes } }
  }
  if (path.match(/^\/demo\/notes$/) && method === 'post') {
    const newNote = {
      id: `demo-note-${Date.now()}`,
      ...parsedData,
      employee_id: 'current-user',
      created_at: new Date().toISOString(),
      is_demo_created: true
    }
    demoDataStore.notes.push(newNote)
    return { data: { success: true, data: newNote } }
  }
  if (path.match(/^\/demo\/notes\/[^/]+$/) && method === 'put') {
    const id = path.split('/notes/')[1]
    const idx = demoDataStore.notes.findIndex(n => n.id === id)
    if (idx >= 0) {
      demoDataStore.notes[idx] = { ...demoDataStore.notes[idx], ...parsedData, updated_at: new Date().toISOString() }
      return { data: { success: true, data: demoDataStore.notes[idx] } }
    }
    return null
  }
  if (path.match(/^\/demo\/notes\/[^/]+$/) && method === 'delete') {
    const id = path.split('/notes/')[1]
    const idx = demoDataStore.notes.findIndex(n => n.id === id)
    if (idx >= 0) {
      demoDataStore.notes.splice(idx, 1)
      return { data: { success: true, message: 'Note deleted' } }
    }
    return null
  }
  
  // Medications
  if (path.match(/^\/demo\/medications$/) && method === 'get') {
    return { data: { data: demoDataStore.medications } }
  }
  if (path.match(/^\/demo\/medications$/) && method === 'post') {
    const newMed = {
      id: `demo-med-${Date.now()}`,
      ...parsedData,
      created_at: new Date().toISOString(),
      is_demo_created: true
    }
    demoDataStore.medications.push(newMed)
    return { data: { success: true, data: newMed } }
  }
  if (path.match(/^\/demo\/medications\/[^/]+$/) && method === 'put') {
    const id = path.split('/medications/')[1]
    const idx = demoDataStore.medications.findIndex(m => m.id === id)
    if (idx >= 0) {
      demoDataStore.medications[idx] = { ...demoDataStore.medications[idx], ...parsedData, updated_at: new Date().toISOString() }
      return { data: { success: true, data: demoDataStore.medications[idx] } }
    }
    return null
  }
  if (path.match(/^\/demo\/medications\/[^/]+$/) && method === 'delete') {
    const id = path.split('/medications/')[1]
    const idx = demoDataStore.medications.findIndex(m => m.id === id)
    if (idx >= 0) {
      demoDataStore.medications.splice(idx, 1)
      return { data: { success: true, message: 'Medication deleted' } }
    }
    return null
  }
  
  // Posts
  if (path.match(/^\/demo\/posts$/) && method === 'get') {
    return { data: { data: demoDataStore.posts } }
  }
  if (path.match(/^\/demo\/posts$/) && method === 'post') {
    const newPost = {
      id: `demo-post-${Date.now()}`,
      ...parsedData,
      author_id: 'current-user',
      likes: 0,
      created_at: new Date().toISOString(),
      is_demo_created: true
    }
    demoDataStore.posts.unshift(newPost)
    return { data: { success: true, data: newPost } }
  }
  if (path.match(/^\/demo\/posts\/[^/]+\/like$/) && method === 'post') {
    const id = path.split('/posts/')[1].split('/')[0]
    const idx = demoDataStore.posts.findIndex(p => p.id === id)
    if (idx >= 0) {
      demoDataStore.posts[idx].likes = (demoDataStore.posts[idx].likes || 0) + 1
      return { data: { success: true, data: demoDataStore.posts[idx] } }
    }
    return null
  }
  if (path.match(/^\/demo\/posts\/[^/]+$/) && method === 'put') {
    const id = path.split('/posts/')[1]
    const idx = demoDataStore.posts.findIndex(p => p.id === id)
    if (idx >= 0) {
      demoDataStore.posts[idx] = { ...demoDataStore.posts[idx], ...parsedData, updated_at: new Date().toISOString() }
      return { data: { success: true, data: demoDataStore.posts[idx] } }
    }
    return null
  }
  if (path.match(/^\/demo\/posts\/[^/]+$/) && method === 'delete') {
    const id = path.split('/posts/')[1]
    const idx = demoDataStore.posts.findIndex(p => p.id === id)
    if (idx >= 0) {
      demoDataStore.posts.splice(idx, 1)
      return { data: { success: true, message: 'Post deleted' } }
    }
    return null
  }
  
  // Onboarding Tasks
  if (path.match(/^\/demo\/onboarding\/tasks$/) && method === 'get') {
    return { data: { data: demoDataStore.onboardingTasks } }
  }
  if (path.match(/^\/demo\/onboarding\/tasks$/) && method === 'post') {
    const newTask = {
      id: `demo-task-${Date.now()}`,
      ...parsedData,
      status: 'pending',
      created_at: new Date().toISOString(),
      is_demo_created: true
    }
    demoDataStore.onboardingTasks.push(newTask)
    return { data: { success: true, data: newTask } }
  }
  if (path.match(/^\/demo\/onboarding\/tasks\/[^/]+\/complete$/) && method === 'post') {
    const id = path.split('/tasks/')[1].split('/')[0]
    const idx = demoDataStore.onboardingTasks.findIndex(t => t.id === id)
    if (idx >= 0) {
      demoDataStore.onboardingTasks[idx].status = 'completed'
      demoDataStore.onboardingTasks[idx].completed_at = new Date().toISOString()
      demoDataStore.onboardingTasks[idx].completed_by = 'current-user'
      demoDataStore.onboardingTasks[idx] = { ...demoDataStore.onboardingTasks[idx], ...parsedData }
      return { data: { success: true, data: demoDataStore.onboardingTasks[idx] } }
    }
    return null
  }
  
  // Session Info
  if (path === '/demo/session-info') {
    return { data: { 
      is_demo: true, 
      role: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user'))?.role : 'staff',
      permissions: ['*'],
      data_stats: {
        employees: demoDataStore.employees.length,
        time_entries: demoDataStore.timeEntries.length,
        notes: demoDataStore.notes.length,
        medications: demoDataStore.medications.length,
        posts: demoDataStore.posts.length,
      }
    }}
  }
  
  // Reset Demo Data
  if (path === '/demo/reset' && method === 'post') {
    demoDataStore.reset()
    return { data: { success: true, message: 'Demo data reset' } }
  }
  
  // Stats
  if (path === '/demo/stats') {
    return { data: { data: {
      employees: demoDataStore.employees.length,
      time_entries: demoDataStore.timeEntries.length,
      notes: demoDataStore.notes.length,
      medications: demoDataStore.medications.length,
      posts: demoDataStore.posts.length,
      onboarding_tasks: demoDataStore.onboardingTasks.length,
    }}}
  }
  
  return null
}

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Browser environment
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3000/api'
    }
    // Vercel production - use relative path if backend is on same domain
    return '/api'
  }
  // Server-side or unknown
  return process.env.VITE_API_URL || 'http://localhost:3000/api'
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
})

const originalRequest = axios.prototype.request
axios.prototype.request = function(config) {
  if (isDemoMode()) {
    const url = config.url || ''
    const method = config.method?.toLowerCase() || 'get'
    const data = config.data || '{}'
    
    // First try demo CRUD endpoints
    const crudResult = handleDemoCRUD('/' + url.replace(/^\/api\/?/, ''), method, data)
    if (crudResult) {
      return Promise.resolve(crudResult)
    }
    
    // Then try general mock data
    const mockData = getMockData(url, method, data)
    if (mockData) {
      return Promise.resolve(mockData)
    }
  }
  return originalRequest.apply(this, arguments)
}

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
