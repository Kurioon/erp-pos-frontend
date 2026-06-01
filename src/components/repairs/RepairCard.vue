<script setup>
defineProps({
  job: {
    type: Object,
    required: true
  }
})
const formatDateTime = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toLocaleString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
    <div 
      class="repair-card"
      tabindex="0"
      role="button"
      aria-label="Картка ремонту"
      @keydown.enter.prevent="$emit('click')"
      @keydown.space.prevent="$emit('click')"
      @click="$emit('click')"
    >
      <div class="card-header">
        <span class="job-id">R00{{ job.id }}</span>
        <span class="storage-pill">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          {{ job.storage_cell }}
        </span>
      </div>
      
      <div class="card-body">
        <h3 class="device-name">{{ job.device_name }}</h3>
        <p class="description">{{ job.description }}</p>
        
        <div class="customer-info">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <span>{{ job.customer_name }}</span>
        </div>
        <div class="date-info">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          <span>{{ formatDateTime(job.created_at) }}</span>
        </div>
      </div>
    </div>
  </template>

<style scoped>
.repair-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.repair-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.job-id {
  font-size: 0.8rem;
  color: #94a3b8;
  font-weight: 500;
}

.storage-pill {
  color: #3b82f6;
  border: 1px solid #bfdbfe;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.device-name {
  font-weight: 600;
  font-size: 1rem;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.description {
  color: #64748b;
  font-size: 0.85rem;
  margin: 0 0 12px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.customer-info, .date-info {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  font-size: 0.8rem;
  margin-bottom: 4px;
}
.repair-card:focus-visible {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}
</style>