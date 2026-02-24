<template>
  <div class="task-form">
    <h4>Document Upload</h4>
    <p class="hint">Upload required documents (PDF, JPG, PNG)</p>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>Document Type</label>
        <select v-model="formData.documentType" required>
          <option value="">Select type...</option>
          <option value="id">Government ID</option>
          <option value="ssn">Social Security Card</option>
          <option value="driver_license">Driver's License</option>
          <option value="work_permit">Work Permit</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div class="form-group">
        <label>Upload File</label>
        <input type="file" @change="handleFileChange" accept=".pdf,.jpg,.jpeg,.png" />
      </div>
      <div v-if="formData.fileName" class="file-info">
        Selected: {{ formData.fileName }}
      </div>
      <button type="submit" :disabled="!formData.fileData">Submit</button>
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
  documentType: '',
  fileName: '',
  fileData: ''
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

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    formData.value.fileName = file.name
    const reader = new FileReader()
    reader.onload = (e) => {
      formData.value.fileData = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const handleSubmit = () => {
  emit('submit', formData.value)
}
</script>

<style scoped>
.task-form {
  padding: 1rem 0;
}

.hint {
  color: #666;
  font-size: 0.875rem;
  margin-bottom: 1rem;
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
.form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.file-info {
  padding: 0.5rem;
  background: #e8f5e9;
  border-radius: 4px;
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
