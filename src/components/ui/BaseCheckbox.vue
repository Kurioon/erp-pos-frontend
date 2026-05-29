<template>
  <label class="base-checkbox-wrapper" :class="{ 'is-disabled': disabled }">
    <input
      type="checkbox"
      class="base-checkbox"
      :checked="modelValue"
      :disabled="disabled"
      @change="$emit('update:modelValue', $event.target.checked)"
    />
    <span class="checkmark"></span>
    <span v-if="label" class="checkbox-label">{{ label }}</span>
  </label>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.base-checkbox-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.base-checkbox-wrapper.is-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.base-checkbox {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  display: inline-block;
  width: 18px;
  height: 18px;
  background-color: #fff;
  border: 1.5px solid #d1d5db;
  border-radius: 4px;
  position: relative;
  transition: all 0.2s ease;
}

.base-checkbox-wrapper:hover input ~ .checkmark {
  border-color: #3b82f6;
}

.base-checkbox:checked ~ .checkmark {
  background-color: #2563eb;
  border-color: #2563eb;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
  left: 5px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.base-checkbox:checked ~ .checkmark:after {
  display: block;
}

.checkbox-label {
  font-size: 14px;
  color: #374151;
}
</style>