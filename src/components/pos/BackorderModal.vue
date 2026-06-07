<template>
  <BaseModal :is-open="isOpen" @close="emit('close')" title="Оформлення під замовлення">
    <div v-if="product" class="backorder-wrapper">
      <div class="product-banner">
        <span class="banner-label">Товар відсутній на складі — буде замовлений у постачальника</span>
        <div class="banner-product">
          <strong>{{ product.name }}</strong>
          <span class="banner-stock">Залишок: {{ product.stock ?? 0 }} шт</span>
        </div>
      </div>

      <div class="form-row-2">
        <div class="form-group">
          <label class="form-label">Кількість *</label>
          <BaseInput v-model.number="quantity" type="number" min="1" placeholder="1" />
        </div>
        <div class="form-group">
          <label class="form-label">Ціна закупівлі (за од.) *</label>
          <BaseInput v-model.number="purchasePrice" type="number" min="0" step="0.01" placeholder="0.00" />
        </div>
      </div>

      <div class="form-group">
        <CounterpartySelect
          v-model="buyerId"
          label="Покупець (клієнт) *"
          role-filter="buyer"
          placeholder="Оберіть або створіть клієнта..."
        />
      </div>

      <div class="form-group">
        <CounterpartySelect
          v-model="supplierId"
          label="Постачальник *"
          role-filter="supplier"
          placeholder="Оберіть або створіть постачальника..."
        />
      </div>

      <div class="summary-card">
        <div class="summary-row">
          <span>Сума для клієнта:</span>
          <strong>{{ formatCurrency(retailTotal, 'UAH') }}</strong>
        </div>
        <div class="summary-row muted">
          <span>Закупівля у постачальника:</span>
          <span>{{ formatCurrency(purchaseTotal, 'UAH') }}</span>
        </div>
      </div>

      <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

      <div class="modal-actions">
        <BaseButton variant="secondary" @click="emit('close')">Скасувати</BaseButton>
        <BaseButton variant="primary" :disabled="!isValid || isSubmitting" @click="submit">
          {{ isSubmitting ? 'Оформлення...' : 'Оформити під замовлення' }}
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import CounterpartySelect from '@/components/counterparties/CounterpartySelect.vue'
import { formatCurrency } from '@/utils/formatters'
import { useProcurementStore } from '@/stores/procurement'

const props = defineProps({
  isOpen: Boolean,
  product: { type: Object, default: null }
})
const emit = defineEmits(['close', 'created'])

const procurementStore = useProcurementStore()

const quantity = ref(1)
const purchasePrice = ref(0)
const buyerId = ref('')
const supplierId = ref('')
const isSubmitting = ref(false)
const errorMsg = ref('')

// Скидаємо форму при кожному відкритті; ціну закупівлі підставляємо з товару
watch(() => props.isOpen, (open) => {
  if (open) {
    quantity.value = 1
    purchasePrice.value = Number(props.product?.purchase_price || 0)
    buyerId.value = ''
    supplierId.value = ''
    errorMsg.value = ''
  }
})

const salePrice = computed(() => Number(props.product?.sale_price || props.product?.price_uah || 0))

const retailTotal = computed(() => salePrice.value * (quantity.value || 0))
const purchaseTotal = computed(() => (Number(purchasePrice.value) || 0) * (quantity.value || 0))

const isValid = computed(() =>
  props.product && quantity.value >= 1 && Number(purchasePrice.value) > 0 && !!buyerId.value && !!supplierId.value
)

const submit = async () => {
  if (!isValid.value) return
  isSubmitting.value = true
  errorMsg.value = ''
  try {
    // 1) Відкладене роздрібне замовлення під клієнта (draft)
    const retailOrder = await procurementStore.createDeferredRetailOrder({
      counterparty: buyerId.value,
      total_amount: retailTotal.value,
      items: [{ product: props.product.id, quantity: quantity.value, price: salePrice.value }]
    })

    // 2) Закупівля у постачальника, прив'язана до замовлення
    await procurementStore.createBackorderPurchase({
      counterparty: supplierId.value,
      related_retail_order: retailOrder.id,
      total_amount: purchaseTotal.value,
      items: [{ product: props.product.id, quantity: quantity.value, price: Number(purchasePrice.value) }]
    })

    window.dispatchEvent(new CustomEvent('app-success', {
      detail: { message: 'Оформлено під замовлення. Створено закупівлю у постачальника.', type: 'success' }
    }))
    emit('created')
    emit('close')
  } catch (e) {
    console.error('Помилка оформлення під замовлення:', e)
    errorMsg.value = e.response?.data?.detail || 'Не вдалося оформити замовлення. Спробуйте ще раз.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.backorder-wrapper { display: flex; flex-direction: column; gap: 16px; min-width: min(360px, 100%); width: 100%; }
.form-group { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.form-row-2 { display: flex; gap: 16px; }
.form-row-2 .form-group { flex: 1; min-width: 0; }
.form-label { font-size: 0.8rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; }

.product-banner { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 12px 16px; display: flex; flex-direction: column; gap: 6px; }
.banner-label { font-size: 0.8rem; color: #c2410c; font-weight: 600; }
.banner-product { display: flex; justify-content: space-between; align-items: center; }
.banner-product strong { color: #0f172a; font-size: 1rem; }
.banner-stock { font-size: 0.85rem; color: #ef4444; font-weight: 600; }

.summary-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; display: flex; flex-direction: column; gap: 6px; }
.summary-row { display: flex; justify-content: space-between; font-size: 0.95rem; color: #0f172a; }
.summary-row strong { color: #2563eb; }
.summary-row.muted { color: #64748b; font-size: 0.85rem; }

.error-msg { background: #fef2f2; color: #dc2626; padding: 10px 14px; border-radius: 8px; font-size: 0.85rem; border: 1px solid #fca5a5; }

.modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; padding-top: 16px; border-top: 1px solid #e2e8f0; }

@media (max-width: 480px) {
  .form-row-2 { flex-direction: column; gap: 12px; }
  .banner-product { flex-direction: column; align-items: flex-start; gap: 4px; }
  .modal-actions { flex-direction: column-reverse; }
  .modal-actions :deep(button) { width: 100%; }
}
</style>
