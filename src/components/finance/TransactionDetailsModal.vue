<template>
  <BaseModal :is-open="isOpen" @close="$emit('close')" title="Деталі транзакції">
    <div v-if="tx" class="details-grid">
      <div class="detail-row"><span>Дата:</span> <b>{{ formatDate(tx.timestamp) }}</b></div>
      <div class="detail-row"><span>Каса:</span> <b>{{ getCashboxName(tx.cash_register) }}</b></div>
      <div class="detail-row"><span>Тип:</span> <b>{{ getTransactionLabel(tx) }}</b></div>
      <div class="detail-row"><span>Сума:</span> <b :class="Number(tx.amount) > 0 ? 'amt-positive' : 'amt-negative'">{{ formatCurrency(tx.amount, tx.currency || 'UAH') }}</b></div>
      <div class="detail-row" v-if="tx.order"><span>Замовлення:</span> <b>#{{ tx.order }}</b></div>
      <div class="detail-row" v-if="tx.comment"><span>Примітка:</span> <b>{{ tx.comment }}</b></div>
    </div>
  </BaseModal>
</template>

<script setup>
import BaseModal from '@/components/ui/BaseModal.vue'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { TRANSACTION_TYPE_LABELS } from '@/constants/finance'

defineProps({ isOpen: Boolean, tx: Object, getCashboxName: Function })
defineEmits(['close'])

const getTransactionLabel = (tx) => TRANSACTION_TYPE_LABELS[tx.transaction_type] || 'Транзакція'
</script>

<style scoped>
.details-grid { display: flex; flex-direction: column; gap: 12px; }
.detail-row { display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding: 8px 0; }
.amt-positive { color: #166534; }
.amt-negative { color: #b91c1c; }
</style>
