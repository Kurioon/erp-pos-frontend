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
          variant="secondary"
          :class="{ 'active-pill': selectedType === TRANSACTION_TYPES.INCOME }"
          @click="selectedType = TRANSACTION_TYPES.INCOME"
        >
          Доходи
        </BaseButton>
        <BaseButton
          variant="secondary"
          :class="{ 'active-pill': selectedType === TRANSACTION_TYPES.EXPENSE }"
          @click="selectedType = TRANSACTION_TYPES.EXPENSE"
        >
          Витрати
        </BaseButton>
      </div>

      <div class="right-actions">
        <div class="cashbox-filter-wrapper">
          <BaseSelect
            v-model="selectedCashboxId"
            :options="cashboxOptions"
            placeholder="Оберіть касу"
          />
        </div>

        <BaseButton
          variant="primary"
          @click="financeStore.exportCsv"
          :disabled="financeStore.isLoading"
        >
          <span v-if="financeStore.isLoading">Завантаження...</span>
          <span v-else>Експорт CSV</span>
        </BaseButton>
      </div>
    </div>

    <div v-if="financeStore.isLoading && financeStore.transactions.length === 0" class="text-center text-muted empty-table-msg">
      Завантаження транзакцій...
    </div>

    <div v-else class="table-container shadow-premium">
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
            <td class="text-muted font-medium">{{ formatDate(tx.timestamp || new Date()) }}</td>

            <td class="font-bold text-dark">{{ getCashboxName(tx.cash_register) }}</td>
            <td>
              <BaseStatusBadge
                :label="Number(tx.amount) > 0 ? TRANSACTION_TYPE_LABELS[TRANSACTION_TYPES.INCOME] : TRANSACTION_TYPE_LABELS[TRANSACTION_TYPES.EXPENSE]"
                :class="Number(tx.amount) > 0 ? TRANSACTION_TYPE_CLASSES[TRANSACTION_TYPES.INCOME] : TRANSACTION_TYPE_CLASSES[TRANSACTION_TYPES.EXPENSE]"
              />
            </td>
            <td class="text-right font-bold text-amount" :class="Number(tx.amount) > 0 ? 'amt-positive' : 'amt-negative'">
              {{ Number(tx.amount) > 0 ? '+' : '' }}{{ formatCurrency(tx.amount, tx.currency || 'UAH') }}
            </td>
            <td class="font-medium" :class="tx.order ? 'text-order-id' : 'text-muted'">
              {{ tx.order || '—' }}
            </td>
          </tr>
          <tr v-if="filteredTransactions.length === 0">
            <td colspan="5" class="text-center text-muted empty-table-msg">
              Немає транзакцій за обраними фільтрами
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFinanceStore } from '@/stores/finance'
import { useCartStore } from '@/stores/pos'
import { TRANSACTION_TYPES, TRANSACTION_TYPE_LABELS, TRANSACTION_TYPE_CLASSES } from '@/constants/finance'
import { formatCurrency, formatDate } from '@/utils/formatters'

import BaseButton from '@/components/ui/BaseButton.vue'
import BaseStatusBadge from '@/components/ui/BaseStatusBadge.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'

const financeStore = useFinanceStore()
const cartStore = useCartStore()

const selectedType = ref('all')
const selectedCashboxId = ref('all')

onMounted(() => {
  financeStore.fetchTransactions()
  if (cartStore.availableCashboxes.length === 0) {
    cartStore.fetchCashboxes()
  }
})

const cashboxOptions = computed(() => {
  const options = [{ value: 'all', label: 'Всі каси' }]
  cartStore.availableCashboxes.forEach(box => {
    options.push({ value: box.id, label: box.name })
  })
  return options
})

const getCashboxName = (id) => {
  if (!id) return '—'
  const box = cartStore.availableCashboxes.find(b => b.id === id)
  return box ? box.name : `Каса #${id}`
}

const filteredTransactions = computed(() => {
  return financeStore.transactions.filter(t => {
    let matchesType = true;

    if (selectedType.value === TRANSACTION_TYPES.INCOME) {
      matchesType = Number(t.amount) > 0;
    } else if (selectedType.value === TRANSACTION_TYPES.EXPENSE) {
      matchesType = Number(t.amount) < 0;
    }

    const matchesCashbox = selectedCashboxId.value === 'all' || String(t.cash_register) === String(selectedCashboxId.value)

    return matchesType && matchesCashbox
  })
})
</script>

<style scoped>
.filters-container { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
.filter-group-pills { display: flex; gap: 8px; }
.active-pill { background-color: #2563eb !important; color: #ffffff !important; }

.right-actions { display: flex; align-items: center; gap: 12px; }
.cashbox-filter-wrapper { width: 220px; }

.table-container { border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: white; }
.shadow-premium { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 20px 25px -5px rgba(0, 0, 0, 0.03); }
.finance-table { width: 100%; border-collapse: collapse; }
.finance-table th { background-color: #f8fafc; padding: 16px; color: #64748b; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; text-align: left; border-bottom: 1px solid #e2e8f0; letter-spacing: 0.05em; }
.finance-table td { padding: 16px; border-bottom: 1px solid #e2e8f0; font-size: 0.95rem; vertical-align: middle; color: #334155; }
.table-row-hover:hover { background-color: #f8fafc; transition: background-color 0.15s; }
.finance-table tr:last-child td { border-bottom: none; }

:deep(.type-income) { background-color: #dcfce7; color: #166534; }
:deep(.type-expense) { background-color: #fef2f2; color: #991b1b; }

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
