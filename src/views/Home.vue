<template>
  <div class="home">
    <!-- Hero Section (when not authenticated) -->
    <div v-if="!isAuthenticated" class="hero">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <div class="hero-badge">Enterprise Workforce Platform</div>
        <h1>Streamline Your <span class="gradient-text">Workforce Operations</span></h1>
        <p class="hero-subtitle">
          Multi-tenant SaaS platform for employee onboarding, time tracking, and HR management. 
          Built for modern organizations.
        </p>
        <div class="hero-actions">
          <router-link to="/login" class="btn btn-primary">
            Get Started
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </router-link>
          <router-link to="/login" class="btn btn-secondary">View Demo</router-link>
        </div>
        
        <!-- Features Grid -->
        <div class="features">
          <div class="feature-card" style="animation-delay: 0.1s">
            <div class="feature-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <h3>Secure Onboarding</h3>
            <p>Compliant employee onboarding with state machine enforcement</p>
          </div>
          <div class="feature-card" style="animation-delay: 0.2s">
            <div class="feature-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3>Time Tracking</h3>
            <p>Real-time clock-in/out with onboarding status enforcement</p>
          </div>
          <div class="feature-card" style="animation-delay: 0.3s">
            <div class="feature-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <h3>HR Dashboard</h3>
            <p>Comprehensive analytics and approval workflows</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Dashboard (when authenticated) -->
    <div v-else class="dashboard">
      <div class="dashboard-header">
        <div>
          <h1>Welcome back, {{ authStore.user?.firstName }}!</h1>
          <p>Here's what's happening with your workforce</p>
        </div>
        <div class="header-actions">
          <template v-if="isHR">
            <router-link to="/admin/candidates" class="btn btn-primary">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Add Candidate
            </router-link>
          </template>
        </div>
      </div>
      
      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon blue">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">24</span>
            <span class="stat-label">Total Candidates</span>
          </div>
          <div class="stat-trend up">+12%</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon green">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">156</span>
            <span class="stat-label">Active Employees</span>
          </div>
          <div class="stat-trend up">+8%</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon orange">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">8</span>
            <span class="stat-label">Pending Approvals</span>
          </div>
          <div class="stat-trend down">-3</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon purple">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">12</span>
            <span class="stat-label">In Progress</span>
          </div>
        </div>
      </div>
      
      <!-- Quick Actions -->
      <div class="section">
        <h2 class="section-title">Quick Actions</h2>
        <div class="actions-grid">
          <template v-if="isHR">
            <router-link to="/admin" class="action-card">
              <div class="action-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                </svg>
              </div>
              <h3>HR Dashboard</h3>
              <p>View all HR metrics and analytics</p>
            </router-link>
            
            <router-link to="/admin/candidates" class="action-card">
              <div class="action-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                </svg>
              </div>
              <h3>Manage Candidates</h3>
              <p>View and manage candidate applications</p>
            </router-link>
            
            <router-link to="/admin/approvals" class="action-card">
              <div class="action-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3>Approval Queue</h3>
              <p>Review pending task approvals</p>
            </router-link>
          </template>
          
          <template v-if="isEmployee">
            <router-link to="/employee/timeclock" class="action-card">
              <div class="action-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3>Time Clock</h3>
              <p>Clock in/out for your shift</p>
            </router-link>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const isHR = computed(() => authStore.isHR || authStore.isAdmin)
const isEmployee = computed(() => authStore.isEmployee)
</script>

<style scoped>
.home {
  min-height: calc(100vh - 65px);
}

/* Hero Section */
.hero {
  position: relative;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(ellipse at top, rgba(66, 184, 131, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at bottom right, rgba(59, 130, 246, 0.1) 0%, transparent 50%);
}

.hero-content {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 1.5rem;
  text-align: center;
}

.hero-badge {
  display: inline-block;
  background: rgba(66, 184, 131, 0.1);
  color: #42b883;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
}

.hero h1 {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  color: #f8fafc;
}

.gradient-text {
  background: linear-gradient(135deg, #42b883, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: #94a3b8;
  max-width: 600px;
  margin: 0 auto 2rem;
  line-height: 1.7;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 4rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
}

.btn-primary {
  background: #42b883;
  color: white;
}

.btn-primary:hover {
  background: #359268;
  transform: translateY(-2px);
}

.btn-secondary {
  background: #1e293b;
  color: #e2e8f0;
  border: 1px solid #334155;
}

.btn-secondary:hover {
  background: #334155;
}

/* Features */
.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.feature-card {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid #334155;
  border-radius: 1rem;
  padding: 1.5rem;
  text-align: left;
  animation: fadeInUp 0.6s ease forwards;
  opacity: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feature-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background: rgba(66, 184, 131, 0.1);
  color: #42b883;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.feature-icon svg {
  width: 1.5rem;
  height: 1.5rem;
}

.feature-card h3 {
  color: #f8fafc;
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
}

.feature-card p {
  color: #94a3b8;
  font-size: 0.875rem;
  line-height: 1.6;
}

/* Dashboard */
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  font-size: 1.75rem;
  color: #f8fafc;
  margin-bottom: 0.25rem;
}

.dashboard-header p {
  color: #94a3b8;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 1rem;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  animation: fadeInUp 0.5s ease forwards;
  opacity: 0;
}

.stat-card:nth-child(1) { animation-delay: 0.1s; }
.stat-card:nth-child(2) { animation-delay: 0.2s; }
.stat-card:nth-child(3) { animation-delay: 0.3s; }
.stat-card:nth-child(4) { animation-delay: 0.4s; }

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon svg {
  width: 1.5rem;
  height: 1.5rem;
}

.stat-icon.blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.stat-icon.green { background: rgba(66, 184, 131, 0.1); color: #42b883; }
.stat-icon.orange { background: rgba(249, 115, 22, 0.1); color: #f97316; }
.stat-icon.purple { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }

.stat-content {
  flex: 1;
}

.stat-value {
  display: block;
  font-size: 1.75rem;
  font-weight: 700;
  color: #f8fafc;
}

.stat-label {
  font-size: 0.875rem;
  color: #94a3b8;
}

.stat-trend {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.stat-trend.up {
  background: rgba(66, 184, 131, 0.1);
  color: #42b883;
}

.stat-trend.down {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

/* Section */
.section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.25rem;
  color: #f8fafc;
  margin-bottom: 1rem;
}

/* Actions Grid */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.action-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 1rem;
  padding: 1.5rem;
  text-decoration: none;
  transition: all 0.2s;
}

.action-card:hover {
  border-color: #42b883;
  transform: translateY(-2px);
}

.action-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background: rgba(66, 184, 131, 0.1);
  color: #42b883;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.action-icon svg {
  width: 1.5rem;
  height: 1.5rem;
}

.action-card h3 {
  color: #f8fafc;
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.action-card p {
  color: #94a3b8;
  font-size: 0.875rem;
}
</style>
