<template>
  <div class="profile-page">
    <header class="page-header">
      <h1>My Profile</h1>
      <p>Manage your personal information</p>
    </header>

    <div class="profile-grid">
      <div class="card profile-card">
        <div class="avatar-section">
          <div class="avatar">
            <span>{{ userInitials }}</span>
          </div>
          <button class="btn btn-outline">Change Photo</button>
        </div>
        
        <div class="profile-info">
          <h2>{{ authStore.user?.firstName || 'User' }} {{ authStore.user?.lastName || '' }}</h2>
          <p class="role">{{ formatRole(authStore.role) }}</p>
          <p class="tenant">{{ authStore.user?.tenant?.name || 'Organization' }}</p>
        </div>
      </div>

      <div class="card details-card">
        <h3>Personal Information</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>First Name</label>
            <input type="text" :value="authStore.user?.firstName || ''" />
          </div>
          <div class="form-group">
            <label>Last Name</label>
            <input type="text" :value="authStore.user?.lastName || ''" />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" :value="authStore.user?.email || ''" />
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input type="tel" value="+1 (555) 000-0000" />
          </div>
        </div>
        <button class="btn btn-primary">Save Changes</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const userInitials = computed(() => {
  const first = authStore.user?.firstName?.[0] || ''
  const last = authStore.user?.lastName?.[0] || ''
  return `${first}${last}`.toUpperCase() || 'U'
})

const formatRole = (role) => {
  const roles = {
    'hr_admin': 'HR Administrator',
    'admin': 'Administrator',
    'supervisor': 'Supervisor',
    'staff': 'Staff Member',
    'nurse': 'Nurse',
    'auditor': 'Auditor',
  }
  return roles[role] || 'Employee'
}
</script>

<style scoped>
.profile-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
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

.profile-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 1.5rem;
}

.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 1rem;
  padding: 1.5rem;
}

.profile-card {
  text-align: center;
}

.avatar-section {
  margin-bottom: 1.5rem;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #42b883, #359268);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #42b883;
  color: white;
}

.btn-primary:hover {
  background: #359268;
}

.btn-outline {
  background: transparent;
  border: 1px solid #64748b;
  color: #94a3b8;
}

.profile-info h2 {
  color: #f8fafc;
  margin-bottom: 0.5rem;
}

.role {
  color: #42b883;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.tenant {
  color: #94a3b8;
  font-size: 0.875rem;
}

.details-card h3 {
  color: #f8fafc;
  margin-bottom: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: #94a3b8;
  font-size: 0.875rem;
}

.form-group input {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 0.5rem;
  padding: 0.75rem;
  color: #e2e8f0;
}

.form-group input:focus {
  outline: none;
  border-color: #42b883;
}

@media (max-width: 768px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
