<template>
  <div class="security-page">
    <header class="page-header">
      <h1>Security</h1>
      <p>Manage your account security settings</p>
    </header>

    <div class="security-sections">
      <div class="card">
        <h3>Change Password</h3>
        <div class="form-group">
          <label>Current Password</label>
          <input type="password" placeholder="Enter current password" />
        </div>
        <div class="form-group">
          <label>New Password</label>
          <input type="password" placeholder="Enter new password" />
        </div>
        <div class="form-group">
          <label>Confirm New Password</label>
          <input type="password" placeholder="Confirm new password" />
        </div>
        <button class="btn btn-primary">Update Password</button>
      </div>

      <div class="card">
        <h3>Two-Factor Authentication</h3>
        <p class="card-desc">Add an extra layer of security to your account</p>
        <div class="tfa-status">
          <span class="status-badge" :class="twoFactorEnabled ? 'active' : 'inactive'">
            {{ twoFactorEnabled ? 'Enabled' : 'Not Enabled' }}
          </span>
        </div>
        <button class="btn btn-outline" @click="toggleTwoFactor">
          {{ twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA' }}
        </button>
      </div>

      <div class="card">
        <h3>Active Sessions</h3>
        <p class="card-desc">Manage devices that are logged into your account</p>
        <div class="session-item">
          <div class="session-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </div>
          <div class="session-info">
            <span class="session-device">Current Device</span>
            <span class="session-location">This browser - Active now</span>
          </div>
          <span class="current-badge">Current</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const twoFactorEnabled = ref(false)

const toggleTwoFactor = () => {
  twoFactorEnabled.value = !twoFactorEnabled.value
}
</script>

<style scoped>
.security-page {
  max-width: 800px;
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

.security-sections {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 1rem;
  padding: 1.5rem;
}

.card h3 {
  color: #f8fafc;
  margin-bottom: 0.5rem;
}

.card-desc {
  color: #64748b;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  color: #94a3b8;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.form-group input {
  width: 100%;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 0.5rem;
  padding: 0.75rem;
  color: #e2e8f0;
}

.form-group input:focus {
  outline: none;
  border-color: #006e5b;
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
  margin-top: 0.5rem;
}

.btn-primary {
  background: #006e5b;
  color: white;
}

.btn-primary:hover {
  background: #005a4a;
}

.btn-outline {
  background: transparent;
  border: 1px solid #64748b;
  color: #94a3b8;
}

.btn-outline:hover {
  background: #334155;
}

.tfa-status {
  margin: 1rem 0;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge.inactive {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.status-badge.active {
  background: rgba(0, 110, 91, 0.1);
  color: #006e5b;
}

.session-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #0f172a;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.session-icon {
  width: 40px;
  height: 40px;
  border-radius: 0.5rem;
  background: rgba(0, 110, 91, 0.1);
  color: #006e5b;
  display: flex;
  align-items: center;
  justify-content: center;
}

.session-icon svg {
  width: 20px;
  height: 20px;
}

.session-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.session-device {
  color: #e2e8f0;
  font-weight: 500;
}

.session-location {
  color: #64748b;
  font-size: 0.875rem;
}

.current-badge {
  background: rgba(0, 110, 91, 0.1);
  color: #006e5b;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}
</style>
