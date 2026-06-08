<template>
  <BaseModal :is-open="isOpen" @close="$emit('close')" title="Деталі транзакції">
    <div v-if="tx" class="details-grid">
      <div class="detail-row"><span>Дата:</span> <b>{{ formatDate(tx.timestamp) }}</b></div>
      <div class="detail-row"><span>Каса:</span> <b>{{ getCashboxName(tx.cash_register) }}</b></div>
      <div class="detail-row"><span>Тип:</span> <b>{{ getTransactionLabel(tx) }}</b></div>
      <div class="detail-row"><span>Сума:</span> <b :class="Number(tx.amount) > 0 ? 'amt-positive' : 'amt-negative'">{{ formatCurrency(tx.amount, tx.currency || 'UAH') }}</b></div>
      
      <div class="detail-row" v-if="tx.source_document">
        <span>Документ-джерело:</span>
        <b>
          <template v-if="tx.source_document.type === 'repair'">Ремонт</template>
          <template v-else-if="tx.source_document.type === 'purchase'">Закупівля</template>
          <template v-else>Замовлення</template>
          #{{ tx.source_document.id }}
        </b>
      </div>
      <div class="detail-row" v-else-if="tx.order">
        <span>Замовлення:</span> <b>#{{ tx.order }}</b>
      </div>

      <div class="detail-row" v-if="tx.counterparty">
        <span>Боржник/Контрагент:</span> 
        <a href="#" @click.prevent="openCounterpartyDrawer(tx.counterparty.id)" class="text-link font-bold">
          {{ tx.counterparty.name }}
        </a>
      </div>

      <div class="detail-row" v-if="tx.comment"><span>Примітка:</span> <b>{{ tx.comment }}</b></div>

      <div v-if="orderData && orderData.items && orderData.items.length > 0" class="items-section">
        <p class="section-title">Позиції в документі:</p>
        <table class="items-table">
          <tbody>
            <tr v-for="(item, idx) in orderData.items" :key="idx">
              <td>
                <a href="#" @click.prevent="openProductDrawer(item)" class="text-link item-name">
                  {{ item.product_name || item.name || 'Невідомий товар' }}
                </a>
              </td>
              <td class="text-right text-muted">{{ item.quantity || item.qty }} шт</td>
              <td class="text-right font-bold">{{ formatCurrency(item.price, tx.currency || 'UAH') }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Action buttons -->
      <div v-if="tx.order && orderData !== null" class="actions-section">
        <button
          v-if="orderData.can_view_receipt"
          class="receipt-btn"
          :disabled="isDownloadingReceipt"
          @click="downloadReceipt"
        >
          <template v-if="isDownloadingReceipt">Завантаження...</template>
          <template v-else>📄 Переглянути чек</template>
        </button>

        <button
          class="refund-btn"
          :class="{ 'refund-btn--disabled': !orderData.can_refund }"
          :disabled="!orderData.can_refund || isRefunding"
          :title="!orderData.can_refund ? 'Повернення вже оформлено або замовлення не оплачено' : 'Оформити повернення'"
          @click="showRefundConfirm = true"
        >
          <template v-if="isRefunding">Обробка...</template>
          <template v-else>↩ Повернення</template>
        </button>
      </div>
      <div v-if="tx.order && orderData === null && isLoadingOrder" class="loading-order">
        <span class="text-muted">Завантаження даних замовлення...</span>
      </div>
    </div>

    <!-- Refund confirmation modal -->
    <BaseModal :is-open="showRefundConfirm" @close="showRefundConfirm = false" title="Підтвердження повернення">
      <div class="refund-confirm">
        <p class="refund-confirm-text">
          Повернути замовлення <b>#{{ tx?.order }}</b> на суму
          <b class="amt-negative">{{ formatCurrency(orderData?.total_amount, orderData?.currency || 'UAH') }}</b>?
        </p>

        <div class="refund-cashbox-select">
          <label class="select-label">Оберіть касу для повернення:</label>
          <BaseSelect
            v-model="refundCashboxId"
            :options="cashboxOptions"
            placeholder="Оберіть касу"
          />
        </div>

        <div v-if="refundError" class="refund-error">{{ refundError }}</div>

        <div class="refund-actions">
          <BaseButton @click="showRefundConfirm = false">Скасувати</BaseButton>
          <button class="confirm-refund-btn" :disabled="!refundCashboxId || isRefunding" @click="executeRefund">
            {{ isRefunding ? 'Обробка...' : 'Підтвердити' }}
          </button>
        </div>
      </div>
    </BaseModal>

    <!-- Product Drawer -->
    <ProductDetailsDrawer
      v-if="selectedProduct"
      :product="selectedProduct"
      :readonly="true"
      @close="selectedProduct = null"
    />
  </BaseModal>
</template>

<script setup>
import { ref, watch } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import ProductDetailsDrawer from '@/components/warehouses/ProductDetailsDrawer.vue'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { TRANSACTION_TYPE_LABELS } from '@/constants/finance'
import { useCartStore } from '@/stores/pos'
import { useFinanceStore } from '@/stores/finance'
import { useCounterpartiesStore } from '@/stores/counterparties'
import api from '@/api/axios'

const props = defineProps({ isOpen: Boolean, tx: Object, getCashboxName: Function })
const emit = defineEmits(['close'])

const cartStore = useCartStore()
const financeStore = useFinanceStore()
const counterpartiesStore = useCounterpartiesStore()

const orderData = ref(null)
const isLoadingOrder = ref(false)
const showRefundConfirm = ref(false)
const refundCashboxId = ref(null)
const isRefunding = ref(false)
const refundError = ref('')
const isDownloadingReceipt = ref(false)

const openCounterpartyDrawer = (id) => {
  counterpartiesStore.openGlobalDrawer(id)
}

const selectedProduct = ref(null)

const openProductDrawer = (item) => {
  // item can be from orderData.items where product is the ID
  // ProductDetailsDrawer expects `product` object. 
  // It has a watcher that calls fetchDetails(props.product.id)
  selectedProduct.value = { id: item.product, name: item.product_name }
}

const getTransactionLabel = (tx) => TRANSACTION_TYPE_LABELS[tx.transaction_type] || 'Транзакція'

const downloadReceipt = async () => {
  if (!props.tx?.order) return
  isDownloadingReceipt.value = true
  try {
    const response = await api.get(`/orders/${props.tx.order}/receipt/`, {
      responseType: 'blob'
    })
    const fileURL = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
    window.open(fileURL, '_blank')
  } catch (e) {
    console.error('Помилка завантаження чека:', e)
    window.dispatchEvent(new CustomEvent('api-error', {
      detail: { message: 'Не вдалося згенерувати PDF чек.', type: 'error' }
    }))
  } finally {
    isDownloadingReceipt.value = false
  }
}

const cashboxOptions = ref([])

// When the modal opens and there is an order, fetch order details
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen && props.tx?.order) {
    isLoadingOrder.value = true
    orderData.value = null
    refundError.value = ''
    try {
      const { data } = await api.get(`/orders/${props.tx.order}/`)
      orderData.value = data
    } catch (e) {
      console.error('Error fetching order details:', e)
      orderData.value = null
    } finally {
      isLoadingOrder.value = false
    }

    // Ensure cashboxes are loaded
    if (cartStore.availableCashboxes.length === 0) {
      await cartStore.fetchCashboxes()
    }
    cashboxOptions.value = cartStore.availableCashboxes.map(b => ({ value: b.id, label: b.name }))
  } else if (!isOpen) {
    orderData.value = null
    showRefundConfirm.value = false
    refundCashboxId.value = null
    refundError.value = ''
  }
}, { immediate: true })

