<template>
  <div class="base-input-group">
    <label :for="uuid" class="base-input-label">{{ label }}</label>
    
    <input
      :id="uuid"
      :type="type"
      :value="modelValue"
      :disabled="disabled"
      :placeholder="placeholder"
      :class="['base-input', { 'is-invalid': error }]"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    
    <span v-if="error" class="base-input-error">{{ error }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    required: true
  },
  placeholder: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text'
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

const uuid = computed(() => props.id || `input-${Math.random().toString(36).substr(2, 9)}`)
</script>

<style scoped>
.base-input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-family: inherit;
  width: 100%;
  max-width: 320px;
}

.base-input-label {
  font-size: 13px;
  font-weight: 500;
  color: #374151; 
}

.base-input {
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid #d1d5db; 
  border-radius: 4px;
  background-color: #ffffff;
  color: #111827;
  font-family: inherit;
  transition: border-color 0.15s ease;
}

.base-input:focus {
  border-color: #2563eb; 
  outline: none;
}

.base-input:disabled {
  background-color: #f9fafb;
  color: #9ca3af;
  border-color: #e5e7eb;
  cursor: not-allowed;
}

.base-input.is-invalid {
  border-color: #dc2626; 
}

.base-input-error {
  font-size: 12px;
  color: #dc2626;
  margin-top: 2px;
}
</style>