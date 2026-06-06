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
          <span class="item-total">{{ formatCurrency(getItemPrice(item) * item.qty, cartStore.currency) }}</span>
        </div>
      </transition-group>
    </div>

    <div class="checkout-panel">
      <div class="summary-row total-row">
        <span class="summary-label">Разом</span>
        <strong>{{ formatCurrency(cartStore.totalAmount, cartStore.currency) }}</strong>
      </div>

      <div class="input-group">
        <label class="group-label">Валюта оплати</label>
        <div class="toggle-wrapper">
          <button :class="['toggle-btn', { active: cartStore.currency === 'UAH' }]" @click="cartStore.currency = 'UAH'">₴ UAH</button>
          <button :class="['toggle-btn', { active: cartStore.currency === 'USD' }]" @click="cartStore.currency = 'USD'">$ USD</button>
          <button :class="['toggle-btn', { active: cartStore.currency === 'EUR' }]" @click="cartStore.currency = 'EUR'">€ EUR</button>
        </div>
      </div>

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
            :label="`Сума передоплати (${cartStore.currency}):`"
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
  <ConfirmModal
    :is-open="isConfirmOpen"
    title="Підтвердження продажу"
    :message="confirmMessage"
    confirmText="Оформити оплату"
    @close="isConfirmOpen = false"
    @confirm="executeCheckout"
  />
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCartStore } from '@/stores/pos'
import { useWarehousesStore } from '@/stores/warehouses'
import { formatCurrency } from '@/utils/formatters'
import api from '@/api/axios'

import ReceiptModal from '@/components/pos/ReceiptModal.vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import IconReceipt from '@/components/icons/IconReceipt.vue'

const cartStore = useCartStore()
const warehousesStore = useWarehousesStore()
const paymentType = ref('full')
const isSubmitting = ref(false)
const showReceiptModal = ref(false)
const lastCompletedOrder = ref(null)

const isConfirmOpen = ref(false)
const confirmMessage = ref('')

const setPaymentType = (type) => {
  paymentType.value = type
  if (type === 'full') {
    cartStore.prepayAmount = 0
  }
}

