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
      :aria-invalid="!!error"
      :aria-describedby="error ? `${uuid}-error` : null"
      @input="$emit('update:modelValue', $event.target.value)"
    />

    <span v-if="error" :id="`${uuid}-error`" class="base-input-error" role="alert">
      {{ error }}
    </span>
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
}

.base-input-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
}

.base-input {
  width: 100%;
  padding: 10px 12px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #334155;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-family: inherit;
  transition: all 0.2s ease;
}

.base-input::placeholder {
  color: #94a3b8;
  font-weight: 400;
}

.base-input:hover:not(:disabled) {
  border-color: #cbd5e1;
  background-color: #f1f5f9;
}

.base-input:focus {
  border-color: #2563eb;
  background-color: #ffffff;
  outline: 3px solid rgba(37, 99, 235, 0.3);
  outline-offset: 1px;
}

.base-input:disabled {
  background-color: #f3f4f6;
  color: #9ca3af;
  border-color: #e5e7eb;
  cursor: not-allowed;
  font-weight: 500;
}

.base-input.is-invalid {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.base-input-error {
  font-size: 0.75rem;
  color: #ef4444;
  margin-top: 2px;
}
</style>