const executeRefund = async () => {
  if (!refundCashboxId.value || !props.tx?.order) return
  isRefunding.value = true
  refundError.value = ''
  try {
    await api.post(`/orders/${props.tx.order}/refund/`, {
      cash_register: refundCashboxId.value
    })

    window.dispatchEvent(new CustomEvent('app-success', {
      detail: { message: `Повернення замовлення #${props.tx.order} успішно оформлено!`, type: 'success' }
    }))

    showRefundConfirm.value = false

    // Refresh data
    await financeStore.fetchTransactions()
    await cartStore.fetchCashboxes()

    emit('close')
  } catch (e) {
    console.error('Refund error:', e)
    const msg = e.response?.data?.error || 'Не вдалося виконати повернення'
    refundError.value = msg
  } finally {
    isRefunding.value = false
  }
}
</script>

<style scoped>
.details-grid { display: flex; flex-direction: column; gap: 12px; }
.detail-row { display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding: 8px 0; }
.amt-positive { color: #166534; }
.amt-negative { color: #b91c1c; }

.actions-section { margin-top: 8px; padding-top: 12px; border-top: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 8px; }

.items-section { margin-top: 8px; }
.section-title { font-size: 0.9rem; font-weight: 700; color: #475569; margin-bottom: 8px; }
.items-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.items-table td { padding: 4px 0; border-bottom: 1px solid #f1f5f9; }
.items-table tr:last-child td { border-bottom: none; }
.text-link { color: #2563eb; text-decoration: none; transition: color 0.15s; }
.text-link:hover { color: #1d4ed8; text-decoration: underline; }
.item-name { display: block; max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.font-bold { font-weight: 600; }

.receipt-btn {
  width: 100%;
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #334155;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}
.receipt-btn:hover:not(:disabled) { background: #f1f5f9; border-color: #94a3b8; }
.receipt-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.refund-btn {
  width: 100%;
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid #dc2626;
  background: #fef2f2;
  color: #dc2626;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}
.refund-btn:hover:not(:disabled) { background: #fee2e2; border-color: #b91c1c; }
.refund-btn--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  border-color: #d1d5db;
  background: #f9fafb;
  color: #9ca3af;
}

.loading-order { text-align: center; padding: 8px 0; }
.text-muted { color: #94a3b8; font-size: 0.85rem; }

.refund-confirm { display: flex; flex-direction: column; gap: 16px; min-width: min(360px, 100%); }

@media (max-width: 480px) {
  .detail-row { flex-direction: column; align-items: flex-start; gap: 2px; }
  .item-name { max-width: 60vw; }
  .refund-actions { flex-direction: column-reverse; }
  .refund-actions :deep(button), .refund-actions .confirm-refund-btn { width: 100%; }
}
.refund-confirm-text { font-size: 0.95rem; color: #1e293b; line-height: 1.5; margin: 0; }
.refund-cashbox-select { display: flex; flex-direction: column; gap: 6px; }
.select-label { font-size: 0.85rem; font-weight: 600; color: #475569; }
.refund-error { color: #dc2626; font-size: 0.85rem; background: #fef2f2; padding: 8px 12px; border-radius: 6px; border: 1px solid #fecaca; }
.refund-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 4px; }

.confirm-refund-btn {
  padding: 10px 20px;
  border-radius: 4px;
  border: 1px solid transparent;
  background: #dc2626;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s;
}
.confirm-refund-btn:hover:not(:disabled) { background: #b91c1c; }
.confirm-refund-btn:disabled { background: #f3f4f6; color: #9ca3af; cursor: not-allowed; }
</style>
