<template>
  <div class="task-form">
    <h4>Document Upload</h4>
    <p class="hint">Upload required documents in PDF format</p>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>Document Type</label>
        <select v-model="formData.documentType" required>
          <option value="">Select type...</option>
          <option value="id">Government ID</option>
          <option value="ssn">Social Security Card</option>
          <option value="driver_license">Driver's License</option>
          <option value="work_permit">Work Permit</option>
          <option value="passport">Passport</option>
          <option value="certification">Professional Certification</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div class="form-group">
        <label>Upload PDF Document</label>
        <div class="file-upload-box">
          <input type="file" @change="handleFileChange" accept=".pdf" required />
          <div class="upload-content">
            <span class="upload-icon">📄</span>
            <span class="upload-text">Click to upload PDF</span>
            <span class="upload-hint">PDF only, max 10MB</span>
          </div>
        </div>
      </div>
      <div v-if="formData.fileName" class="file-info">
        <span class="file-icon">✅</span>
        <span>Selected: {{ formData.fileName }}</span>
      </div>
      <button type="submit" :disabled="!formData.fileData" class="btn-submit">Upload Document</button>
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
    if (file.type !== 'application/pdf') {
      alert('Only PDF files are allowed')
      event.target.value = ''
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      event.target.value = ''
      return
    }
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

.form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.file-upload-box {
  position: relative;
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  transition: border-color 0.2s, background 0.2s;
}

.file-upload-box:hover {
  border-color: #2c5282;
  background: #f7fafc;
}

.file-upload-box input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.upload-icon {
  font-size: 2rem;
}

.upload-text {
  font-weight: 500;
  color: #2c5282;
}

.upload-hint {
  font-size: 0.75rem;
  color: #718096;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #e6fffa;
  border: 1px solid #38b2ac;
  border-radius: 4px;
  margin-bottom: 1rem;
  color: #234e52;
}

.file-icon {
  font-size: 1.25rem;
}

button {
  background: #2c5282;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

button:hover:not(:disabled) {
  background: #1a365d;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
