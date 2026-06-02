<script setup>
import { computed } from 'vue'
import { useRepairsStore } from '@/stores/repairs'

const repairsStore = useRepairsStore()

// Отримуємо поточну касу з глобального селектора шапки (дефолтно — Загальне)
const currentRegister = computed(() => repairsStore.selectedCashRegister || 'Загальне')

// Автоматичний красивий вивід поточної дати українською мовою
const currentFormattedDate = computed(() => {
  const date = new Date()
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
  const formatted = date.toLocaleDateString('uk-UA', options)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
})

// --- МАКСИМАЛЬНО ТОЧНІ ДАНІ ДЛЯ КОЖНОЇ КАСИ (ПІД МАКЕТ) ---
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

  // Дефолтний загальний стан (Один в один як на твоїх скриншотах Фігми)
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

// Базовий журнал транзакцій для нижньої таблиці
const allTransactions = [
  { date: '2026-05-27 09:15', register: 'Каса 1', type: 'Продаж', amount: 45990, currency: 'UAH', order: 'ORD-0125', class: 'type-sale', sign: '+' },
  { date: '2026-05-27 10:30', register: 'Каса 2', type: 'Продаж', amount: 7990, currency: 'UAH', order: 'ORD-0126', class: 'type-sale', sign: '+' },
  { date: '2026-05-27 11:00', register: 'Каса 1', type: 'Повернення', amount: 3490, currency: 'UAH', order: 'ORD-0118', class: 'type-return', sign: '-' },
  { date: '2026-05-27 12:15', register: 'Каса 3', type: 'Продаж', amount: 39900, currency: 'UAH', order: 'ORD-0127', class: 'type-sale', sign: '+' },
  { date: '2026-05-26 14:00', register: 'Каса 1', type: 'Прихід', amount: 10000, currency: 'UAH', order: '—', class: 'type-income', sign: '+' },
  { date: '2026-05-26 16:30', register: 'Каса 2', type: 'Продаж', amount: 1200, currency: 'USD', order: 'ORD-0124', class: 'type-sale', sign: '+' },
  { date: '2026-05-26 17:00', register: 'Каса 1', type: 'Витрата', amount: 5000, currency: 'UAH', order: '—', class: 'type-expense', sign: '-' }
]

// Динамічний вивід транзакцій залежно від каси
const filteredTransactions = computed(() => {
  if (currentRegister.value === 'Загальне') return allTransactions
  return allTransactions.filter(t => t.register === currentRegister.value)
})
</script>

