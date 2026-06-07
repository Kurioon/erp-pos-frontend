<template>
  <BaseModal :is-open="isOpen" @close="$emit('close')" title="Деталі документа">
    <div v-if="order" class="details-grid">
      <div class="detail-row">
        <span>Документ-основа:</span>
        <b>
          <template v-if="sourceDocType === 'repair'">Ремонт</template>
          <template v-else-if="sourceDocType === 'purchase'">Закупівля</template>
          <template v-else>Замовлення</template>
          #{{ sourceDocId || '?' }}
        </b>
      </div>
      <div v-if="counterparty && counterparty.name" class="detail-row">
        <span>Клієнт:</span>
        <b>
          <a href="#" @click.prevent="openCounterpartyDrawer(counterparty.id)" class="text-link font-bold">
            {{ counterparty.name }}
          </a> 
          <span class="text-muted" v-if="counterparty.phone">({{ counterparty.phone }})</span>
        </b>
      </div>
      <div class="detail-row">
        <span>Дата:</span>
        <b>{{ formatDate(order.timestamp || order.created_at || new Date()) }}</b>
      </div>
      <div class="detail-row">
        <span>Загальна сума документа:</span>
        <b>{{ formatCurrency(totalAmount, order.currency) }}</b>
      </div>
      <div class="detail-row">
        <span>Вже сплачено:</span>
        <b class="amt-positive">{{ formatCurrency(paidAmount, order.currency) }}</b>
      </div>
      <div class="detail-row highlight-row">
        <span>Залишок до сплати (Борг):</span>
        <b class="amt-negative">{{ formatCurrency(debtAmount, order.currency) }}</b>
      </div>

      <div v-if="orderData && orderData.items && orderData.items.length > 0" class="items-section mt-4">
        <p class="section-title">Позиції в замовленні:</p>
        <table class="items-table">
          <tbody>
            <tr v-for="(item, idx) in orderData.items" :key="idx">
              <td>
                <a href="#" @click.prevent="openProductDrawer(item)" class="text-link item-name">
                  {{ item.product_name || item.name || 'Невідомий товар' }}
                </a>
              </td>
              <td class="text-right text-muted">{{ item.quantity || item.qty }} шт</td>
              <td class="text-right font-bold">{{ formatCurrency(item.price, order.currency || 'UAH') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-if="isLoadingOrder" class="loading-order">
        <span class="text-muted">Завантаження позицій...</span>
      </div>

      <div class="modal-actions" v-if="debtAmount > 0">
        <BaseButton variant="primary" @click="$emit('pay', order)" style="width: 100%; margin-top: 10px;">Оплатити борг</BaseButton>
      </div>
    </div>

    <ProductDetailsDrawer
      v-if="selectedProduct"
      :product="selectedProduct"
      :readonly="true"
      @close="selectedProduct = null"
    />
  </BaseModal>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ProductDetailsDrawer from '@/components/warehouses/ProductDetailsDrawer.vue'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { useCounterpartiesStore } from '@/stores/counterparties'
import api from '@/api/axios'

const props = defineProps({
  isOpen: Boolean,
  order: Object
})
const emit = defineEmits(['close', 'pay'])

const counterpartiesStore = useCounterpartiesStore()
const openCounterpartyDrawer = (id) => {
  counterpartiesStore.openGlobalDrawer(id)
}

const sourceDocType = computed(() => props.order?.source_document?.type || 'order')
const sourceDocId = computed(() => props.order?.source_document?.id || props.order?.id)
const counterparty = computed(() => props.order?.counterparty || null)

const totalAmount = computed(() => Number(props.order?.source_document?.total_amount || props.order?.total_amount || 0))
const debtAmount = computed(() => Number(props.order?.balance_due !== undefined ? props.order.balance_due : (props.order?.amount || 0)))
const paidAmount = computed(() => totalAmount.value - debtAmount.value)

const orderData = ref(null)
const isLoadingOrder = ref(false)
const selectedProduct = ref(null)

const openProductDrawer = (item) => {
  selectedProduct.value = { id: item.product, name: item.product_name || item.name }
}

watch(() => props.isOpen, async (isOpen) => {
  const orderId = props.order?.order || props.order?.id
  if (isOpen && orderId && sourceDocType.value === 'order') {
    isLoadingOrder.value = true
    orderData.value = null
    try {
      const { data } = await api.get(`/orders/${orderId}/`)
      orderData.value = data
    } catch (e) {
      console.error('Error fetching order details:', e)
      orderData.value = null
    } finally {
      isLoadingOrder.value = false
    }
  } else if (!isOpen) {
    orderData.value = null
  }
}, { immediate: true })
</script>

<style scoped>
.details-grid { display: flex; flex-direction: column; gap: 12px; }
.detail-row { display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding: 8px 0; font-size: 0.95rem; }
.highlight-row { background-color: #fef2f2; padding: 12px 8px; border-radius: 6px; border-bottom: none; margin-top: 8px; }
.amt-positive { color: #166534; }
.amt-negative { color: #b91c1c; font-size: 1.1rem; }

.items-section { margin-top: 8px; }
.section-title { font-size: 0.9rem; font-weight: 700; color: #475569; margin-bottom: 8px; }
.items-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.items-table td { padding: 4px 0; border-bottom: 1px solid #f1f5f9; }
.items-table tr:last-child td { border-bottom: none; }
.text-link { color: #2563eb; text-decoration: none; transition: color 0.15s; }
.text-link:hover { color: #1d4ed8; text-decoration: underline; }
.item-name { display: block; max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.font-bold { font-weight: 600; }
.text-muted { color: #94a3b8; font-size: 0.85rem; }
.loading-order { text-align: center; padding: 8px 0; }
</style>
