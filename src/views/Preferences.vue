<template>
  <div class="preferences-page">
    <header class="page-header">
      <h1>Preferences</h1>
      <p>Customize your experience</p>
    </header>

    <div class="preferences-list">
      <div class="card">
        <h3>Appearance</h3>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">Theme</span>
            <span class="setting-desc">Choose your preferred color scheme</span>
          </div>
          <select class="setting-select">
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">Compact Mode</span>
            <span class="setting-desc">Use a more compact layout</span>
          </div>
          <label class="toggle">
            <input type="checkbox" />
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <div class="card">
        <h3>Notifications</h3>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">Email Notifications</span>
            <span class="setting-desc">Receive updates via email</span>
          </div>
          <label class="toggle">
            <input type="checkbox" checked />
            <span class="slider"></span>
          </label>
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">Push Notifications</span>
            <span class="setting-desc">Receive browser notifications</span>
          </div>
          <label class="toggle">
            <input type="checkbox" />
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <div class="card">
        <h3>Language & Region</h3>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">Language</span>
            <span class="setting-desc">Select your preferred language</span>
          </div>
          <select class="setting-select">
            <option value="en">English</option>
          </select>
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">Timezone</span>
            <span class="setting-desc">Set your local timezone</span>
          </div>
          <select class="setting-select">
            <option value="utc">UTC</option>
          </select>
        </div>
      </div>

      <div class="actions-bar">
        <button class="btn btn-primary">Save Preferences</button>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.preferences-page {
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

.preferences-list {
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

.setting-select {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  color: #e2e8f0;
  min-width: 150px;
}

.setting-select:focus {
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
  display: flex;
  justify-content: flex-end;
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
</style>
