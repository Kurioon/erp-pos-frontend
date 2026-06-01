<script setup>
import { ref, computed } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { TRANSACTION_TYPES, TRANSACTION_TYPE_LABELS, TRANSACTION_TYPE_CLASSES } from '@/constants/finance'


import { useRepairsStore } from '@/stores/repairs'

const repairsStore = useRepairsStore()
const activeTab = ref('journal')

// Активний фільтр типу операції (Всі, Продаж, Витрата...)
const selectedType = ref('all') 

// Дані активних кас (Екран 2)
const cashRegisters = ref([
  { id: 1, name: 'Каса 1', balance: 125400, currency: 'UAH' },
  { id: 2, name: 'Каса 2', balance: 3200, currency: 'USD' },
  { id: 3, name: 'Каса 3', balance: 78900, currency: 'UAH' }
])

// Курси валют (Екран 2)
const currencyRates = ref({
  usd: 41.5,
  eur: 45.2
})

// Мокові дані журналу транзакцій
const transactions = ref([
  { id: 1, date: '2026-05-27 09:15', register: 'Каса 1', type: TRANSACTION_TYPES.SALE, amount: 45990, currency: 'UAH', orderId: 'ORD-0125' },
  { id: 2, date: '2026-05-27 10:30', register: 'Каса 2', type: TRANSACTION_TYPES.SALE, amount: 7990, currency: 'UAH', orderId: 'ORD-0126' },
  { id: 3, date: '2026-05-27 11:00', register: 'Каса 1', type: TRANSACTION_TYPES.RETURN, amount: -3490, currency: 'UAH', orderId: 'ORD-0118' },
  { id: 4, date: '2026-05-27 12:15', register: 'Каса 3', type: TRANSACTION_TYPES.SALE, amount: 39900, currency: 'UAH', orderId: 'ORD-0127' },
  { id: 5, date: '2026-05-26 14:00', register: 'Каса 1', type: TRANSACTION_TYPES.INCOME, amount: 10000, currency: 'UAH', orderId: '—' },
  { id: 6, date: '2026-05-26 16:30', register: 'Каса 2', type: TRANSACTION_TYPES.SALE, amount: 1200, currency: 'USD', orderId: 'ORD-0124' },
  { id: 7, date: '2026-05-26 17:00', register: 'Каса 1', type: TRANSACTION_TYPES.EXPENSE, amount: -5000, currency: 'UAH', orderId: '—' },
  { id: 8, date: '2026-05-25 09:00', register: 'Каса 3', type: TRANSACTION_TYPES.SALE, amount: 54990, currency: 'UAH', orderId: 'ORD-0123' },
  { id: 9, date: '2026-05-25 11:20', register: 'Каса 2', type: TRANSACTION_TYPES.SALE, amount: 23990, currency: 'UAH', orderId: 'ORD-0122' }
])

// --- ЕБЕЙША ПОДВІЙНА ФІЛЬТРАЦІЯ (ТИП + ГЛОБАЛЬНА КАСА) ---
const filteredTransactions = computed(() => {
  return transactions.value.filter(t => {
    // 1. Перевірка внутрішнього фільтра (кнопки-пігулки: Продаж, Витрата...)
    const matchesType = selectedType.value === 'all' || t.type === selectedType.value
    
    // 2. Перевірка глобального фільтра з AppHeader (беремо зі стору)
    // Якщо в сторі нічого немає або вибрано "Загальне", показуємо всі каси
    const globalRegister = repairsStore.selectedCashRegister || 'Загальне'
    const matchesGlobalRegister = globalRegister === 'Загальне' || t.register === globalRegister
    
    return matchesType && matchesGlobalRegister
  })
})

const formatAmount = (tx) => {
  const formatted = Math.abs(tx.amount).toLocaleString('uk-UA')
  return tx.amount > 0 ? `+${formatted}` : `-${formatted}`
}

const handleSaveRates = () => {
  console.log('Курси валют успішно оновлено:', currencyRates.value)
  alert('Курси валют успішно збережено в системі!')
}

const handleAddCashRegister = () => {
  const nextId = cashRegisters.value.length + 1
  cashRegisters.value.push({
    id: nextId,
    name: `Каса ${nextId}`,
    balance: 0,
    currency: 'UAH'
  })
}
</script>

