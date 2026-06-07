<template>
  <BaseModal :is-open="isOpen" @close="$emit('close')" title="Деталі неоплаченого замовлення">
    <div v-if="order" class="details-grid">
      <div class="detail-row">
        <span>Номер замовлення:</span>
        <b>#{{ order.id }}</b>
      </div>
      <div class="detail-row">
        <span>Дата створення:</span>
        <b>{{ formatDate(order.created_at || new Date()) }}</b>
      </div>
      <div class="detail-row">
        <span>Загальна сума чеку:</span>
        <b>{{ formatCurrency(order.total_amount, order.currency) }}</b>
      </div>
      <div class="detail-row">
        <span>Вже сплачено:</span>
        <b class="amt-positive">{{ formatCurrency(Number(order.total_amount) - Number(order.balance_due), order.currency) }}</b>
      </div>
      <div class="detail-row highlight-row">
        <span>Залишок до сплати (Борг):</span>
        <b class="amt-negative">{{ formatCurrency(order.balance_due, order.currency) }}</b>
      </div>
      <div class="modal-actions" v-if="order.balance_due > 0">
        <BaseButton variant="primary" @click="$emit('pay', order)" style="width: 100%; margin-top: 10px;">Оплатити борг</BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { formatCurrency, formatDate } from '@/utils/formatters'

defineProps({
  isOpen: Boolean,
  order: Object
})
defineEmits(['close', 'pay'])
</script>

<style scoped>
.details-grid { display: flex; flex-direction: column; gap: 12px; }
.detail-row { display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding: 8px 0; font-size: 0.95rem; }
.highlight-row { background-color: #fef2f2; padding: 12px 8px; border-radius: 6px; border-bottom: none; margin-top: 8px; }
.amt-positive { color: #166534; }
.amt-negative { color: #b91c1c; font-size: 1.1rem; }
</style>
