<script setup>
import BaseStatusBadge from '@/components/ui/BaseStatusBadge.vue'

defineProps({
  job: {
    type: Object,
    required: true
  }
})

const getStatusVariant = (status) => {
  switch (status) {
    case 'прийнято': return 'warning'
    case 'відремонтовано': return 'success'
    case 'очікує компонентів': return 'danger'
    default: return 'primary'
  }
}
</script>

<template>
  <div class="repair-card">
    <div class="card-header">
      <span class="device-name">{{ job.device_name }}</span>
      <BaseStatusBadge :variant="getStatusVariant(job.status)">
  {{ job.status }}
</BaseStatusBadge>
    </div>
    
    <div class="card-body">
      <p class="customer"><strong>Клієнт:</strong> {{ job.customer_name }}</p>
      <p class="description">{{ job.description }}</p>
    </div>
    
    <div class="card-footer">
      <span class="storage-cell">Комірка: {{ job.storage_cell }}</span>
    </div>
  </div>
</template>

<style scoped>
.repair-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s ease;
  cursor: pointer;
}

.repair-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 8px;
}

.device-name {
  font-weight: 600;
  font-size: 1.1rem;
  color: #1e293b;
}

.card-body {
  font-size: 0.9rem;
  color: #475569;
  margin-bottom: 12px;
}

.customer {
  margin-bottom: 4px;
}

.description {
  color: #64748b;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  font-size: 0.8rem;
  color: #94a3b8;
  font-weight: 500;
}
</style>