<template>
  <div class="settings-page">
    <header class="page-header">
      <h1>System Settings</h1>
      <p>Configure system-wide settings and preferences</p>
    </header>

    <div class="settings-sections">
      <div class="card">
        <h3>General Settings</h3>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">Organization Name</span>
            <span class="setting-desc">Your organization's display name</span>
          </div>
          <input type="text" v-model="settings.organizationName" />
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">Timezone</span>
            <span class="setting-desc">Default timezone for the system</span>
          </div>
          <select v-model="settings.timezone">
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
          </select>
        </div>
      </div>

      <div class="card">
        <h3>Attendance Settings</h3>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">Default Work Hours</span>
            <span class="setting-desc">Standard daily work hours</span>
          </div>
          <input type="text" v-model="settings.workHours" />
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">Late Threshold</span>
            <span class="setting-desc">Minutes after start time considered late</span>
          </div>
          <input type="number" v-model="settings.lateThreshold" min="0" />
        </div>
      </div>

      <div class="card">
        <h3>Time-Off Settings</h3>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">Default Annual Leave</span>
            <span class="setting-desc">Starting balance for new employees</span>
          </div>
          <input type="number" v-model="settings.defaultAnnualLeave" min="0" />
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">Require Approval</span>
            <span class="setting-desc">All time-off requests need manager approval</span>
          </div>
          <label class="toggle">
            <input type="checkbox" v-model="settings.requireApproval" />
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <div class="card">
        <h3>Notification Settings</h3>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">Admin Notifications</span>
            <span class="setting-desc">Email alerts for admin actions</span>
          </div>
          <label class="toggle">
            <input type="checkbox" v-model="settings.adminNotifications" />
            <span class="slider"></span>
          </label>
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">Employee Notifications</span>
            <span class="setting-desc">Email alerts for employee actions</span>
          </div>
          <label class="toggle">
            <input type="checkbox" v-model="settings.employeeNotifications" />
            <span class="slider"></span>
          </label>
        </div>
      </div>
    </div>

    <div class="actions-bar">
      <button @click="saveSettings" class="btn btn-primary" :disabled="saving">
        {{ saving ? 'Saving...' : 'Save Changes' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../api/axios'

const saving = ref(false)
const settings = ref({
  organizationName: 'TimeGrid',
  timezone: 'UTC',
  workHours: '8:00 AM - 5:00 PM',
  lateThreshold: 15,
  defaultAnnualLeave: 15,
  requireApproval: true,
  adminNotifications: true,
  employeeNotifications: true
})

const fetchSettings = async () => {
  try {
    const response = await api.get('/api/settings')
    settings.value = { ...settings.value, ...response.data }
  } catch (e) {
    console.error('Failed to fetch settings:', e)
  }
}

const saveSettings = async () => {
  saving.value = true
  try {
    await api.put('/api/settings', settings.value)
    alert('Settings saved successfully!')
  } catch (e) {
    console.error('Failed to save settings:', e)
    alert('Failed to save settings. Please try again.')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchSettings()
})
</script>

<style scoped>
.settings-page {
  max-width: 900px;
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

.settings-sections {
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
  margin-bottom: 1.5rem;
  font-size: 1.125rem;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #334155;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.setting-label {
  color: #e2e8f0;
  font-weight: 500;
}

.setting-desc {
  color: #64748b;
  font-size: 0.875rem;
}

.setting-item input,
.setting-item select {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  color: #e2e8f0;
  min-width: 180px;
}

.setting-item input:focus,
.setting-item select:focus {
  outline: none;
  border-color: #42b883;
}

.toggle {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #334155;
  transition: 0.3s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #42b883;
}

input:checked + .slider:before {
  transform: translateX(24px);
}

.actions-bar {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.5rem;
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

.btn-primary:hover:not(:disabled) {
  background: #359268;
}

.btn-primary:disabled {
  background: #64748b;
  cursor: not-allowed;
}
</style>
