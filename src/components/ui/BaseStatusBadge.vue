<template>
  <span :class="['status-badge', `status-${type}`]">
    <span class="status-dot"></span>
    <slot>{{ text }}</slot>
  </span>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'success', 'warning', 'danger', 'info'].includes(value)
  }
})
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 12px;
  width: fit-content;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-default {
  background-color: #f3f4f6;
  color: #374151;
}
.status-default .status-dot { background-color: #9ca3af; }

.status-info {
  background-color: #eff6ff;
  color: #1e40af;
}
.status-info .status-dot { background-color: #3b82f6; }

.status-warning {
  background-color: #fffbeb;
  color: #92400e;
}
.status-warning .status-dot { background-color: #f59e0b; }

.status-success {
  background-color: #ecfdf5;
  color: #065f46;
}
.status-success .status-dot { background-color: #10b981; }

.status-danger {
  background-color: #fef2f2;
  color: #991b1b;
}
.status-danger .status-dot { background-color: #ef4444; }
</style>