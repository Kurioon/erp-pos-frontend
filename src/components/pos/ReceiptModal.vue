<template>
  <BaseModal :is-open="isOpen" @close="closeModal" title="Друк чека">
    <div class="receipt-container">

      <div id="printable-receipt" class="receipt-paper">
        <div class="receipt-header">
          <h2>ERP / POS SYSTEM</h2>
          <p>Фіскальний чек</p>
          <p v-if="orderData?.id"><strong>Чек № {{ orderData.id }}</strong></p>
          <p>Касир: {{ authStore.user?.name || 'Невідомо' }}</p>
          <p v-if="cashboxName">Каса: {{ cashboxName }}</p>
          <div class="divider"></div>
        </div>

        <div class="receipt-items">
          <div v-for="item in orderData?.items" :key="item.id || item.product" class="receipt-item">
            <div class="item-name">{{ item.title || item.name || item.product_name }}</div>
            <div class="item-calc">
              <span>{{ item.quantity || item.qty }} x {{ formatCurrency(item.price, currency) }}</span>
              <span>{{ formatCurrency((item.quantity || item.qty) * item.price, currency) }}</span>
            </div>
            <div class="item-calc discount-row" v-if="item.discount_amount > 0">
              <span>Знижка:</span>
              <span>-{{ formatCurrency(item.discount_amount * (item.quantity || item.qty), currency) }}</span>
            </div>
            <div class="item-calc final-row" v-if="item.discount_amount > 0">
              <span>З урахуванням знижки:</span>
              <span>{{ formatCurrency((item.quantity || item.qty) * (item.price - item.discount_amount), currency) }}</span>
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <div class="receipt-summary">
          <div class="summary-row" v-if="orderData?.discount_amount > 0">
            <span>Знижка на чек:</span>
            <span>-{{ formatCurrency(orderData.discount_amount, currency) }}</span>
          </div>
          <div class="summary-row total">
            <span>СУМА ДО ОПЛАТИ:</span>
            <span>{{ formatCurrency(orderData?.totalAmount || orderData?.total_amount, currency) }}</span>
          </div>
          <div class="summary-row" v-if="orderData?.prepayAmount > 0">
            <span>Передоплата:</span>
            <span>{{ formatCurrency(orderData?.prepayAmount, currency) }}</span>
          </div>
          <div class="summary-row" v-if="orderData?.debtAmount > 0">
            <span>Залишок боргу:</span>
            <span>{{ formatCurrency(orderData?.debtAmount, currency) }}</span>
          </div>
        </div>

        <div class="divider"></div>

        <div class="receipt-footer">
          <p v-if="orderData?.commentTtn">ТТН/Комент: {{ orderData?.commentTtn }}</p>
          <p>{{ new Date().toLocaleString('uk-UA') }}</p>
          <p>ДЯКУЄМО ЗА ПОКУПКУ!</p>
        </div>
      </div>

      <div class="modal-actions no-print">
        <BaseButton variant="secondary" @click="closeModal">
          Закрити
        </BaseButton>
        <BaseButton variant="primary" @click="printReceipt" :disabled="isDownloading">
          <span v-if="isDownloading">Завантаження...</span>
          <span v-else>Друкувати PDF</span>
        </BaseButton>
      </div>

    </div>
  </BaseModal>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { formatCurrency } from '@/utils/formatters'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import api from '@/api/axios'

const authStore = useAuthStore()

const props = defineProps({
  isOpen: Boolean,
  orderData: Object,
  cashboxName: String,
  currency: {
    type: String,
    default: 'UAH'
  }
})

const emit = defineEmits(['close'])

const isDownloading = ref(false)

const closeModal = () => {
  emit('close')
}

const printReceipt = async () => {
  if (!props.orderData?.id) {
    window.dispatchEvent(new CustomEvent('api-error', {
      detail: { message: 'Відсутній ID замовлення для генерації чека.', type: 'error' }
    }))
    return
  }

  isDownloading.value = true
  try {
    const response = await api.get(`/orders/${props.orderData.id}/receipt/`, {
      responseType: 'blob'
    })

    const fileURL = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))

    const fileLink = document.createElement('a')
    fileLink.href = fileURL
    fileLink.setAttribute('download', `receipt_${props.orderData.id}.pdf`) // Назва файлу
    document.body.appendChild(fileLink)

    fileLink.click()

    fileLink.remove()
    setTimeout(() => window.URL.revokeObjectURL(fileURL), 1000)

  } catch (error) {
    console.error('Помилка завантаження чека:', error)
    window.dispatchEvent(new CustomEvent('api-error', {
      detail: { message: 'Не вдалося згенерувати PDF чек з сервера.', type: 'error' }
    }))
  } finally {
    isDownloading.value = false
  }
}
</script>

<style scoped>
.receipt-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.receipt-paper {
  background: #fff;
  width: 100%;
  max-width: 320px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  font-family: 'Courier New', Courier, monospace;
  color: #000;
  font-size: 14px;
  line-height: 1.4;
}

.receipt-header, .receipt-footer { text-align: center; }
.receipt-header h2 { margin: 0 0 8px 0; font-size: 18px; font-weight: bold; }
.receipt-header p, .receipt-footer p { margin: 4px 0; font-size: 12px; }
.divider { border-top: 1px dashed #000; margin: 12px 0; }
.receipt-item { margin-bottom: 8px; }
.item-calc {
  display: flex;
  justify-content: space-between;
}
.discount-row {
  color: #555;
  font-size: 13px;
  margin-top: 2px;
}
.final-row {
  font-weight: bold;
  margin-top: 2px;
}
.summary-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
.summary-row.total { font-weight: bold; font-size: 16px; }

.modal-actions {
  display: flex;
  gap: 12px;
  width: 100%;
  justify-content: center;
}

</style>

<style>
@media print {
  body * {
    visibility: hidden !important;
  }

  #printable-receipt, #printable-receipt * {
    visibility: visible !important;
  }

  #printable-receipt {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    box-shadow: none !important;
    border: none !important;
  }
}
</style>
