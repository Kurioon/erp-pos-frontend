<template>
  <div class="base-select-group">
    <label v-if="label" :for="uuid" class="base-select-label">{{ label }}</label>
    
    <div class="select-wrapper">
      <select
        :id="uuid"
        :value="modelValue"
        :disabled="disabled"
        :class="['base-select', { 'is-invalid': error }]"
        @change="$emit('update:modelValue', $event.target.value)"
      >
        <option v-if="placeholder" value="" disabled selected>{{ placeholder }}</option>
        <option 
          v-for="option in options" 
          :key="option.value" 
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </div>
    
    <span v-if="error" class="base-select-error">{{ error }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  options: {
    type: Array,
    required: true,
    default: () => []
  },
  disabled: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  id: {
    type: String,
    default: null
  }
})

defineEmits(['update:modelValue'])

const uuid = computed(() => props.id || `select-${Math.random().toString(36).substr(2, 9)}`)
</script>

<style scoped>
.base-select-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  max-width: 320px;
  font-family: inherit;
}

.base-select-label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.select-wrapper {
  position: relative;
  width: 100%;
}

.base-select {
  width: 100%;
  padding: 10px 36px 10px 12px;
  font-size: 14px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background-color: #ffffff;
  color: #111827;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  transition: border-color 0.15s ease;
  font-family: inherit;
}

.base-select:focus {
  border-color: #2563eb;
  outline: none;
}

.base-select:disabled {
  background-color: #f9fafb;
  color: #9ca3af;
  border-color: #e5e7eb;
  cursor: not-allowed;
}

.base-select.is-invalid {
  border-color: #dc2626;
}

.base-select-error {
  font-size: 12px;
  color: #dc2626;
  margin-top: 2px;
}
</style>