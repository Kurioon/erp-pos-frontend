<template>
  <div class="dashboard-view">
    <header class="dashboard-header">
      <div class="header-title-row">
        <div>
          <h1>Дашборд</h1>
          <p class="subtitle">{{ currentFormattedDate }}</p>
        </div>
        <div class="store-selector">
          <div class="status-dot"></div>
          <select :value="currentRegister" @change="repairsStore.selectedCashRegister = $event.target.value">
            <option value="Загальне">Загальний простір</option>
            <option value="Каса 1">Каса 1 (UAH)</option>
            <option value="Каса 2">Каса 2 (USD)</option>
            <option value="Каса 3">Каса 3 (UAH)</option>
          </select>
        </div>
      </div>
    </header>
    <DashboardMetrics :metrics="dashboardData.metrics" />
    <div class="main-dashboard-grid">
      <DashboardChart :chart-data="dashboardData.chart" />
      <DashboardAlerts :alerts="dashboardData.alerts" />
    </div>
    <DashboardTransactionsTable 
      :transactions="filteredTransactions" 
      :current-register="currentRegister"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRepairsStore } from '@/stores/repairs'
import DashboardMetrics from '@/components/dashboard/DashboardMetrics.vue'
import DashboardChart from '@/components/dashboard/DashboardChart.vue'
import DashboardAlerts from '@/components/dashboard/DashboardAlerts.vue'
import DashboardTransactionsTable from '@/components/dashboard/DashboardTransactionsTable.vue'

const repairsStore = useRepairsStore()
const currentRegister = computed(() => repairsStore.selectedCashRegister || 'Загальне')

const currentFormattedDate = computed(() => {
  const date = new Date()
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
  const formatted = date.toLocaleDateString('uk-UA', options)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
})
const dashboardData = computed(() => {
  const register = currentRegister.value

  if (register === 'Каса 1') {
    return {
      metrics: { revenue: 52500, sales: 2, repairs: 4, lowStock: 2 },
      chart: [40, 55, 30, 45, 60, 75, 50],
      alerts: [
        { name: 'AirPods Pro 2nd Gen', sku: 'ACC-006', val: '2 / 5', critical: true },
        { name: 'iPhone 14 128GB', sku: 'APL-011', val: '5 / 5', critical: false }
      ]
    }
  }

  if (register === 'Каса 2') {
    return {
      metrics: { revenue: 11580, sales: 1, repairs: 2, lowStock: 1 },
      chart: [20, 30, 65, 40, 35, 50, 45],
      alerts: [
        { name: 'Lenovo ThinkPad X1 Carbon Gen', sku: 'LNV-009', val: '2 / 2', critical: false }
      ]
    }
  }

  if (register === 'Каса 3') {
    return {
      metrics: { revenue: 39900, sales: 1, repairs: 3, lowStock: 2 },
      chart: [50, 40, 35, 70, 55, 90, 60],
      alerts: [
        { name: 'Apple Watch Ultra 2', sku: 'APL-007', val: '1 / 3', critical: true },
        { name: 'Samsung Galaxy Buds3 Pro', sku: 'SAM-008', val: '0 / 5', critical: true }
      ]
    }
  }
  return {
    metrics: { revenue: 93970, sales: 3, repairs: 9, lowStock: 5 },
    chart: [35, 50, 40, 60, 75, 90, 70],
    alerts: [
      { name: 'AirPods Pro 2nd Gen', sku: 'ACC-006', val: '2 / 5', critical: true },
      { name: 'Apple Watch Ultra 2', sku: 'APL-007', val: '1 / 3', critical: true },
      { name: 'Samsung Galaxy Buds3 Pro', sku: 'SAM-008', val: '0 / 5', critical: true },
      { name: 'Lenovo ThinkPad X1 Carbon Gen', sku: 'LNV-009', val: '2 / 2', critical: false },
      { name: 'iPhone 14 128GB', sku: 'APL-011', val: '5 / 5', critical: false }
    ]
  }
})

const allTransactions = [
  { date: '2026-05-27 09:15', register: 'Каса 1', type: 'Продаж', amount: 45990, currency: 'UAH', order: 'ORD-0125', class: 'type-sale', sign: '+' },
  { date: '2026-05-27 10:30', register: 'Каса 2', type: 'Продаж', amount: 7990, currency: 'UAH', order: 'ORD-0126', class: 'type-sale', sign: '+' },
  { date: '2026-05-27 11:00', register: 'Каса 1', type: 'Повернення', amount: 3490, currency: 'UAH', order: 'ORD-0118', class: 'type-return', sign: '-' },
  { date: '2026-05-27 12:15', register: 'Каса 3', type: 'Продаж', amount: 39900, currency: 'UAH', order: 'ORD-0127', class: 'type-sale', sign: '+' },
  { date: '2026-05-26 14:00', register: 'Каса 1', type: 'Прихід', amount: 10000, currency: 'UAH', order: '—', class: 'type-income', sign: '+' },
  { date: '2026-05-26 16:30', register: 'Каса 2', type: 'Продаж', amount: 1200, currency: 'USD', order: 'ORD-0124', class: 'type-sale', sign: '+' },
  { date: '2026-05-26 17:00', register: 'Каса 1', type: 'Витрата', amount: 5000, currency: 'UAH', order: '—', class: 'type-expense', sign: '-' }
]

const filteredTransactions = computed(() => {
  if (currentRegister.value === 'Загальне') return allTransactions
  return allTransactions.filter(t => t.register === currentRegister.value)
})
</script>



<style scoped>
.dashboard-view {
  padding: 32px;
  background-color: #ffffff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.dashboard-header h1 {
  font-size: 1.6rem;
  color: #0f172a;
  margin: 0 0 4px 0;
  font-weight: 700;
}

.subtitle {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
}

.header-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.store-selector {
  display: inline-flex;
  align-items: center;
  background: white;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03);
}

.status-dot {
  width: 8px;
  height: 8px;
  background-color: #10b981;
  border-radius: 50%;
  margin-right: 10px;
}

.store-selector select {
  border: none;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
  outline: none;
  background: transparent;
  cursor: pointer;
  padding-right: 4px;
}

.main-dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

@media (max-width: 1024px) {
  .main-dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style>