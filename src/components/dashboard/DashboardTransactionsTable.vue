<template>
  <section class="dashboard-block-card table-section-block">
    <h3>Останні транзакції</h3>

    <div class="table-container mobile-table-wrapper">
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
          <tr
            v-for="(tx, idx) in props.transactions"
            :key="idx"
            class="tx-row cursor-pointer"
            @click="openDetails(tx)"
          >
            <td class="text-muted font-medium">{{ formatDate(tx.date) }}</td>
            <td class="font-bold text-dark">{{ tx.register }}</td>
            <td>
              <span class="type-badge" :class="tx.class">{{ tx.type }}</span>
            </td>
            <td class="text-right font-bold text-price" :class="tx.sign === '+' ? 'amt-plus' : 'amt-minus'">
              {{ tx.sign }}{{ formatCurrency(Math.abs(tx.amount), tx.currency) }}
            </td>
            <td class="font-medium" :class="tx.order !== '—' ? 'text-link-order' : 'text-muted'">
              {{ tx.order }}
            </td>
          </tr>
          <tr v-if="props.transactions.length === 0">
            <td colspan="5" class="text-center text-muted empty-msg">
              Немає нещодавніх транзакцій для простору "{{ props.currentRegister }}"
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <TransactionDetailsModal
      v-if="isDetailsOpen"
      :is-open="isDetailsOpen"
      :tx="selectedTx"
      :get-cashbox-name="() => selectedTxRegisterName"
      @close="isDetailsOpen = false"
    />
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { formatCurrency } from '@/utils/formatters'
import TransactionDetailsModal from '@/components/finance/TransactionDetailsModal.vue'

const props = defineProps({
  transactions: { type: Array, required: true },
  currentRegister: { type: String, default: 'Загальне' }
})

const isDetailsOpen = ref(false)
const selectedTx = ref(null)
const selectedTxRegisterName = ref('')

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const openDetails = (tx) => {
  selectedTx.value = tx.raw || {
    transaction_type: tx.type === 'Прихід' ? 'income' : 'expense',
    amount: tx.amount,
    currency: tx.currency,
    timestamp: tx.date,
    order: tx.order !== '—' ? tx.order.replace('ORD-', '') : null
  }
  selectedTxRegisterName.value = tx.register
  isDetailsOpen.value = true
}
</script>

<style scoped>
.dashboard-block-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.01), 0 20px 25px -5px rgba(0,0,0,0.02); }
.dashboard-block-card h3 { font-size: 1.1rem; color: #0f172a; margin: 0 0 20px 0; font-weight: 700; }
.table-section-block { margin-top: 8px; }

.table-container { border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
.mobile-table-wrapper { width: 100%; display: block; overflow-x: auto; -webkit-overflow-scrolling: touch; }

.recent-tx-table { width: 100%; border-collapse: collapse; min-width: 600px; }
.recent-tx-table th { padding: 14px 16px; color: #64748b; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; text-align: left; border-bottom: 1px solid #e2e8f0; background-color: #f8fafc; letter-spacing: 0.05em; }
.recent-tx-table td { padding: 16px; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; color: #334155; vertical-align: middle; }

.cursor-pointer { cursor: pointer; }
.tx-row { transition: background-color 0.15s ease; }
.tx-row:hover { background-color: #f8fafc; }

.tx-row:hover .text-muted, .tx-row:active .text-muted,
.tx-row:hover .text-dark, .tx-row:active .text-dark,
.tx-row:hover .text-price, .tx-row:active .text-price,
.tx-row:hover .text-link-order, .tx-row:active .text-link-order {
  color: #2563eb !important;
  transition: color 0.15s ease;
}

.recent-tx-table tr:last-child td { border-bottom: none; }

.type-badge { padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; display: inline-block; }
.type-income { background-color: #dcfce7; color: #166534; border: 1px solid #bbf7d0;}
.type-expense { background-color: #fef2f2; color: #991b1b; border: 1px solid #fecaca;}

.text-price { font-size: 0.95rem; }
.amt-plus { color: #166534; }
.amt-minus { color: #b91c1c; }
.text-link-order { color: #2563eb; font-weight: 600; }
.empty-msg { padding: 40px !important; }
.text-muted { color: #94a3b8; }
.text-dark { color: #0f172a; }
.font-medium { font-weight: 500; }
.font-bold { font-weight: 600; }
.text-right { text-align: right; }
.text-center { text-align: center; }
</style>
