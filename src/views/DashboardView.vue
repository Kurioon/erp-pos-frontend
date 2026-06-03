<script setup>
import { ref, computed } from 'vue'
import { useRepairsStore } from '@/stores/repairs'

// Імпортуємо атомарні компоненти
import DashboardMetrics from '@/components/dashboard/DashboardMetrics.vue'
import DashboardChart from '@/components/dashboard/DashboardChart.vue'
import DashboardAlerts from '@/components/dashboard/DashboardAlerts.vue'
import DashboardTransactionsTable from '@/components/dashboard/DashboardTransactionsTable.vue'

const repairsStore = useRepairsStore()
const currentRegister = computed(() => repairsStore.selectedCashRegister || 'Загальне')

// Реактивний стан для кастомного меню вибору каси
const isStoreMenuOpen = ref(false)
const stores = [
  { value: 'all', label: 'Загальне' },
  { value: '1', label: 'Каса 1' },
  { value: '2', label: 'Каса 2' },
  { value: '3', label: 'Каса 3' }
]

const toggleStoreMenu = () => {
  isStoreMenuOpen.value = !isStoreMenuOpen.value
}

const closeStoreMenu = () => {
  setTimeout(() => { isStoreMenuOpen.value = false }, 150)
}

const selectStore = (store) => {
  repairsStore.selectedCashRegister = store.label
  isStoreMenuOpen.value = false
}

// Автоматичний вивід поточної дати українською мовою
const currentFormattedDate = computed(() => {
  const date = new Date()
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
  const formatted = date.toLocaleDateString('uk-UA', options)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
})

// Статичні реактивні дані під макети Фігми
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

// Журнал транзакцій для нижньої таблиці
const allTransactions = [
  { date: '2026-05-27 09:15', register: 'Каса 1', type: 'Продаж', amount: 45990, currency: 'UAH', order: 'ORD-0125', class: 'type-sale', sign: '+' },
  { date: '2026-05-27 10:30', register: 'Каса 2', type: 'Продаж', amount: 7990, currency: 'UAH', order: 'ORD-0126', class: 'type-sale', sign: '+' },
  { date: '2026-05-27 11:00', register: 'Каса 1', type: 'Повернення', amount: 3490, currency: 'UAH', order: 'ORD-0118', class: 'type-return', sign: '-' },
  { date: '2026-05-27 12:15', register: 'Каса 3', type: 'Продаж', amount: 39900, currency: 'UAH', order: 'ORD-0127', class: 'type-sale', sign: '+' },
  { date: '2026-05-26 14:00', register: 'Каса 1', type: 'Прихід', amount: 10000, currency: 'UAH', order: '—', class: 'type-income', sign: '+' },
  { date: '2026-05-26 16:30', register: 'Каса 2', type: 'Продаж', amount: 1200, currency: 'USD', order: 'ORD-0124', class: 'type-sale', sign: '+' },
  { date: '2026-05-26 17:00', register: 'Каса 1', type: 'Витрата', amount: 5000, currency: 'UAH', order: '—', class: 'type-expense', sign: '-' }
]

// Динамічний фільтр транзакцій
const filteredTransactions = computed(() => {
  if (currentRegister.value === 'Загальне') return allTransactions
  return allTransactions.filter(t => t.register === currentRegister.value)
})
</script>

<template>
  <div class="dashboard-view">
    <header class="dashboard-header">
      <div class="header-title-row">
        <div>
          <h1>Дашборд</h1>
          <p class="subtitle">{{ currentFormattedDate }}</p>
        </div>

        <div 
          class="global-store-selector" 
          @click="toggleStoreMenu" 
          @blur="closeStoreMenu" 
          tabindex="0"
        >
          <span class="status-dot"></span>
          <span class="selected-store-label">{{ currentRegister }}</span>
          <span class="dropdown-icon-arrow" :class="{ 'rotated': isStoreMenuOpen }">▼</span>
          
          <transition name="dropdown">
            <div v-if="isStoreMenuOpen" class="store-dropdown-menu">
              <button 
                v-for="store in stores" 
                :key="store.value" 
                class="store-option-btn"
                :class="{ 'is-active': currentRegister === store.label }"
                @click.stop="selectStore(store)"
              >
                <span class="option-txt">{{ store.label }}</span>
                <svg v-if="currentRegister === store.label" class="check-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </button>
            </div>
          </transition>
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

.global-store-selector {
  display: inline-flex;
  align-items: center;
  background: #f8fafc;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  position: relative;
  outline: none;
  user-select: none;
  transition: all 0.2s ease;
}

.global-store-selector:hover, .global-store-selector:focus-within {
  border-color: #cbd5e1;
  background: #f1f5f9;
}

.selected-store-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #334155;
  margin-right: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  background-color: #10b981;
  border-radius: 50%;
  margin-right: 8px;
}

.dropdown-icon-arrow {
  font-size: 0.6rem;
  color: #9ca3af;
  transition: transform 0.2s ease;
}

.dropdown-icon-arrow.rotated {
  transform: rotate(180deg);
}

.store-dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  width: 180px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 4px;
  z-index: 150;
}

.store-option-btn {
  width: 100%;
  text-align: left;
  padding: 10px 12px;
  background: transparent;
  border: none;
  font-size: 0.9rem;
  font-weight: 500;
  color: #4b5563;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.15s ease;
}

.store-option-btn:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.store-option-btn.is-active {
  background-color: #eff6ff;
  color: #2563eb;
  font-weight: 600;
}

.check-icon {
  color: #2563eb;
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

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>