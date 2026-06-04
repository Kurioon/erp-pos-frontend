<template>
  <div class="dashboard-block-card alerts-container-block">
    <div class="alerts-header">
      <h3>Критичні залишки</h3>
      <span class="badge" v-if="props.alerts.length > 0">{{ props.alerts.length }}</span>
    </div>

    <div v-if="props.alerts.length === 0" class="empty-alerts">
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mb-2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
      <p>Усі товари в достатній кількості</p>
    </div>

    <div v-else class="alerts-list">
      <div v-for="(alert, idx) in props.alerts" :key="idx" class="alert-item" :class="{ 'is-critical': alert.critical }">
        <div class="alert-icon">
          <svg v-if="alert.critical" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
        <div class="alert-content">
          <p class="alert-name">{{ alert.name }}</p>
          <p class="alert-sku">{{ alert.sku }}</p>
        </div>
        <div class="alert-qty">
          {{ alert.val }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  alerts: { type: Array, required: true, default: () => [] }
})
</script>

<style scoped>
.dashboard-block-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.01), 0 20px 25px -5px rgba(0,0,0,0.02); display: flex; flex-direction: column; }
.alerts-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.alerts-header h3 { font-size: 1.1rem; color: #0f172a; margin: 0; font-weight: 700; }
.badge { background: #fef2f2; color: #ef4444; padding: 2px 8px; border-radius: 99px; font-size: 0.75rem; font-weight: 700; }

.empty-alerts { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; padding: 32px 0; color: #94a3b8; font-size: 0.9rem; font-weight: 500; text-align: center; }
.mb-2 { margin-bottom: 8px; }

.alerts-list { display: flex; flex-direction: column; gap: 12px; overflow-y: auto; max-height: 250px; padding-right: 4px; }
.alerts-list::-webkit-scrollbar { width: 4px; }
.alerts-list::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }

.alert-item { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; background: #f8fafc; transition: all 0.2s; }
.alert-item.is-critical { border-color: #fca5a5; background: #fef2f2; }

.alert-icon { display: flex; align-items: center; justify-content: center; color: #f59e0b; flex-shrink: 0; }
.alert-item.is-critical .alert-icon { color: #ef4444; }

.alert-content { flex: 1; min-width: 0; }
.alert-name { margin: 0 0 2px 0; font-size: 0.85rem; font-weight: 600; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.alert-sku { margin: 0; font-size: 0.75rem; color: #64748b; }

.alert-qty { font-size: 0.95rem; font-weight: 700; color: #0f172a; flex-shrink: 0; }
.alert-item.is-critical .alert-qty { color: #ef4444; }
</style>
