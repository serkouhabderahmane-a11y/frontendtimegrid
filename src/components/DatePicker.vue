<template>
  <div class="date-picker-wrapper">
    <input
      ref="inputRef"
      type="text"
      :value="displayValue"
      @click="togglePicker"
      @input="handleInput"
      :placeholder="placeholder"
      class="date-input"
      readonly
    />
    <div v-if="isOpen" class="date-picker-dropdown">
      <div class="picker-header">
        <button type="button" @click="prevMonth" class="nav-btn">&lt;</button>
        <span class="current-month">{{ monthYearDisplay }}</span>
        <button type="button" @click="nextMonth" class="nav-btn">&gt;</button>
      </div>
      <div class="picker-weekdays">
        <span v-for="day in weekdays" :key="day">{{ day }}</span>
      </div>
      <div class="picker-days">
        <button
          v-for="day in calendarDays"
          :key="day.date"
          type="button"
          class="day-btn"
          :class="{ 
            'other-month': day.isOtherMonth, 
            'selected': isSelected(day.date),
            'today': isToday(day.date)
          }"
          @click="selectDate(day.date)"
        >
          {{ day.day }}
        </button>
      </div>
      <div class="picker-footer">
        <button type="button" @click="selectToday" class="today-btn">Today</button>
        <button type="button" @click="clearDate" class="clear-btn">Clear</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Select date'
  }
})

const emit = defineEmits(['update:modelValue'])

const inputRef = ref(null)
const isOpen = ref(false)
const currentDate = ref(new Date())

const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const displayValue = computed(() => {
  if (!props.modelValue) return ''
  const date = new Date(props.modelValue)
  if (isNaN(date.getTime())) return props.modelValue
  return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
})

const monthYearDisplay = computed(() => {
  return currentDate.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPadding = firstDay.getDay()
  
  const days = []
  
  // Previous month days
  const prevMonthLast = new Date(year, month, 0)
  for (let i = startPadding - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthLast.getDate() - i)
    days.push({
      day: prevMonthLast.getDate() - i,
      date: formatDate(date),
      isOtherMonth: true
    })
  }
  
  // Current month days
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i)
    days.push({
      day: i,
      date: formatDate(date),
      isOtherMonth: false
    })
  }
  
  // Next month days
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const date = new Date(year, month + 1, i)
    days.push({
      day: i,
      date: formatDate(date),
      isOtherMonth: true
    })
  }
  
  return days
})

const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const isSelected = (date) => props.modelValue === date

const isToday = (date) => {
  const today = formatDate(new Date())
  return date === today
}

const togglePicker = () => {
  isOpen.value = !isOpen.value
}

const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

const selectDate = (date) => {
  emit('update:modelValue', date)
  isOpen.value = false
}

const selectToday = () => {
  const today = formatDate(new Date())
  emit('update:modelValue', today)
  isOpen.value = false
}

const clearDate = () => {
  emit('update:modelValue', '')
  isOpen.value = false
}

const handleInput = (e) => {
  // Allow typing but validate
}

const handleClickOutside = (e) => {
  if (inputRef.value && !inputRef.value.contains(e.target) && !e.target.closest('.date-picker-dropdown')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  if (props.modelValue) {
    const [year, month] = props.modelValue.split('-')
    currentDate.value = new Date(year, month - 1, 1)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.date-picker-wrapper {
  position: relative;
  width: 100%;
}

.date-input {
  width: 100%;
  padding: 0.75rem;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 6px;
  color: #f8fafc;
  font-size: 0.875rem;
  cursor: pointer;
}

.date-input:focus {
  outline: none;
  border-color: #42b883;
}

.date-picker-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 100;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.current-month {
  color: #f8fafc;
  font-weight: 600;
}

.nav-btn {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  font-size: 1rem;
}

.nav-btn:hover {
  color: #42b883;
}

.picker-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.picker-weekdays span {
  text-align: center;
  color: #64748b;
  font-size: 0.75rem;
  padding: 0.25rem;
}

.picker-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
}

.day-btn {
  background: none;
  border: none;
  color: #e2e8f0;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.day-btn:hover {
  background: #334155;
}

.day-btn.other-month {
  color: #475569;
}

.day-btn.selected {
  background: #42b883;
  color: white;
}

.day-btn.today {
  border: 1px solid #42b883;
}

.picker-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid #334155;
}

.today-btn, .clear-btn {
  background: none;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
}

.today-btn {
  color: #42b883;
}

.clear-btn {
  color: #94a3b8;
}

.today-btn:hover, .clear-btn:hover {
  background: #334155;
}
</style>
