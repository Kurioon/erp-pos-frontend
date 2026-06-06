<template>
  <div class="dashboard-view">
    <header class="dashboard-header">
      <div class="header-title-row">
        <div>
          <h1>Дашборд</h1>
          <p class="subtitle">{{ currentFormattedDate }}</p>
        </div>
        <div class="store-selector-wrapper">
          <BaseSelect
            v-model="currentRegisterId"
            :options="registerOptions"
            :show-dot="true"
            placeholder="Оберіть простір"
          />
        </div>
      </div>
    </header>

    <DashboardMetrics :metrics="dashboardMetrics" />

    <div class="main-dashboard-grid">
      <DashboardChart :chart-data="dashboardData.chart" />
      <DashboardAlerts :alerts="dashboardStore.lowStockAlerts" />
    </div>

    <DashboardTransactionsTable
      :transactions="formattedTransactions"
      :current-register="currentRegisterName"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useCartStore } from '@/stores/pos'
import { useFinanceStore } from '@/stores/finance'
import { useRepairsStore } from '@/stores/repairs'
import { useDashboardStore } from '@/stores/dashboard'

import BaseSelect from '@/components/ui/BaseSelect.vue'
import DashboardMetrics from '@/components/dashboard/DashboardMetrics.vue'
import DashboardChart from '@/components/dashboard/DashboardChart.vue'
import DashboardAlerts from '@/components/dashboard/DashboardAlerts.vue'
import DashboardTransactionsTable from '@/components/dashboard/DashboardTransactionsTable.vue'

const cartStore = useCartStore()
const financeStore = useFinanceStore()
const repairsStore = useRepairsStore()
const dashboardStore = useDashboardStore()

const currentRegisterId = ref('all')

onMounted(() => {
  const todayObj = new Date()
  const todayStr = todayObj.getFullYear() + '-' + String(todayObj.getMonth() + 1).padStart(2, '0') + '-' + String(todayObj.getDate()).padStart(2, '0')

  cartStore.fetchCashboxes()
  financeStore.fetchTransactions(1, { date: todayStr })
  repairsStore.fetchJobs()
  dashboardStore.fetchLowStockAlerts()
})

const currentFormattedDate = computed(() => {
  const date = new Date()
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
  const formatted = date.toLocaleDateString('uk-UA', options)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
})

const registerOptions = computed(() => {
  const options = [{ value: 'all', label: 'Загальний простір' }]
  cartStore.availableCashboxes.forEach(box => {
    options.push({ value: box.id, label: box.name })
  })
  return options
})

const currentRegisterName = computed(() => {
  if (currentRegisterId.value === 'all') return 'Загальне'
  const box = cartStore.availableCashboxes.find(b => b.id === currentRegisterId.value)
  return box ? box.name : 'Невідомо'
})

const formattedTransactions = computed(() => {
  let txs = financeStore.transactions

  if (currentRegisterId.value !== 'all') {
    txs = txs.filter(t => String(t.cash_register) === String(currentRegisterId.value))
  }

  return txs.slice(0, 10).map(tx => {
    const isIncome = !['expense', 'refund'].includes(tx.transaction_type)
    return {
      raw: tx,
      date: tx.timestamp || tx.created_at,
      register: currentRegisterName.value === 'Загальне' ? (cartStore.availableCashboxes.find(b => b.id === tx.cash_register)?.name || `Каса #${tx.cash_register}`) : currentRegisterName.value,
      type: isIncome ? 'Прихід' : 'Витрата',
      amount: tx.amount,
      currency: tx.currency || 'UAH',
      order: tx.order ? `ORD-${tx.order}` : '—',
      class: isIncome ? 'type-income' : 'type-expense',
      sign: isIncome ? '+' : '-'
    }
  })
})

const dashboardMetrics = computed(() => {
  const todayObj = new Date()
  const todayStr = todayObj.getFullYear() + '-' + String(todayObj.getMonth() + 1).padStart(2, '0') + '-' + String(todayObj.getDate()).padStart(2, '0')

  let todaysIncome = 0
  let todaysSalesCount = 0

  financeStore.transactions.forEach(tx => {
    const txDateObj = new Date(tx.timestamp || tx.created_at || new Date())
    const txDateStr = txDateObj.getFullYear() + '-' + String(txDateObj.getMonth() + 1).padStart(2, '0') + '-' + String(txDateObj.getDate()).padStart(2, '0')

    if (txDateStr === todayStr) {
      if (['expense', 'refund', 'purchase'].includes(tx.transaction_type)) {
        todaysIncome -= Number(tx.amount_uah || tx.amount)
      } else if (['prepay', 'payment', 'sale', 'income'].includes(tx.transaction_type)) {
        todaysIncome += Number(tx.amount_uah || tx.amount)
        if (tx.order && tx.transaction_type !== 'income') todaysSalesCount++
      }
    }
  })

  return {
    revenue: todaysIncome,
    sales: todaysSalesCount,
    repairs: repairsStore.jobs.filter(j => ['pending', 'waiting_parts', 'repaired'].includes(j.status)).length,
    lowStock: dashboardStore.lowStockAlerts.length
  }
})

// Моковий графік (поки бекенд не дасть ендпоінт для графіка)
const dashboardData = computed(() => {
  return {
    chart: [35, 50, 40, 60, 75, 90, 70]
  }
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
  flex-wrap: wrap;
  gap: 16px;
}

.store-selector-wrapper {
  width: 250px;
}

.store-selector-wrapper :deep(div) {
  margin-bottom: 0 !important;
}

.main-dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

@media (max-width: 1024px) {
  .main-dashboard-grid { grid-template-columns: 1fr; }
  .store-selector-wrapper { width: 100%; }
}

@media (max-width: 768px) {
  .dashboard-view { padding: 16px; }
}
</style>
