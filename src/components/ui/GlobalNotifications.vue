<template>
  <div class="notifications-container">
    <transition-group name="toast">
      <div
        v-for="toast in notifications"
        :key="toast.id"
        :class="['toast', `toast-${toast.type}`]"
        @click="removeNotification(toast.id)"
        role="alert"
        aria-live="assertive"
      >
        {{ toast.message }}
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const notifications = ref([])
let toastId = 0

const addNotification = (event) => {
  const id = toastId++
  const { message, type = 'error' } = event.detail

  notifications.value.push({ id, message, type })

  setTimeout(() => {
    removeNotification(id)
  }, 5000)
}

const removeNotification = (id) => {
  notifications.value = notifications.value.filter(n => n.id !== id)
}

onMounted(() => {
  window.addEventListener('api-error', addNotification)
  // На майбутнє: додати ще івент для успішних дій
  window.addEventListener('app-success', addNotification)
})

onUnmounted(() => {
  window.removeEventListener('api-error', addNotification)
  window.removeEventListener('app-success', addNotification)
})
</script>

<style scoped>
.notifications-container {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

.toast {
  pointer-events: auto;
  min-width: 280px;
  max-width: 400px;
  padding: 16px 20px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  color: #fff;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.toast-error {
  background-color: var(--status-danger, #ef4444);
}

.toast-warning {
  background-color: var(--status-warning, #f59e0b);
}

.toast-success {
  background-color: var(--status-success, #10b981);
}

.toast-info {
  background-color: var(--primary-blue, #3b82f6);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
