<template>
  <div class="reports-page">
    <header class="page-header">
      <h1>Reports</h1>
      <p>Generate and view system reports</p>
    </header>

    <div class="reports-grid">
      <div class="card report-card" @click="generateReport('attendance')">
        <div class="report-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </div>
        <h3>Attendance Report</h3>
        <p>View employee attendance records and statistics</p>
      </div>

      <div class="card report-card" @click="generateReport('employees')">
        <div class="report-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </div>
        <h3>Employee Report</h3>
        <p>Overview of employee counts by department</p>
      </div>

      <div class="card report-card" @click="generateReport('timeoff')">
        <div class="report-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
        </div>
        <h3>Time-Off Report</h3>
        <p>Summary of time-off requests and balances</p>
      </div>

      <div class="card report-card" @click="generateReport('payroll')">
        <div class="report-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h3>Payroll Report</h3>
        <p>Payroll summary and payment details</p>
      </div>
    </div>

    <div v-if="generating" class="loading-overlay">
      <div class="spinner"></div>
      <p>Generating report...</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import api from '../api/axios'

const authStore = useAuthStore()
const generating = ref(false)

const generateReport = async (type) => {
  generating.value = true
  try {
    const response = await api.get(`/api/reports/${type}`, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${type}-report.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (e) {
    console.error('Failed to generate report:', e)
    alert('Failed to generate report. Please try again.')
  } finally {
    generating.value = false
  }
}
</script>

<style scoped>
.reports-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  position: relative;
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

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 1rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.card:hover {
  border-color: #42b883;
  transform: translateY(-2px);
}

.report-card {
  display: flex;
  flex-direction: column;
  text-align: center;
}

.report-icon {
  width: 60px;
  height: 60px;
  border-radius: 1rem;
  background: rgba(66, 184, 131, 0.1);
  color: #42b883;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.report-icon svg {
  width: 30px;
  height: 30px;
}

.report-card h3 {
  color: #f8fafc;
  margin-bottom: 0.5rem;
}

.report-card p {
  color: #64748b;
  font-size: 0.875rem;
  flex: 1;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #334155;
  border-top-color: #42b883;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-overlay p {
  color: #94a3b8;
}
</style>
