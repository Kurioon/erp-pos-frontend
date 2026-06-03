<script setup>
const props = defineProps({
  alerts: { type: Array, required: true }
})
</script>

<template>
  <div class="dashboard-block-card alerts-container-block">
    <div class="alerts-header">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
      <h3>Алерти: дозамовлення</h3>
    </div>
    <div class="alerts-list">
      <div v-for="(alert, i) in props.alerts" :key="i" class="alert-item-row">
        <div class="alert-item-info">
          <p class="alert-item-name">{{ alert.name }}</p>
          <span class="alert-item-sku font-mono">{{ alert.sku }}</span>
        </div>
        <span class="alert-ratio-badge" :class="{ 'is-critical': alert.critical }">
          {{ alert.val }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-block-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.01), 0 20px 25px -5px rgba(0,0,0,0.02); }
.alerts-header { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; }
.alerts-header h3 { margin: 0 !important; font-size: 1rem; color: #0f172a; font-weight: 700; }
.alerts-list { display: flex; flex-direction: column; gap: 12px; }
.alert-item-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid #f8fafc; }
.alert-item-row:last-child { border-bottom: none; }
.alert-item-name { margin: 0 0 2px 0; font-size: 0.85rem; font-weight: 600; color: #1e293b; }
.alert-item-sku { font-size: 0.75rem; color: #94a3b8; font-weight: 500; }
.alert-ratio-badge { padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; background-color: #fef3c7; color: #d97706; }
.alert-ratio-badge.is-critical { background-color: #fee2e2; color: #ef4444; }
.font-mono { font-family: monospace; }
</style>