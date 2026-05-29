<template>
  <div class="base-loader">
    <div class="spinner" :style="{ width: size + 'px', height: size + 'px', borderColor: color, borderTopColor: 'transparent' }"></div>
    <span v-if="text" class="loader-text">{{ text }}</span>
  </div>
</template>

<script setup>
defineProps({
  size: {
    type: [Number, String],
    default: 24
  },
  color: {
    type: String,
    default: '#2563eb' 
  },
  text: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.base-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.spinner {
  border-width: 3px;
  border-style: solid;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loader-text {
  font-size: 13px;
  color: #6b7280;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>