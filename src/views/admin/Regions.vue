<template>
  <div class="regions-page">
    <header class="page-header">
      <div>
        <h1>Regions</h1>
        <p>Manage organizational regions and locations</p>
      </div>
      <button v-if="canCreate" class="btn btn-primary" @click="showCreateModal = true">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
        </svg>
        Add Region
      </button>
    </header>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading regions...</p>
    </div>

    <div v-else class="regions-grid">
      <div v-for="region in regions" :key="region.id" class="card region-card">
        <div class="region-header">
          <div class="region-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <div>
            <h3>{{ region.name }}</h3>
            <span class="region-code">{{ region.code }}</span>
          </div>
        </div>
        <div class="region-stats">
          <div class="stat">
            <span class="stat-value">{{ region.locationCount || 0 }}</span>
            <span class="stat-label">Locations</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ region.employeeCount || 0 }}</span>
            <span class="stat-label">Employees</span>
          </div>
        </div>
        <div class="region-actions" v-if="canEdit">
          <button @click="editRegion(region)" class="btn btn-outline btn-sm">Edit</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import api from '../../api/axios'

const authStore = useAuthStore()

const loading = ref(true)
const regions = ref([])

const canCreate = computed(() => authStore.isAdmin || authStore.isHR)
const canEdit = computed(() => authStore.isAdmin || authStore.isHR)

const fetchRegions = async () => {
  loading.value = true
  try {
    const response = await api.get('/api/regions')
    regions.value = response.data
  } catch (e) {
    console.error('Failed to fetch regions:', e)
  } finally {
    loading.value = false
  }
}

const editRegion = (region) => {
  console.log('Edit region:', region)
}

onMounted(() => {
  fetchRegions()
})
</script>

<style scoped>
.regions-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
}

.loading-state {
  text-align: center;
  padding: 3rem;
  color: #94a3b8;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #334155;
  border-top-color: #006e5b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.regions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 1rem;
  padding: 1.5rem;
}

.region-card {
  display: flex;
  flex-direction: column;
}

.region-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.region-icon {
  width: 48px;
  height: 48px;
  border-radius: 0.75rem;
  background: rgba(0, 110, 91, 0.1);
  color: #006e5b;
  display: flex;
  align-items: center;
  justify-content: center;
}

.region-icon svg {
  width: 24px;
  height: 24px;
}

.region-header h3 {
  color: #f8fafc;
  margin-bottom: 0.125rem;
}

.region-code {
  color: #64748b;
  font-size: 0.875rem;
}

.region-stats {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
}

.stat {
  display: flex;
  flex-direction: column;
}

.stat-value {
  color: #006e5b;
  font-size: 1.5rem;
  font-weight: 700;
}

.stat-label {
  color: #94a3b8;
  font-size: 0.75rem;
}

.region-actions {
  margin-top: auto;
}
</style>
