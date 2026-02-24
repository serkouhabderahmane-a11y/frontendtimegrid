<template>
  <div class="login-page">
    <div class="login-bg"></div>
    
    <div class="login-container">
      <!-- Left Panel - Branding -->
      <div class="login-brand">
        <div class="brand-content">
          <div class="logo">
            <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>TimeGrid</span>
          </div>
          <h1>Workforce Operations<br/>Simplified</h1>
          <p>Enterprise-grade employee onboarding and time tracking platform built for modern organizations.</p>
          
          <div class="features-list">
            <div class="feature-item">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              <span>Multi-tenant architecture</span>
            </div>
            <div class="feature-item">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              <span>Compliant onboarding workflows</span>
            </div>
            <div class="feature-item">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              <span>Real-time time tracking</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Right Panel - Login Form -->
      <div class="login-form-container">
        <div class="login-form-wrapper">
          <h2>Welcome back</h2>
          <p class="form-subtitle">Sign in to your account</p>
          
          <form @submit.prevent="handleLogin" class="login-form">
            <div class="form-group">
              <label for="email">Email</label>
              <div class="input-wrapper">
                <svg class="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
                </svg>
                <input
                  id="email"
                  v-model="email"
                  type="email"
                  required
                  placeholder="you@company.com"
                />
              </div>
            </div>
            
            <div class="form-group">
              <label for="password">Password</label>
              <div class="input-wrapper">
                <svg class="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                <input
                  id="password"
                  v-model="password"
                  type="password"
                  required
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            <div v-if="error" class="error-message">{{ error }}</div>
            
            <button type="submit" :disabled="loading" class="btn-submit">
              {{ loading ? 'Signing in...' : 'Sign In' }}
            </button>
          </form>
          
          <div class="divider">
            <span>or continue with demo</span>
          </div>
          
          <div class="demo-buttons">
            <button @click="loginAsHR" class="demo-btn hr">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <span>Demo HR Admin</span>
            </button>
            <button @click="loginAsEmployee" class="demo-btn employee">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <span>Demo Employee</span>
            </button>
          </div>
          
          <p class="register-link">
            Don't have an account? <router-link to="/register">Create one</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    await authStore.login(email.value, password.value)
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed'
  } finally {
    loading.value = false
  }
}

const loginAsHR = () => {
  authStore.$patch({
    user: {
      id: 'demo-hr-1',
      email: 'hr@demo.com',
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'hr',
      tenantId: 'demo-tenant-1'
    },
    accessToken: 'demo-token-hr',
    refreshToken: 'demo-refresh-hr',
    isAuthenticated: true
  })
  localStorage.setItem('accessToken', 'demo-token-hr')
  localStorage.setItem('refreshToken', 'demo-refresh-hr')
  router.push('/admin')
}

const loginAsEmployee = () => {
  authStore.$patch({
    user: {
      id: 'demo-employee-1',
      email: 'john@demo.com',
      firstName: 'John',
      lastName: 'Smith',
      role: 'employee',
      tenantId: 'demo-tenant-1'
    },
    accessToken: 'demo-token-employee',
    refreshToken: 'demo-refresh-employee',
    isAuthenticated: true
  })
  localStorage.setItem('accessToken', 'demo-token-employee')
  localStorage.setItem('refreshToken', 'demo-refresh-employee')
  router.push('/employee/timeclock')
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
}

.login-bg {
  position: fixed;
  inset: 0;
  background: 
    radial-gradient(ellipse at top left, rgba(66, 184, 131, 0.1) 0%, transparent 50%),
    radial-gradient(ellipse at bottom right, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
    #0f172a;
  z-index: -1;
}

.login-container {
  display: flex;
  width: 100%;
  min-height: 100vh;
}

/* Left Panel */
.login-brand {
  flex: 1;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  display: none;
}

@media (min-width: 1024px) {
  .login-brand {
    display: flex;
  }
}

.brand-content {
  max-width: 400px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #42b883;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 2rem;
}

.login-brand h1 {
  font-size: 2.5rem;
  font-weight: 800;
  color: #f8fafc;
  line-height: 1.2;
  margin-bottom: 1rem;
}

.login-brand > div > p {
  color: #94a3b8;
  font-size: 1rem;
  line-height: 1.7;
  margin-bottom: 2rem;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #e2e8f0;
  font-size: 0.875rem;
}

.feature-item svg {
  width: 1.25rem;
  height: 1.25rem;
  color: #42b883;
}

/* Right Panel */
.login-form-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.login-form-wrapper {
  width: 100%;
  max-width: 400px;
}

.login-form-wrapper h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 0.5rem;
}

.form-subtitle {
  color: #94a3b8;
  margin-bottom: 2rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #e2e8f0;
  margin-bottom: 0.5rem;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: #64748b;
}

.input-wrapper input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.75rem;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 0.5rem;
  color: #f8fafc;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #42b883;
  box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.1);
}

.input-wrapper input::placeholder {
  color: #64748b;
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  text-align: center;
}

.btn-submit {
  width: 100%;
  padding: 0.875rem;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-submit:hover:not(:disabled) {
  background: #359268;
  transform: translateY(-1px);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.divider {
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #334155;
}

.divider span {
  padding: 0 1rem;
  color: #64748b;
  font-size: 0.875rem;
}

.demo-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.demo-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #334155;
}

.demo-btn.hr {
  background: #1e293b;
  color: #e2e8f0;
}

.demo-btn.hr:hover {
  background: #334155;
}

.demo-btn.employee {
  background: #1e293b;
  color: #e2e8f0;
}

.demo-btn.employee:hover {
  background: #334155;
}

.register-link {
  text-align: center;
  margin-top: 1.5rem;
  color: #94a3b8;
  font-size: 0.875rem;
}

.register-link a {
  color: #42b883;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>
