<template>
  <div class="task-form">
    <h4>Role Confirmation</h4>
    <div class="role-info">
      <p><strong>Role:</strong> {{ roleInfo.role }}</p>
      <p><strong>Location:</strong> {{ roleInfo.location }}</p>
      <p><strong>Department:</strong> {{ roleInfo.department }}</p>
      <p><strong>Start Date:</strong> {{ roleInfo.startDate }}</p>
    </div>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>
          <input type="checkbox" v-model="formData.confirmed" required />
          I confirm that the information above is correct
        </label>
      </div>
      <button type="submit" :disabled="!formData.confirmed">Confirm</button>
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

const roleInfo = ref({
  role: 'Employee',
  location: 'Main Office',
  department: 'Operations',
  startDate: new Date().toLocaleDateString()
})

const formData = ref({
  confirmed: false,
  confirmedAt: ''
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
  formData.value.confirmedAt = new Date().toISOString()
  emit('submit', { ...roleInfo.value, ...formData.value })
}
</script>

<style scoped>
.task-form {
  padding: 1rem 0;
}

.role-info {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.role-info p {
  margin: 0.5rem 0;
}

.form-group {
  margin-bottom: 1rem;
}

button {
  background: #42b883;
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
