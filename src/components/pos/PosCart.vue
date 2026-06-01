<template>
  <section class="cart-section" aria-label="Кошик замовлення">
    <h2 class="cart-title">Кошик</h2>

    <div class="cart-items">
      <div v-if="cartStore.items.length === 0" class="empty-cart-container">
        <div class="empty-cart-content">
          <IconReceipt class="empty-icon" />
          <h3 class="empty-title">Кошик порожній</h3>
          <p class="empty-subtitle">Виберіть товари зліва.</p>
        </div>
      </div>

      <transition-group name="list" tag="div" class="cart-list-wrapper" v-else>
        <div v-for="item in cartStore.items" :key="item.id" class="cart-item">
          <span class="item-title">{{ item.title }}</span>

          <div class="item-controls">
            <button
              @click="cartStore.updateItemQuantity(item.id, item.qty - 1)"
              aria-label="Зменшити кількість"
            >−</button>
            <span class="qty">{{ item.qty }}</span>
            <button
              @click="cartStore.updateItemQuantity(item.id, item.qty + 1)"
              :disabled="item.qty >= item.stock"
              aria-label="Збільшити кількість"
            >+</button>
          </div>
          <span class="item-total">{{ formatCurrency(item.price * item.qty, cartStore.currency) }}</span>
        </div>
      </transition-group>
    </div>

    <div class="checkout-panel">
      <div class="summary-row total-row">
        <span class="summary-label">Разом</span>
        <strong>{{ formatCurrency(cartStore.totalAmount, cartStore.currency) }}</strong>      </div>

      <div class="input-group">
        <label class="group-label">Тип оплати</label>
        <div class="toggle-wrapper">
          <button
            :class="['toggle-btn', { active: paymentType === 'full' }]"
            @click="setPaymentType('full')"
            aria-pressed="paymentType === 'full'"
          >
            Повна
          </button>
          <button
            :class="['toggle-btn', { active: paymentType === 'partial' }]"
            @click="setPaymentType('partial')"
            aria-pressed="paymentType === 'partial'"
          >
            Часткова
          </button>
        </div>
      </div>

      <transition name="expand">
        <div v-if="paymentType === 'partial'" class="partial-payment-section">
         <BaseInput
            label="Сума передоплати (₴):"
            type="text"
            inputmode="numeric"
            :model-value="cartStore.prepayAmount === 0 ? '' : String(cartStore.prepayAmount)"
            @update:model-value="handlePrepayInput"
            @keydown="preventNonDigits"
            @keydown.enter="handleEnterPress"
            :error="isPrepayInvalid ? 'Передоплата не може перевищувати загальну суму!' : ''"
            placeholder="0"
            class="mb-compact"
          />

          <div class="summary-row debt-row" v-if="cartStore.prepayAmount > 0 && cartStore.balanceDue > 0 && !isPrepayInvalid">
            <span class="summary-label">Борг клієнта:</span>
            <strong>{{ formatCurrency(cartStore.balanceDue, cartStore.currency) }}</strong>
          </div>
        </div>
      </transition>

      <BaseInput
        label="Коментар / ТТН"
        type="text"
        v-model="cartStore.commentTtn"
        placeholder="Номер ТТН або примітка..."
        class="mb-compact mt-1"
        @keydown.enter="handleEnterPress"
      />

      <BaseButton
        variant="primary"
        :disabled="cartStore.items.length === 0 || isPrepayInvalid"
        @click="handleCheckout"
        class="pay-btn"
      >
        <div class="btn-content">
          <span>Оформити оплату</span>
        </div>
      </BaseButton>
    </div>
  </section>
  <ReceiptModal
      :is-open="showReceiptModal"
      :order-data="lastCompletedOrder"
      :cashbox-name="cartStore.activeCashbox?.name"
      :currency="cartStore.currency"
      @close="showReceiptModal = false"
    />
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCartStore } from '@/stores/pos'
import { formatCurrency } from '@/utils/formatters'
import api from '@/api/axios'

import ReceiptModal from '@/components/pos/ReceiptModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import IconReceipt from '@/components/icons/IconReceipt.vue'

const cartStore = useCartStore()
const paymentType = ref('full')
const isSubmitting = ref(false)
const showReceiptModal = ref(false)
const lastCompletedOrder = ref(null)

const setPaymentType = (type) => {
  paymentType.value = type
  if (type === 'full') {
    cartStore.prepayAmount = 0
  }
}

const preventNonDigits = (event) => {
  const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Enter', 'Home', 'End']
  if (event.ctrlKey || event.metaKey || allowedKeys.includes(event.key) || event.key.startsWith('F')) {
    return
  }
  if (!/^\d$/.test(event.key)) {
    event.preventDefault()
  }
}

const handlePrepayInput = (val) => {
  const digitsOnly = String(val).replace(/\D/g, '')
  cartStore.prepayAmount = digitsOnly ? parseInt(digitsOnly, 10) : 0
}

const isPrepayInvalid = computed(() => {
  return paymentType.value === 'partial' && cartStore.prepayAmount > cartStore.totalAmount
})

