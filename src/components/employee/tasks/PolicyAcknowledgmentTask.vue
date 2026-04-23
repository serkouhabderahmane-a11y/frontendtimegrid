<template>
  <div class="task-form">
    <h4>Policy Acknowledgment</h4>
    <div class="policy-content">
      <p>Please read and acknowledge our company policies...</p>
      <p>1. Code of Conduct</p>
      <p>2. Privacy Policy</p>
      <p>3. Workplace Safety</p>
      <p>4. Anti-Harassment Policy</p>
    </div>
    <div class="scroll-notice">
      <p>↑ Please scroll through all policies above ↑</p>
    </div>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>
          <input type="checkbox" v-model="formData.acknowledged" required />
          I have read and agree to the company policies
        </label>
      </div>
      <button type="submit" :disabled="!formData.acknowledged">Acknowledge</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  task: Object,
  submissionData: Object
})

const emit = defineEmits(['submit'])

const formData = ref({
  acknowledged: false,
  acknowledgedAt: new Date().toISOString(),
  ipAddress: ''
})

onMounted(() => {
  if (props.submissionData) {
    try {
      formData.value = { ...formData.value, ...JSON.parse(props.submissionData) }
    } catch (e) {
      console.error('Failed to parse submission data')
    }
  }
})

const handleSubmit = () => {
  formData.value.ipAddress = window?.location?.hostname || 'unknown'
  emit('submit', formData.value)
}
</script>

<style scoped>
.task-form {
  padding: 1rem 0;
}

.policy-content {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.scroll-notice {
  text-align: center;
  color: #666;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

button {
  background: #006e5b;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
