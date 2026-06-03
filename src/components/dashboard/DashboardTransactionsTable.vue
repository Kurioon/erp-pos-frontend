<script setup>
import { formatCurrency, formatDate } from '@/utils/formatters'

const props = defineProps({
  transactions: { type: Array, required: true },
  currentRegister: { type: String, default: 'Загальне' }
})
</script>

<template>
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
          <tr v-for="(tx, idx) in props.transactions" :key="idx" class="tx-row">
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
  </section>
</template>

<style scoped>
.dashboard-block-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.01), 0 20px 25px -5px rgba(0,0,0,0.02); }
.dashboard-block-card h3 { font-size: 1rem; color: #0f172a; margin: 0 0 20px 0; font-weight: 700; }
.table-section-block { margin-top: 8px; }
.table-scroll-wrapper { overflow-x: auto; }
.recent-tx-table { width: 100%; border-collapse: collapse; }
.recent-tx-table th { padding: 12px 16px; color: #64748b; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; text-align: left; border-bottom: 1px solid #e2e8f0; background-color: #f8fafc; letter-spacing: 0.05em; }
.recent-tx-table td { padding: 16px; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; color: #334155; vertical-align: middle; }
.tx-row { transition: background-color 0.15s; }
.tx-row:hover { background-color: #f8fafc; }
.recent-tx-table tr:last-child td { border-bottom: none; }
.type-badge { padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; display: inline-block; }
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