const getItemPrice = (item) => {
  if (cartStore.currency === 'UAH') return Number(item.price_uah || item.price)
  if (cartStore.currency === 'USD') return Number(item.price_usd || 0)
  if (cartStore.currency === 'EUR') return Number(item.price_eur || 0)
  return Number(item.price)
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

const handleCheckout = () => {
  if (cartStore.items.length === 0 || isPrepayInvalid.value || isSubmitting.value) return

  if (!cartStore.activeCashbox) {
    window.dispatchEvent(new CustomEvent('api-error', {
      detail: { message: 'Оберіть робочу касу для проведення оплати!', type: 'warning' }
    }))
    return
  }

  const paymentAmount = paymentType.value === 'full' ? cartStore.totalAmount : cartStore.prepayAmount
  const paymentTypeStr = paymentType.value === 'full' ? 'Повна оплата' : 'Часткова оплата (передоплата)'
  
  confirmMessage.value = `Ви збираєтесь оформити продаж на суму <strong>${formatCurrency(cartStore.totalAmount, cartStore.currency)}</strong>.<br>
  Тип оплати: <strong>${paymentTypeStr}</strong><br>
  До сплати зараз: <strong>${formatCurrency(paymentAmount, cartStore.currency)}</strong><br><br>
  Підтвердити операцію?`
  
  isConfirmOpen.value = true
}

const executeCheckout = async () => {
  if (cartStore.items.length === 0 || isPrepayInvalid.value || isSubmitting.value) return
  isConfirmOpen.value = false
  isSubmitting.value = true
  try {
    const paymentAmount = paymentType.value === 'full' ? cartStore.totalAmount : cartStore.prepayAmount

    const payload = {
      ...cartStore.getOrderPayload(),
      prepay_amount: 0,
      balance_due: cartStore.totalAmount,
      status: 'draft',
      cash_register: cartStore.activeCashbox.id
    }

    const response = await api.post('/orders/', payload)
    const newOrderId = response.data.id

    if (paymentAmount > 0) {
      await api.post(`/orders/${newOrderId}/prepay/`, {
        amount: paymentAmount,
        cash_register: cartStore.activeCashbox.id,
        currency: cartStore.currency
      })
    }

    await cartStore.fetchCashboxes()

    lastCompletedOrder.value = {
      id: newOrderId,
      items: [...cartStore.items],
      totalAmount: cartStore.totalAmount,
      prepayAmount: paymentAmount,
      debtAmount: cartStore.totalAmount - paymentAmount,
      commentTtn: cartStore.commentTtn
    }

    showReceiptModal.value = true

    cartStore.clearCart()
    paymentType.value = 'full'
    await cartStore.fetchProducts()
    await warehousesStore.fetchWarehouses()

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
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 20px 25px -5px rgba(0, 0, 0, 0.03);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 100%;
  overflow: hidden;
}

.cart-title {
  font-size: 1.15rem;
  color: #0f172a;
  font-weight: 700;
  padding: 20px 24px 16px;
  margin: 0;
  border-bottom: 1px solid #f1f5f9;
  letter-spacing: -0.01em;
  flex: 0 0 auto;
}

.cart-items {
  flex: 1 1 0;
  min-height: 220px;
  overflow-y: auto;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.checkout-panel {
  flex: 0 1 auto;
  overflow-y: auto;
  background: #ffffff;
  padding: 16px 20px;
  border-top: 1px solid #e2e8f0;
  position: relative;
  z-index: 10;
  box-shadow: 0 -4px 12px rgba(15, 23, 42, 0.02);
}
.checkout-panel::-webkit-scrollbar { width: 4px; }
.checkout-panel::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 4px; }
.cart-items::-webkit-scrollbar { width: 6px; }
.cart-items::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 6px; }

.empty-cart-container { flex: 1; display: flex; align-items: center; justify-content: center; padding: 20px; }
.empty-cart-content { text-align: center; color: #94a3b8; display: flex; flex-direction: column; align-items: center; }
.empty-icon { width: 48px; height: 48px; color: #cbd5e1; opacity: 0.6; margin-bottom: 12px; }
.empty-title { font-size: 1.05rem; font-weight: 600; color: #475569; margin: 0 0 6px 0; }
.empty-subtitle { font-size: 0.85rem; margin: 0; color: #94a3b8; }
.btn-icon { width: 18px; height: 18px; }

.cart-list-wrapper { padding-top: 12px; padding-bottom: 24px; position: relative; }

.cart-item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px dashed #e2e8f0;
  background: #ffffff;
}
.cart-item:last-child { border-bottom: none; }

.item-title { font-size: 0.95rem; font-weight: 600; color: #334155; line-height: 1.4; }

.item-controls {
  display: flex; align-items: center; gap: 12px; background: #f8fafc; padding: 4px; border-radius: 8px; border: 1px solid #e2e8f0;
}
.item-controls button { width: 28px; height: 28px; border: none; background: white; border-radius: 6px; cursor: pointer; color: #475569; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
.item-controls button:hover:not(:disabled) { background: #f1f5f9; color: #2563eb; }
.item-controls button:disabled { background: transparent; color: #cbd5e1; cursor: not-allowed; box-shadow: none; }

.qty { font-weight: 700; min-width: 24px; font-size: 0.95rem; text-align: center; color: #0f172a; }
.item-total { font-weight: 700; color: #0f172a; min-width: 75px; font-size: 1rem; text-align: right; letter-spacing: -0.01em; }

.list-enter-active, .list-leave-active { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.list-enter-from { opacity: 0; transform: translateX(20px) scale(0.98); }
.list-leave-to { opacity: 0; transform: translateX(-20px) scale(0.98); position: absolute; width: calc(100% - 48px); }
.list-move { transition: transform 0.3s ease; }

.summary-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.summary-label { color: #64748b; font-size: 0.95rem; font-weight: 500; }
.total-row strong { font-size: 1.45rem; color: #0f172a; letter-spacing: -0.02em; }

.debt-row { color: #ef4444; font-size: 1.1rem; padding-top: 16px; border-top: 1px dashed #e2e8f0; margin-top: 16px; margin-bottom: 8px; }
.debt-row .summary-label { color: #ef4444; }

.input-group { margin-bottom: 16px; }
.group-label { display: block; font-size: 0.85rem; color: #475569; margin-bottom: 10px; font-weight: 600; }

.checkout-panel input { width: 100%; padding: 12px 16px; font-size: 0.95rem; font-weight: 500; color: #334155; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; transition: all 0.2s ease; outline: none; box-sizing: border-box; }
.checkout-panel input:hover:not(:disabled) { border-color: #cbd5e1; background-color: #f1f5f9; }
.checkout-panel input:focus { border-color: #cbd5e1; background-color: #ffffff; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
.checkout-panel input::placeholder { color: #94a3b8; font-weight: 400; }

.toggle-wrapper { display: flex; background: #f1f5f9; border-radius: 8px; padding: 4px; gap: 4px; }
.toggle-btn { flex: 1; padding: 10px 0; border: none; background: transparent; border-radius: 6px; font-size: 0.9rem; font-weight: 600; color: #64748b; cursor: pointer; transition: all 0.2s ease; }
.toggle-btn.active { background: #ffffff; color: #2563eb; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.toggle-btn:hover:not(.active) { color: #0f172a; }

.partial-payment-section { overflow: hidden; background: #ffffff; }

.expand-enter-active, .expand-leave-active { transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
.expand-enter-from, .expand-leave-to { opacity: 0; max-height: 0; margin-top: 0; transform: translateY(-5px); }
.expand-enter-to, .expand-leave-from { opacity: 1; max-height: 300px; margin-top: 20px; transform: translateY(0); }

.mb-compact { margin-bottom: 12px; }
.mt-1 { margin-top: 8px; }

.pay-btn { width: 100%; padding: 16px; border-radius: 8px; font-size: 1.1rem; font-weight: 600; letter-spacing: 0.02em; margin-top: 12px; }
.btn-content { display: flex; align-items: center; justify-content: center; gap: 8px; }

@media (max-width: 1023px) {
  .cart-section { min-height: 400px; height: auto; max-height: none; }
  .cart-items { min-height: 150px; max-height: 35vh; }
}
@media (max-width: 640px) {
  .cart-title { padding: 16px 20px 12px; font-size: 1.05rem; }
  .cart-items { padding: 0 20px; }
  .checkout-panel { padding: 20px; }
  .toggle-btn { font-size: 0.85rem; padding: 8px 0; }
  .pay-btn { padding: 14px; }
}
</style>
