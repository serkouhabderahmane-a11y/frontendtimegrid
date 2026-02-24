<template>
  <div class="task-form">
    <h4>E-Signature</h4>
    <p class="hint">Sign in the box below using your mouse or touch</p>
    <form @submit.prevent="handleSubmit">
      <div class="signature-pad" ref="signaturePad">
        <canvas ref="canvas" width="400" height="150" @mousedown="startDrawing" @mousemove="draw" @mouseup="stopDrawing" @mouseleave="stopDrawing"></canvas>
      </div>
      <button type="button" @click="clearSignature" class="btn-clear">Clear</button>
      <button type="submit" :disabled="!hasSignature">Sign</button>
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

const canvas = ref(null)
const hasSignature = ref(false)
const isDrawing = ref(false)

const formData = ref({
  signatureData: '',
  signedAt: ''
})

onMounted(() => {
  if (props.submissionData) {
    try {
      const data = JSON.parse(props.submissionData)
      formData.value = { ...formData.value, ...data }
      if (data.signatureData) {
        loadSignature(data.signatureData)
      }
    } catch (e) {
      console.error('Failed to parse submission data')
    }
  }
})

const loadSignature = (dataUrl) => {
  const img = new Image()
  img.onload = () => {
    const ctx = canvas.value.getContext('2d')
    ctx.drawImage(img, 0, 0)
    hasSignature.value = true
  }
  img.src = dataUrl
}

const startDrawing = (e) => {
  isDrawing.value = true
  const ctx = canvas.value.getContext('2d')
  const rect = canvas.value.getBoundingClientRect()
  ctx.beginPath()
  ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
}

const draw = (e) => {
  if (!isDrawing.value) return
  const ctx = canvas.value.getContext('2d')
  const rect = canvas.value.getBoundingClientRect()
  ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
  ctx.stroke()
  hasSignature.value = true
}

const stopDrawing = () => {
  isDrawing.value = false
}

const clearSignature = () => {
  const ctx = canvas.value.getContext('2d')
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
  hasSignature.value = false
  formData.value.signatureData = ''
}

const handleSubmit = () => {
  formData.value.signatureData = canvas.value.toDataURL()
  formData.value.signedAt = new Date().toISOString()
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

.signature-pad {
  border: 2px dashed #ddd;
  border-radius: 4px;
  margin-bottom: 1rem;
  background: white;
}

.signature-pad canvas {
  display: block;
  cursor: crosshair;
}

button {
  background: #42b883;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 0.5rem;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-clear {
  background: #666;
}
</style>
