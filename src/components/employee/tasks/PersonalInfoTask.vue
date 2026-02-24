<template>
  <div class="task-form">
    <h4>Personal Information</h4>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>First Name</label>
        <input v-model="formData.firstName" type="text" required />
      </div>
      <div class="form-group">
        <label>Last Name</label>
        <input v-model="formData.lastName" type="text" required />
      </div>
      <div class="form-group">
        <label>Email</label>
        <input v-model="formData.email" type="email" required />
      </div>
      <div class="form-group">
        <label>Phone</label>
        <input v-model="formData.phone" type="tel" />
      </div>
      <div class="form-group">
        <label>Date of Birth</label>
        <input v-model="formData.dateOfBirth" type="date" />
      </div>
      <div class="form-group">
        <label>Address</label>
        <textarea v-model="formData.address"></textarea>
      </div>
      <div class="form-group">
        <label>Emergency Contact</label>
        <input v-model="formData.emergencyContact" type="text" />
      </div>
      <button type="submit">Submit</button>
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
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  address: '',
  emergencyContact: ''
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
  emit('submit', formData.value)
}
</script>

<style scoped>
.task-form {
  padding: 1rem 0;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  background: #42b883;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
}
</style>
