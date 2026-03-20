<template>
  <div class="task-form">
    <h4>E-Signature</h4>
    <p class="hint">Sign in the box below using your mouse or finger</p>
    <form @submit.prevent="handleSubmit">
      <div class="signature-pad" ref="signaturePad">
        <canvas 
          ref="canvas" 
          width="500" 
          height="180" 
          @mousedown="startDrawing" 
          @mousemove="draw" 
          @mouseup="stopDrawing" 
          @mouseleave="stopDrawing"
          @touchstart.prevent="startDrawingTouch"
          @touchmove.prevent="drawTouch"
          @touchend.prevent="stopDrawing"
        ></canvas>
        <div class="signature-line"></div>
        <div class="signature-x">X</div>
      </div>
      <button type="button" @click="clearSignature" class="btn-clear">Clear</button>
      <button type="submit" :disabled="!hasSignature" class="btn-sign">Sign Document</button>
    </form>
    <div class="signature-legal">
      <p>By signing above, I agree that my electronic signature is legally binding and has the same effect as a handwritten signature.</p>
    </div>
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
  ctx.strokeStyle = '#1a3a5c'
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
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

const startDrawingTouch = (e) => {
  isDrawing.value = true
  const ctx = canvas.value.getContext('2d')
  const rect = canvas.value.getBoundingClientRect()
  const touch = e.touches[0]
  ctx.beginPath()
  ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top)
  ctx.strokeStyle = '#1a3a5c'
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
}

const drawTouch = (e) => {
  if (!isDrawing.value) return
  const ctx = canvas.value.getContext('2d')
  const rect = canvas.value.getBoundingClientRect()
  const touch = e.touches[0]
  ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top)
  ctx.stroke()
  hasSignature.value = true
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
  position: relative;
  border: 2px solid #ccc;
  border-radius: 8px;
  margin-bottom: 1rem;
  background: linear-gradient(to bottom, #fff 0%, #fafafa 100%);
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.05);
}

.signature-pad canvas {
  display: block;
  cursor: crosshair;
  border-radius: 6px;
}

.signature-line {
  position: absolute;
  bottom: 35px;
  left: 20px;
  right: 20px;
  height: 1px;
  background: #999;
}

.signature-x {
  position: absolute;
  bottom: 12px;
  left: 25px;
  font-family: 'Brush Script MT', cursive, sans-serif;
  font-size: 18px;
  color: #666;
  font-style: italic;
}

button {
  background: #2c5282;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 0.5rem;
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

.btn-clear {
  background: #718096;
}

.btn-clear:hover {
  background: #4a5568;
}

.btn-sign {
  background: #38a169;
}

.btn-sign:hover:not(:disabled) {
  background: #2f855a;
}

.signature-legal {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #f7fafc;
  border-radius: 4px;
  border-left: 3px solid #2c5282;
}

.signature-legal p {
  font-size: 0.75rem;
  color: #4a5568;
  margin: 0;
}
</style>
