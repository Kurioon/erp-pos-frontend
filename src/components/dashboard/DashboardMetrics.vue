<script setup>
import { formatCurrency } from '@/utils/formatters'

const props = defineProps({
  metrics: {
    type: Object,
    required: true,
    default: () => ({ revenue: 0, sales: 0, repairs: 0, lowStock: 0 })
  }
})
</script>

<template>
  <section class="metrics-row">
    <div class="metric-card">
      <div class="metric-info">
        <span class="metric-label">ВИРУЧКА СЬОГОДНІ</span>
        <h2 class="metric-value">{{ formatCurrency(props.metrics.revenue, 'UAH') }}</h2>
      </div>
      <div class="metric-icon-box bg-blue-light">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
      </div>
    </div>

    <div class="metric-card">
      <div class="metric-info">
        <span class="metric-label">ПРОДАЖІВ СЬОГОДНІ</span>
        <h2 class="metric-value">{{ props.metrics.sales }}</h2>
      </div>
      <div class="metric-icon-box bg-green-light">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
      </div>
    </div>

    <div class="metric-card">
      <div class="metric-info">
        <span class="metric-label">АКТИВНИХ РЕМОНТІВ</span>
        <h2 class="metric-value">{{ props.metrics.repairs }}</h2>
      </div>
      <div class="metric-icon-box bg-amber-light">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
        </svg>
      </div>
    </div>

    <div class="metric-card">
      <div class="metric-info">
        <span class="metric-label">ТОВАРІВ З НИЗЬКИМ ЗАЛИШКОМ</span>
        <h2 class="metric-value text-danger-val">{{ props.metrics.lowStock }}</h2>
      </div>
      <div class="metric-icon-box bg-red-light">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      </div>
    </div>
  </section>
</template>

<style scoped>
.metrics-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.metric-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
.metric-info { display: flex; flex-direction: column; gap: 4px; }
.metric-label { font-size: 0.7rem; font-weight: 700; color: #94a3b8; letter-spacing: 0.05em; }
.metric-value { font-size: 1.5rem; font-weight: 700; color: #0f172a; margin: 0; letter-spacing: -0.02em; }
.text-danger-val { color: #ef4444; }
.metric-icon-box { width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
.bg-blue-light { background-color: #eff6ff; }
.bg-green-light { background-color: #ecfdf5; }
.bg-amber-light { background-color: #fffbeb; }
.bg-red-light { background-color: #fef2f2; }

@media (max-width: 1024px) { .metrics-row { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px) { .metrics-row { grid-template-columns: 1fr; } }
</style>