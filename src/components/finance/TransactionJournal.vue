<template>
  <div class="tab-pane">
    <div class="filters-container">
      <div class="filter-group-pills">
        <BaseButton 
          variant="secondary"
          :class="{ 'active-pill': selectedType === 'all' }"
          @click="selectedType = 'all'"
        >
          Всі
        </BaseButton>
        <BaseButton 
          v-for="(label, value) in TRANSACTION_TYPE_LABELS" 
          :key="value"
          variant="secondary"
          :class="{ 'active-pill': selectedType === value }"
          @click="selectedType = value"
        >
          {{ label }}
        </BaseButton>
      </div>
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
            <th>ID ЗАМОВЛЕННЯ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tx in filteredTransactions" :key="tx.id" class="table-row-hover">
            <td class="text-muted font-medium">{{ formatDate(tx.date) }}</td>
            <td class="font-bold text-dark">{{ tx.register }}</td>
            <td>
              <BaseStatusBadge 
                :label="TRANSACTION_TYPE_LABELS[tx.type]" 
                :class="TRANSACTION_TYPE_CLASSES[tx.type]" 
              />
            </td>
            <td class="text-right font-bold text-amount" :class="tx.amount > 0 ? 'amt-positive' : 'amt-negative'">
              {{ tx.amount > 0 ? '+' : '' }}{{ formatCurrency(tx.amount, tx.currency) }}
            </td>
            <td class="font-medium" :class="tx.orderId !== '—' ? 'text-order-id' : 'text-muted'">
              {{ tx.orderId }}
            </td>
          </tr>
          <tr v-if="filteredTransactions.length === 0">
            <td colspan="5" class="text-center text-muted empty-table-msg">
              Немає транзакцій для каси "{{ repairsStore.selectedCashRegister || 'Загальне' }}"
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFinanceStore } from '@/stores/finance'
import { useRepairsStore } from '@/stores/repairs'
import { TRANSACTION_TYPE_LABELS, TRANSACTION_TYPE_CLASSES } from '@/constants/finance'
import { formatCurrency, formatDate } from '@/utils/formatters' 


import BaseButton from '@/components/ui/BaseButton.vue'
import BaseStatusBadge from '@/components/ui/BaseStatusBadge.vue'

const financeStore = useFinanceStore()
const repairsStore = useRepairsStore()

const selectedType = ref('all') 

const filteredTransactions = computed(() => {
  return financeStore.transactions.filter(t => {
    const matchesType = selectedType.value === 'all' || t.type === selectedType.value
    const globalRegister = repairsStore.selectedCashRegister || 'Загальне'
    const matchesGlobalRegister = globalRegister === 'Загальне' || t.register === globalRegister
    
    return matchesType && matchesGlobalRegister
  })
})
</script>

<style scoped>
.filters-container { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
.filter-group-pills { display: flex; gap: 8px; }
.active-pill { background-color: #2563eb !important; color: #ffffff !important; }
.active-global-register-badge { background-color: #f8fafc; border: 1px solid #e2e8f0; color: #475569; padding: 6px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; }
.table-container { border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: white; }
.shadow-premium { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 20px 25px -5px rgba(0, 0, 0, 0.03); }
.finance-table { width: 100%; border-collapse: collapse; }
.finance-table th { background-color: #f8fafc; padding: 16px; color: #64748b; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; text-align: left; border-bottom: 1px solid #e2e8f0; letter-spacing: 0.05em; }
.finance-table td { padding: 16px; border-bottom: 1px solid #e2e8f0; font-size: 0.95rem; vertical-align: middle; color: #334155; }
.table-row-hover:hover { background-color: #f8fafc; transition: background-color 0.15s; }
.finance-table tr:last-child td { border-bottom: none; }


.type-sale { background-color: #dcfce7; color: #166534; }
.type-return { background-color: #fef2f2; color: #991b1b; }
.type-income { background-color: #eff6ff; color: #1e40af; }
.type-expense { background-color: #fff9db; color: #b45309; }

.text-amount { font-size: 1rem; letter-spacing: -0.01em; }
.amt-positive { color: #166534; }
.amt-negative { color: #b91c1c; }
.text-order-id { color: #2563eb; font-weight: 600; }
.empty-table-msg { padding: 40px !important; font-size: 0.95rem; }
.text-muted { color: #94a3b8; }
.text-dark { color: #0f172a; }
.font-medium { font-weight: 500; }
.font-bold { font-weight: 600; }
.text-right { text-align: right; }
.text-center { text-align: center; }
</style>