const handleCheckout = async () => {
  if (cartStore.items.length === 0 || isPrepayInvalid.value || isSubmitting.value) return

  if (!cartStore.activeCashbox) {
    window.dispatchEvent(new CustomEvent('api-error', {
      detail: { message: 'Оберіть робочу касу для проведення оплати!', type: 'warning' }
    }))
    return
  }

  isSubmitting.value = true
  try {
    if (paymentType.value === 'full') {
      cartStore.prepayAmount = cartStore.totalAmount
    }

    const payload = cartStore.getOrderPayload()
    const response = await api.post('/orders/', payload)
    const newOrderId = response.data.id

    if (cartStore.prepayAmount > 0) {
      await api.post(`/orders/${newOrderId}/prepay/`, {
        amount: cartStore.prepayAmount.toString(),
        cash_register: cartStore.activeCashbox.id,
        currency: cartStore.currency
      })
    }

    lastCompletedOrder.value = {
      id: newOrderId,
      items: [...cartStore.items],
      totalAmount: cartStore.totalAmount,
      prepayAmount: cartStore.prepayAmount,
      debtAmount: paymentType.value === 'full' ? 0 : cartStore.balanceDue,
      commentTtn: cartStore.commentTtn
    }

    showReceiptModal.value = true
    cartStore.clearCart()
    paymentType.value = 'full'
    await cartStore.fetchProducts()

  } catch (error) {
    console.error('Помилка оформлення:', error)
    window.dispatchEvent(new CustomEvent('api-error', {
      detail: { message: 'Не вдалося створити замовлення або провести оплату', type: 'error' }
    }))
  } finally {
    isSubmitting.value = false
  }
}

const handleEnterPress = () => {
  if (cartStore.items.length > 0 && !isPrepayInvalid.value) {
    handleCheckout()
  }
}
</script>

<style scoped>
.cart-section {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.cart-title {
  font-size: 1.15rem;
  color: #0f172a;
  font-weight: 600;
  padding: 16px 20px 12px;
  margin: 0;
  border-bottom: 1px solid #f1f5f9;
}

.cart-items {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  scrollbar-width: none;
  position: relative;
  z-index: 1;
}
.cart-items::-webkit-scrollbar { display: none; }

.empty-cart-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.empty-cart-content {
  text-align: center;
  color: #94a3b8;
}

.empty-icon {
  width: 48px;
  height: 48px;
  color: #cbd5e1;
  opacity: 0.7;
  margin-bottom: 12px;
}

.empty-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: #64748b;
  margin: 0 0 4px 0;
}

.empty-subtitle {
  font-size: 0.85rem;
  margin: 0;
}

.btn-icon {
  width: 18px;
  height: 18px;
}

.cart-list-wrapper {
  padding-top: 8px;
  padding-bottom: 48px;
}

.cart-item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px dashed #e2e8f0;
}

.item-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: #1e293b;
  line-height: 1.3;
}

.item-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-controls button {
width: 28px;
height: 28px;
border: 1px solid #cbd5e1;
background: white;
border-radius: 6px;
cursor: pointer;
color: #475569;
font-size: 1.1rem;
display: flex;
align-items: center;
justify-content: center;
transition: all 0.2s;
}

.item-controls button:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #94a3b8;
}

.item-controls button:disabled {
  background: #f8fafc;
  color: #cbd5e1;
  cursor: not-allowed;
  border-color: #e2e8f0;
}

.item-controls button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 1px;
}

.qty {
  font-weight: 600;
  min-width: 20px;
  font-size: 0.9rem;
  text-align: center;
  color: #0f172a;
}

.item-total {
  font-weight: 600;
  color: #0f172a;
  min-width: 65px;
  font-size: 0.95rem;
  text-align: right;
}

.list-enter-active, .list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.partial-payment-section {
  overflow: hidden;
}

.expand-enter-active, .expand-leave-active {
  transition: all 0.25s ease-in-out;
}

.expand-enter-from, .expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to, .expand-leave-from {
  opacity: 1;
  max-height: 140px;
}

.checkout-panel {
  flex: 0 0 auto;
  background: #ffffff;
  padding: 16px 20px;
  border-top: 1px solid #f1f5f9;
  position: relative;
  z-index: 10;
  box-shadow: 0 -4px 12px rgba(15, 23, 42, 0.03);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.summary-label {
  color: #64748b;
  font-size: 0.95rem;
}

.total-row strong {
  font-size: 1.2rem;
  color: #0f172a;
}

.debt-row {
  color: #ef4444;
  font-size: 1.05rem;
  padding-top: 8px;
  border-top: 1px dashed #e2e8f0;
  margin-top: 8px;
  margin-bottom: 4px;
}

.debt-row .summary-label {
  color: #ef4444;
}

.input-group {
  margin-bottom: 12px;
}

.group-label {
  display: block;
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 6px;
  font-weight: 500;
}

.toggle-wrapper {
  display: flex;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 4px;
  gap: 4px;
}

.toggle-btn {
  flex: 1;
  padding: 8px 0;
  border: none;
  background: transparent;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn.active {
  background: #3b82f6;
  color: white;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.toggle-btn:hover:not(.active) {
  background: #e2e8f0;
  color: #0f172a;
}

.toggle-btn:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: -2px;
}

.mb-compact {
  margin-bottom: 12px;
}

.mt-1 {
  margin-top: 4px;
}

.pay-btn {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  font-size: 1.05rem;
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  }
</style>