<template>
  <div class="finance-view">
    <header class="page-header">
      <div class="header-info">
        <h1>Фінанси</h1>
        <p class="subtitle">Касова дисципліна та управління касами</p>
      </div>
    </header>

    <div class="tabs-navigation">
      <button 
        class="tab-link" 
        :class="{ 'is-active': activeTab === 'journal' }"
        @click="activeTab = 'journal'"
      >
        Журнал транзакцій
      </button>
      <button 
        class="tab-link" 
        :class="{ 'is-active': activeTab === 'management' }"
        @click="activeTab = 'management'"
      >
        Керування касами
      </button>
    </div>

    <div class="tab-content-wrapper">
      <transition name="fade-slide" mode="out-in">
        
        <!-- ТАБ 1: ЖУРНАЛ ТРАНЗАКЦІЙ -->
        <div v-if="activeTab === 'journal'" key="journal" class="tab-pane">
          
          <div class="filters-container">
            <div class="filter-group-pills">
              <button 
                class="pill-btn" 
                :class="{ 'active': selectedType === 'all' }"
                @click="selectedType = 'all'"
              >
                Всі
              </button>
              <button 
                v-for="(label, value) in TRANSACTION_TYPE_LABELS" 
                :key="value"
                class="pill-btn"
                :class="{ 'active': selectedType === value }"
                @click="selectedType = value"
              >
                {{ label }}
              </button>
            </div>

            <!-- Невеличкий бейдж-підказка, яка каса зараз активна -->
            <span class="active-global-register-badge">
              Фільтр: {{ repairsStore.selectedCashRegister || 'Загальне' }}
            </span>
          </div>

          <div class="table-container shadow-premium">
            <table class="finance-table">
              <thead>
                <tr>
                  <th>ДАТА</th>
                  <th>КАСА</th>
                  <th>ТИП</th>
                  <th class="text-right">СУМА</th>
                  <th style="width: 100px;" class="text-center">ВАЛЮТА</th>
                  <th>ID ЗАМОВЛЕННЯ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="tx in filteredTransactions" :key="tx.id" class="table-row-hover">
                  <td class="text-muted font-medium">{{ tx.date }}</td>
                  <td class="font-bold text-dark">{{ tx.register }}</td>
                  <td>
                    <span class="type-badge" :class="TRANSACTION_TYPE_CLASSES[tx.type]">
                      {{ TRANSACTION_TYPE_LABELS[tx.type] }}
                    </span>
                  </td>
                  <td class="text-right font-bold text-amount" :class="tx.amount > 0 ? 'amt-positive' : 'amt-negative'">
                    {{ formatAmount(tx) }}
                  </td>
                  <td class="text-center">
                    <span class="currency-badge">{{ tx.currency }}</span>
                  </td>
                  <td class="font-medium" :class="tx.orderId !== '—' ? 'text-order-id' : 'text-muted'">
                    {{ tx.orderId }}
                  </td>
                </tr>
                <tr v-if="filteredTransactions.length === 0">
                  <td colspan="6" class="text-center text-muted empty-table-msg">
                    Немає транзакцій для каси "{{ repairsStore.selectedCashRegister || 'Загальне' }}" з таким типом
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ТАБ 2: КЕРУВАННЯ КАСАМИ -->
        <div v-else key="management" class="tab-pane">
          <section class="management-section">
            <div class="section-header">
              <h2>Активні каси</h2>
              <BaseButton @click="handleAddCashRegister" class="btn-add-register">+ Додати касу</BaseButton>
            </div>

            <div class="registers-grid">
              <div v-for="reg in cashRegisters" :key="reg.id" class="register-card shadow-premium">
                <div class="card-top-row">
                  <span class="register-dot-indicator"></span>
                  <span class="register-card-title">{{ reg.name }}</span>
                </div>
                <div class="register-balance-display">
                  <span class="balance-value">{{ reg.balance.toLocaleString('uk-UA') }}</span>
                  <span class="balance-currency-label">{{ reg.currency }}</span>
                </div>
                <p class="balance-sub-label">Поточний баланс</p>
              </div>
            </div>
          </section>

          <section class="management-section rate-section-spacing">
            <div class="section-header-simple">
              <div class="header-with-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                <h2>Курси валют</h2>
              </div>
            </div>

            <div class="rates-control-card shadow-premium">
              <div class="rates-inputs-row">
                <div class="rate-input-group field-disabled">
                  <label class="rate-field-label">UAH (база)</label>
                  <div class="rate-input-wrapper">
                    <input type="text" value="1.00" disabled class="form-rate-input" />
                  </div>
                </div>

                <div class="rate-input-group">
                  <label class="rate-field-label">USD → UAH</label>
                  <div class="rate-input-wrapper">
                    <input type="number" step="0.1" v-model.number="currencyRates.usd" class="form-rate-input focus-blue" />
                  </div>
                </div>

                <div class="rate-input-group">
                  <label class="rate-field-label">EUR → UAH</label>
                  <div class="rate-input-wrapper">
                    <input type="number" step="0.1" v-model.number="currencyRates.eur" class="form-rate-input focus-blue" />
                  </div>
                </div>
              </div>

              <div class="rates-footer-actions">
                <button class="btn-save-rates" @click="handleSaveRates">Зберегти курси</button>
                <p class="rates-info-subtext">
                  Курси використовуються для конвертації при мультивалютних операціях
                </p>
              </div>
            </div>
          </section>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.finance-view {
  padding: 32px;
  background-color: #ffffff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.page-header {
  margin-bottom: 24px;
}

