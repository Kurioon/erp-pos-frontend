<script setup>
import { formatCurrency } from '@/utils/formatters'

const props = defineProps({
  chartData: { type: Array, required: true }
})

const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд']
</script>

<template>
  <div class="dashboard-block-card chart-container-block">
    <h3>Виручка за тиждень (₴)</h3>
    <div class="pure-css-chart">
      <div class="chart-y-axis">
        <span>260k</span><span>195k</span><span>130k</span><span>65k</span><span>0k</span>
      </div>
      <div class="chart-bars-wrapper">
        <div v-for="(height, idx) in props.chartData" :key="idx" class="chart-bar-column">
          <div class="bar-actual" :style="{ height: height + '%' }">
            <span class="bar-tooltip-pop">{{ formatCurrency(height * 2600, 'UAH') }}</span>
          </div>
          <span class="bar-day-label">{{ days[idx] }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-block-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.01), 0 20px 25px -5px rgba(0,0,0,0.02); }
.dashboard-block-card h3 { font-size: 1rem; color: #0f172a; margin: 0 0 20px 0; font-weight: 700; }
.pure-css-chart { display: flex; gap: 16px; height: 220px; position: relative; padding-top: 10px; }
.chart-y-axis { display: flex; flex-direction: column; justify-content: space-between; height: 190px; font-size: 0.75rem; color: #94a3b8; font-weight: 600; text-align: right; width: 35px; }
.chart-bars-wrapper { flex: 1; display: flex; justify-content: space-between; align-items: flex-end; height: 190px; border-bottom: 1px solid #e2e8f0; padding: 0 10px; }
.chart-bar-column { display: flex; flex-direction: column; align-items: center; flex: 1; height: 100%; justify-content: flex-end; position: relative; }
.bar-actual { width: 32px; background-color: #2563eb; border-top-left-radius: 6px; border-top-right-radius: 6px; position: relative; transition: height 0.4s cubic-bezier(0.25, 1, 0.5, 1); cursor: pointer; }
.bar-actual:hover { background-color: #1d4ed8; }
.bar-tooltip-pop { position: absolute; top: -36px; left: 50%; transform: translateX(-50%) scale(0.9); background: #0f172a; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; white-space: nowrap; opacity: 0; pointer-events: none; transition: all 0.15s ease; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 10; }
.bar-actual:hover .bar-tooltip-pop { opacity: 1; transform: translateX(-50%) scale(1); }
.bar-day-label { position: absolute; bottom: -24px; font-size: 0.8rem; color: #64748b; font-weight: 600; }
</style>