<template>
  <div class="dashboard-view">
    <header class="dashboard-header">
      <h1>Дашборд</h1>
      <p class="subtitle">{{ currentFormattedDate }} · Простір: {{ currentRegister }}</p>
    </header>

    <section class="metrics-row">
      <div class="metric-card">
        <div class="metric-info">
          <span class="metric-label">ВИРУЧКА СЬОГОДНІ</span>
          <h2 class="metric-value">{{ dashboardData.metrics.revenue.toLocaleString('uk-UA') }} ₴</h2>
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
          <h2 class="metric-value">{{ dashboardData.metrics.sales }}</h2>
        </div>
        <div class="metric-icon-box bg-green-light">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-info">
          <span class="metric-label">АКТИВНИХ РЕМОНТІВ</span>
          <h2 class="metric-value">{{ dashboardData.metrics.repairs }}</h2>
        </div>
        <div class="metric-icon-box bg-amber-light">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-info">
          <span class="metric-label">ТОВАРІВ З НИЗЬКИМ ЗАЛИШКОМ</span>
          <h2 class="metric-value text-danger-val">{{ dashboardData.metrics.lowStock }}</h2>
        </div>
        <div class="metric-icon-box bg-red-light">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        </div>
      </div>
    </section>

    <div class="main-dashboard-grid">
      <div class="dashboard-block-card chart-container-block">
        <h3>Виручка за тиждень (₴)</h3>
        <div class="pure-css-chart">
          <div class="chart-y-axis">
            <span>260k</span><span>195k</span><span>130k</span><span>65k</span><span>0k</span>
          </div>
          <div class="chart-bars-wrapper">
            <div v-for="(height, idx) in dashboardData.chart" :key="idx" class="chart-bar-column">
              <div class="bar-actual" :style="{ height: height + '%' }">
                <span class="bar-tooltip-pop">{{ (height * 2600).toLocaleString('uk-UA') }} ₴</span>
              </div>
              <span class="bar-day-label">{{ ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'][idx] }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="dashboard-block-card alerts-container-block">
        <div class="alerts-header">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          <h3>Алерти: дозамовлення</h3>
        </div>
        <div class="alerts-list">
          <div v-for="(alert, i) in dashboardData.alerts" :key="i" class="alert-item-row">
            <div class="alert-item-info">
              <p class="alert-item-name">{{ alert.name }}</p>
              <span class="alert-item-sku">{{ alert.sku }}</span>
            </div>
            <span class="alert-ratio-badge" :class="{ 'is-critical': alert.critical }">
              {{ alert.val }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <section class="dashboard-block-card table-section-block">
      <h3>Останні транзакції</h3>
      <div class="table-scroll-wrapper">
        <table class="recent-tx-table">
          <thead>
            <tr>
              <th>ДАТА</th>
              <th>КАСА</th>
              <th>ТИП</th>
              <th class="text-right">СУМА</th>
              <th>ЗАМОВЛЕННЯ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(tx, idx) in filteredTransactions" :key="idx" class="tx-row">
              <td class="text-muted font-medium">{{ tx.date }}</td>
              <td class="font-bold text-dark">{{ tx.register }}</td>
              <td>
                <span class="type-badge" :class="tx.class">{{ tx.type }}</span>
              </td>
              <td class="text-right font-bold text-price" :class="tx.sign === '+' ? 'amt-plus' : 'amt-minus'">
                {{ tx.sign }}{{ Math.abs(tx.amount).toLocaleString('uk-UA') }} {{ tx.currency }}
              </td>
              <td class="font-medium" :class="tx.order !== '—' ? 'text-link-order' : 'text-muted'">
                {{ tx.order }}
              </td>
            </tr>
            <tr v-if="filteredTransactions.length === 0">
              <td colspan="5" class="text-center text-muted empty-msg">
                Немає нещодавніх транзакцій для простору "{{ currentRegister }}"
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
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

/* --- КАРТКИ МЕТРИК --- */
.metrics-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

@media (max-width: 1024px) {
  .metrics-row { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .metrics-row { grid-template-columns: 1fr; }
}

.metric-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
}

.metric-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: 0.05em;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.02em;
}

.text-danger-val { color: #ef4444; }

.metric-icon-box {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-blue-light { background-color: #eff6ff; }
.bg-green-light { background-color: #ecfdf5; }
.bg-amber-light { background-color: #fffbeb; }
.bg-red-light { background-color: #fef2f2; }

/* --- ГОЛОВНИЙ ГРІД ДАШБОРДУ --- */
.main-dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

@media (max-width: 1024px) {
  .main-dashboard-grid { grid-template-columns: 1fr; }
}

.dashboard-block-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.01), 0 20px 25px -5px rgba(0,0,0,0.02);
}

.dashboard-block-card h3 {
  font-size: 1rem;
  color: #0f172a;
  margin: 0 0 20px 0;
  font-weight: 700;
}

/* --- ЧИСТИЙ ПРЕМІУМ ГРАФІК НА CSS --- */
.pure-css-chart {
  display: flex;
  gap: 16px;
  height: 220px;
  position: relative;
  padding-top: 10px;
}

.chart-y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 190px;
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 600;
  text-align: right;
  width: 35px;
}

.chart-bars-wrapper {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 190px;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 10px;
}

.chart-bar-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  height: 100%;
  justify-content: flex-end;
  position: relative;
}

.bar-actual {
  width: 32px;
  background-color: #2563eb;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  position: relative;
  transition: height 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  cursor: pointer;
}

.bar-actual:hover {
  background-color: #1d4ed8;
}

.bar-tooltip-pop {
  position: absolute;
  top: -36px;
  left: 50%;
  transform: translateX(-50%) scale(0.9);
  background: #0f172a;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: all 0.15s ease;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.bar-actual:hover .bar-tooltip-pop {
  opacity: 1;
  transform: translateX(-50%) scale(1);
}

.bar-day-label {
  position: absolute;
  bottom: -24px;
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 600;
}

/* --- БЛОК АЛЕРТІВ ДОЗАМОВЛЕНЬ --- */
.alerts-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 12px;
}

.alerts-header h3 { margin: 0 !important; }

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alert-item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid #f8fafc;
}
.alert-item-row:last-child { border-bottom: none; }

.alert-item-name {
  margin: 0 0 2px 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: #1e293b;
}

.alert-item-sku {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 500;
}

.alert-ratio-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  background-color: #fef3c7;
  color: #d97706;
}

.alert-ratio-badge.is-critical {
  background-color: #fee2e2;
  color: #ef4444;
}
.table-section-block { margin-top: 8px; }
.table-scroll-wrapper { overflow-x: auto; }

.recent-tx-table {
  width: 100%;
  border-collapse: collapse;
}

.recent-tx-table th {
  padding: 12px 16px;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
  background-color: #f8fafc;
  letter-spacing: 0.05em;
}

.recent-tx-table td {
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.9rem;
  color: #334155;
  vertical-align: middle;
}

.tx-row { transition: background-color 0.15s; }
.tx-row:hover { background-color: #f8fafc; }
.recent-tx-table tr:last-child td { border-bottom: none; }

.type-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-block;
}

.type-sale { background-color: #dcfce7; color: #166534; }
.type-return { background-color: #fef2f2; color: #991b1b; }
.type-income { background-color: #eff6ff; color: #1e40af; }
.type-expense { background-color: #fff9db; color: #b45309; }

.text-price { font-size: 0.95rem; }
.amt-plus { color: #166534; }
.amt-minus { color: #b91c1c; }

.text-link-order { color: #2563eb; font-weight: 600; }
.empty-msg { padding: 32px !important; }

.text-muted { color: #94a3b8; }
.text-dark { color: #0f172a; }
.font-medium { font-weight: 500; }
.font-bold { font-weight: 600; }
.text-right { text-align: right; }
.text-center { text-align: center; }
</style>