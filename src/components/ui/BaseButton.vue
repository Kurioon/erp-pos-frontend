<template>
  <button
    :disabled="disabled || loading"
    :class="['base-button', { 'is-loading': loading }]"
    v-bind="$attrs"
  >
    <span v-if="loading" class="spinner"></span>
    
    <span :class="{ 'text-hidden': loading }">
      <slot />
    </span>
  </button>
</template>

<script setup>
defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background-color: #2563eb; 
  color: #ffffff;
  border: 1px solid transparent;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  font-family: inherit;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.base-button:hover,
.base-button:focus {
  background-color: #1d4ed8; 
  outline: none;
}

.base-button:disabled {
  background-color: #f3f4f6; 
  color: #9ca3af; 
  cursor: not-allowed;
}

.spinner {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.text-hidden {
  opacity: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>