.header-info h1 {
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

.tabs-navigation {
  display: flex;
  gap: 28px;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 28px;
}

.tab-link {
  background: transparent;
  border: none;
  padding: 0 0 12px 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  position: relative;
  transition: color 0.15s ease;
}

.tab-link:hover { color: #0f172a; }
.tab-link.is-active { color: #2563eb; }

.tab-link.is-active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #2563eb;
  border-radius: 2px;
}

.tab-content-wrapper {
  flex: 1;
}

.filters-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.filter-group-pills {
  display: flex;
  gap: 8px;
}

.pill-btn {
  background-color: #f1f5f9;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  transition: all 0.15s ease;
}

.pill-btn:hover {
  background-color: #e2e8f0;
}

.pill-btn.active {
  background-color: #2563eb;
  color: #ffffff;
}

/* Красивий бейдж з назвою поточної каси */
.active-global-register-badge {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #475569;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
}

.table-container {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  background: white;
}

.shadow-premium {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01), 0 20px 25px -5px rgba(0, 0, 0, 0.03);
}

.finance-table {
  width: 100%;
  border-collapse: collapse;
}

.finance-table th {
  background-color: #f8fafc;
  padding: 16px;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
  letter-spacing: 0.05em;
}

.finance-table td {
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.95rem;
  vertical-align: middle;
  color: #334155;
}

.table-row-hover {
  transition: background-color 0.15s;
}

.table-row-hover:hover {
  background-color: #f8fafc;
}

.finance-table tr:last-child td {
  border-bottom: none;
}

.type-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-block;
}

.type-sale { background-color: #dcfce7; color: #166534; }
.type-return { background-color: #fef2f2; color: #991b1b; }
.type-income { background-color: #eff6ff; color: #1e40af; }
.type-expense { background-color: #fff9db; color: #b45309; }

.text-amount {
  font-size: 1rem;
  letter-spacing: -0.01em;
}

.amt-positive { color: #166534; }
.amt-negative { color: #b91c1c; }

.currency-badge {
  background-color: #f1f5f9;
  color: #64748b;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
}

.text-order-id {
  color: #2563eb;
  font-weight: 600;
}

.empty-table-msg {
  padding: 40px !important;
  font-size: 0.95rem;
}

.management-section {
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2, .section-header-simple h2 {
  font-size: 1.15rem;
  color: #0f172a;
  margin: 0;
  font-weight: 700;
}

.btn-add-register {
  background-color: #2563eb;
  color: white;
  padding: 8px 16px;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 8px;
}

.registers-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

@media (max-width: 768px) {
  .registers-grid {
    grid-template-columns: 1fr;
  }
}

.register-card {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.card-top-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.register-dot-indicator {
  width: 8px;
  height: 8px;
  background-color: #10b981;
  border-radius: 50%;
}

.register-card-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #334155;
}

.register-balance-display {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 4px;
}

.balance-value {
  font-size: 1.65rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.02em;
}

.balance-currency-label {
  font-size: 0.95rem;
  font-weight: 700;
  color: #475569;
}

.balance-sub-label {
  margin: 0;
  font-size: 0.8rem;
  color: #94a3b8;
  font-weight: 500;
}

.rate-section-spacing {
  margin-top: 36px;
}

.section-header-simple {
  margin-bottom: 16px;
}

.header-with-icon {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rates-control-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
}

.rates-inputs-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .rates-inputs-row {
    grid-template-columns: 1fr;
  }
}

.rate-input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rate-field-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
}

.form-rate-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #1e293b;
  font-weight: 600;
  outline: none;
  background-color: #f8fafc;
}

.field-disabled .form-rate-input {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #f1f5f9;
}

.focus-blue:focus {
  border-color: #2563eb;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
}

.rates-footer-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn-save-rates {
  background-color: #2563eb;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-save-rates:hover {
  background-color: #1d4ed8;
}

.rates-info-subtext {
  margin: 0;
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(12px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}

.text-muted { color: #94a3b8; }
.text-dark { color: #0f172a; }
.font-medium { font-weight: 500; }
.font-bold { font-weight: 600; }
</style>