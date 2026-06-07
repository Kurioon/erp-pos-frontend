<template>
  <div class="tab-pane">
    <div v-if="financeStore.isLoading && financeStore.partialOrders.length === 0" class="text-center text-muted empty-msg">
      Завантаження замовлень...
    </div>

    <div v-else-if="financeStore.partialOrders.length === 0" class="text-center text-muted empty-msg">
      Усі замовлення повністю оплачені
    </div>

    <div v-else class="partial-orders-grid">
      <div
        v-for="order in financeStore.partialOrders"
        :key="order.id"
        class="partial-order-card shadow-premium"
        @click="openDetails(order)"
      >
        <div class="po-info">
          <span class="po-id">
            <template v-if="order.source_document?.type === 'repair'">Ремонт</template>
            <template v-else-if="order.source_document?.type === 'purchase'">Закупівля</template>
            <template v-else>Замовлення</template>
            #{{ order.source_document?.id || '?' }}
          </span>
          <span class="po-date">{{ formatDate(order.timestamp || new Date()) }}</span>
        </div>
        <div v-if="order.counterparty" class="counterparty-info mt-2 mb-2 text-primary font-medium">
          {{ order.counterparty.name }}
        </div>
        <div class="po-amounts">
          <div class="amt-row"><span>Загальна сума:</span> <strong>{{ formatCurrency(order.source_document?.total_amount, order.currency) }}</strong></div>
          <div class="amt-row text-danger"><span>Борг (залишок):</span> <strong>{{ formatCurrency(order.amount, order.currency) }}</strong></div>
        </div>

        <BaseButton
          variant="primary"
          class="prepay-btn"
          :disabled="financeStore.isSubmittingPrepay"
          @click.stop="handlePrepay(order)"
        >
          Внести {{ formatCurrency(order.amount, order.currency) }}
        </BaseButton>
      </div>
    </div>

    <PendingOrderDetailsModal
      :is-open="isDetailsOpen"
      :order="selectedOrder"
      @close="isDetailsOpen = false"
      @pay="handleModalPay"
    />

    <ConfirmModal
      :is-open="isConfirmOpen"
      title="Підтвердження оплати"
      :message="confirmMessage"
      confirmText="Внести оплату"
      @close="isConfirmOpen = false"
      @confirm="executePrepay"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useFinanceStore } from '@/stores/finance'
import { useCartStore } from '@/stores/pos'
import { formatCurrency, formatDate } from '@/utils/formatters'
import BaseButton from '@/components/ui/BaseButton.vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'
import PendingOrderDetailsModal from '@/components/finance/PendingOrderDetailsModal.vue'

const financeStore = useFinanceStore()
const cartStore = useCartStore()

const isDetailsOpen = ref(false)
const selectedOrder = ref(null)

const isConfirmOpen = ref(false)
const confirmMessage = ref('')
const orderToPay = ref(null)
const cashboxToUse = ref(null)

onMounted(() => {
  financeStore.fetchPartialOrders()
  if (cartStore.availableCashboxes.length === 0) {
    cartStore.fetchCashboxes()
  }
})

const openDetails = (order) => {
  selectedOrder.value = order
  isDetailsOpen.value = true
}

const handleModalPay = (order) => {
  isDetailsOpen.value = false
  handlePrepay(order)
}

const handlePrepay = async (order) => {
  const cashboxId = order.cash_register || cartStore.availableCashboxes[0]?.id

  if (!cashboxId) {
    window.dispatchEvent(new CustomEvent('api-error', { detail: { message: 'Не знайдено касу для оплати', type: 'error' } }))
    return
  }

  orderToPay.value = order
  cashboxToUse.value = cashboxId
  
  const docType = order.source_document?.type === 'repair' ? 'ремонт' : 
                  (order.source_document?.type === 'purchase' ? 'закупівлю' : 'замовлення');
  const docId = order.source_document?.id || '?';

  confirmMessage.value = `Ви збираєтесь внести залишок <strong>${formatCurrency(order.amount, order.currency)}</strong> за ${docType} <strong>#${docId}</strong>.<br><br>Підтвердити операцію?`
  isConfirmOpen.value = true
}

const executePrepay = async () => {
  if (orderToPay.value) {
    await financeStore.submitPrepay(orderToPay.value, orderToPay.value.amount, cashboxToUse.value)
    isConfirmOpen.value = false
    orderToPay.value = null
  }
}
</script>

<style scoped>
.empty-msg { padding: 60px; font-size: 1.1rem; }
.partial-orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}
.partial-order-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s;
}
.partial-order-card:hover {
  transform: translateY(-2px);
  border-color: #cbd5e1;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
.shadow-premium { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 20px 25px -5px rgba(0, 0, 0, 0.03); }
.po-info { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; }
.po-id { font-weight: 700; color: #0f172a; font-size: 1.05rem; }
.po-date { font-size: 0.85rem; color: #64748b; }
.po-amounts { font-size: 0.95rem; color: #334155; display: flex; flex-direction: column; gap: 8px; }
.amt-row { display: flex; justify-content: space-between; align-items: center; }
.text-danger { color: #dc2626; font-size: 1.05rem; }
.prepay-btn { width: 100%; justify-content: center; margin-top: 4px; z-index: 2; }
</style>
