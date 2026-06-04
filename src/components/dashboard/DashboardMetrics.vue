<template>
  <section class="metrics-row">
    <div class="metric-card">
      <div class="metric-info">
        <span class="metric-label">ВИРУЧКА СЬОГОДНІ</span>
        <h2 class="metric-value">{{ formatCurrency(props.metrics.revenue, 'UAH') }}</h2>
      </div>
      <div class="metric-icon-box bg-blue-light">
        <IconTrendingUp stroke="#2563eb" />
      </div>
    </div>

    <div class="metric-card">
      <div class="metric-info">
        <span class="metric-label">ПРОДАЖІВ СЬОГОДНІ</span>
        <h2 class="metric-value">{{ props.metrics.sales }}</h2>
      </div>
      <div class="metric-icon-box bg-green-light">
        <IconShoppingBag stroke="#10b981" />
      </div>
    </div>

    <div class="metric-card">
      <div class="metric-info">
        <span class="metric-label">АКТИВНИХ РЕМОНТІВ</span>
        <h2 class="metric-value">{{ props.metrics.repairs }}</h2>
      </div>
      <div class="metric-icon-box bg-amber-light">
        <IconWrench stroke="#f59e0b" />
      </div>
    </div>

    <div class="metric-card">
      <div class="metric-info">
        <span class="metric-label">ТОВАРІВ З НИЗЬКИМ ЗАЛИШКОМ</span>
        <h2 class="metric-value text-danger-val">{{ props.metrics.lowStock }}</h2>
      </div>
      <div class="metric-icon-box bg-red-light">
        <IconAlertTriangle stroke="#ef4444" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { formatCurrency } from '@/utils/formatters'
import IconTrendingUp from '@/components/icons/IconTrendingUp.vue'
import IconShoppingBag from '@/components/icons/IconShoppingBag.vue'
import IconWrench from '@/components/icons/IconWrench.vue'
import IconAlertTriangle from '@/components/icons/IconAlertTriangle.vue'

const props = defineProps({
  metrics: {
    type: Object,
    required: true,
    default: () => ({ revenue: 0, sales: 0, repairs: 0, lowStock: 0 })
  }
})
</script>

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
