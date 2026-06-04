<template>
  <BaseModal :is-open="isOpen" @close="emit('close')" :title="editMode ? 'Редагувати замовлення' : 'Нове замовлення'">
    <div class="purchase-modal-wrapper">

      <div class="form-row-top">
        <div class="form-group">
          <div class="supplier-label-container">
            <label class="form-label">Постачальник *</label>
            <button type="button" class="inline-add-btn" @click="isAddingNewSupplier = !isAddingNewSupplier">
              {{ isAddingNewSupplier ? '← До списку' : '+ Новий' }}
            </button>
          </div>

          <BaseSelect
            v-if="!isAddingNewSupplier"
            v-model="localOrder.supplier"
            :options="supplierOptions"
            placeholder="Оберіть..."
          />
          <div v-else class="inline-supplier-input-block">
            <BaseInput v-model="newSupplierName" placeholder="Назва..." @keyup.enter="handleAddNewSupplier" />
            <BaseButton variant="secondary" @click="handleAddNewSupplier">Додати</BaseButton>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Дата замовлення</label>
          <BaseInput type="date" v-model="localOrder.date" />
        </div>
      </div>

      <div class="items-section">
        <p class="section-subtitle">СПИСОК ТОВАРІВ</p>

        <div class="items-blank-list">
          <div v-for="(item, index) in localOrder.items" :key="index" class="form-item-row">
            <div class="fg-name">
              <BaseSelect
                v-model="item.product_id"
                :options="productOptions"
                placeholder="Оберіть товар..."
                @update:modelValue="handleProductChange(item)"
              />
            </div>
            <div class="fg-qty">
              <BaseInput type="number" v-model.number="item.qty" min="1" placeholder="К-сть" />
            </div>
            <div class="fg-price">
              <BaseInput type="number" v-model.number="item.price" min="0" placeholder="Ціна" />
            </div>
            <div class="fg-action">
              <button class="remove-item-btn" @click="removeFormItem(index)" :disabled="localOrder.items.length === 1">
                ×
              </button>
            </div>
          </div>
        </div>

        <button class="add-row-btn" type="button" @click="addFormItem">+ Додати товарну позицію</button>
      </div>

      <div class="modal-footer">
        <div class="form-grand-total">
          <span class="total-label">РАЗОМ ДО ОПЛАТИ:</span>
          <span class="total-sum-value">{{ formatCurrency(formTotalSum, 'UAH') }}</span>
        </div>
        <div class="footer-actions">
          <BaseButton variant="secondary" @click="emit('close')">Скасувати</BaseButton>
          <BaseButton variant="primary" @click="submitForm" :disabled="!isFormValid">
            Зберегти
          </BaseButton>
        </div>
      </div>

    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { formatCurrency } from '@/utils/formatters'
import { useCartStore } from '@/stores/pos'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'

const props = defineProps({
  isOpen: Boolean,
  editMode: Boolean,
  orderData: Object,
  suppliers: Array
})

const emit = defineEmits(['close', 'save', 'add-supplier'])
const cartStore = useCartStore()

const isAddingNewSupplier = ref(false)
const newSupplierName = ref('')

const localOrder = ref({
  supplier: '',
  date: new Date().toISOString().split('T')[0],
  items: [{ product_id: '', qty: 1, price: 0 }]
})

watch(() => props.orderData, (newData) => {
  if (props.editMode && newData) {
    localOrder.value = {
      supplier: newData.supplier || '',
      date: newData.date ? String(newData.date).split('T')[0] : new Date().toISOString().split('T')[0],
      items: newData.items && newData.items.length > 0
        ? newData.items.map(item => ({
            product_id: item.product ? Number(item.product) : '',
            qty: Number(item.qty || item.quantity || 1),
            price: Number(item.price || 0)
          }))
        : [{ product_id: '', qty: 1, price: 0 }]
    }
  } else if (!props.editMode) {
    localOrder.value = {
      supplier: '',
      date: new Date().toISOString().split('T')[0],
      items: [{ product_id: '', qty: 1, price: 0 }]
    }
  }
}, { immediate: true })

onMounted(async () => {
  if (cartStore.products.length === 0) {
    await cartStore.fetchProducts()
  }
})

// === АВТОМАТИЧНЕ ПІДСТАВЛЕННЯ ЦІНИ ===
const handleProductChange = (item) => {
  if (!item.product_id) return

  // Шукаємо обраний товар у каталозі
  const product = cartStore.products.find(p => p.id === item.product_id)

  if (product) {
    // Підставляємо закупівельну ціну (purchase_price). Якщо її нема - звичайну ціну, або 0.
    item.price = Number(product.purchase_price || product.price || 0)
  }
}

const supplierOptions = computed(() => {
  const opts = props.suppliers.map(s => ({ value: s, label: s }))
  if (localOrder.value.supplier && !props.suppliers.includes(localOrder.value.supplier)) {
    opts.unshift({ value: localOrder.value.supplier, label: localOrder.value.supplier })
  }
  return opts
})

const productOptions = computed(() => cartStore.products.map(p => ({ value: p.id, label: p.title || p.name })))

const handleAddNewSupplier = () => {
  const cleanName = newSupplierName.value.trim()
  if (!cleanName) return
  emit('add-supplier', cleanName)
  localOrder.value.supplier = cleanName
  newSupplierName.value = ''
  isAddingNewSupplier.value = false
}

const addFormItem = () => localOrder.value.items.push({ product_id: '', qty: 1, price: 0 })
const removeFormItem = (index) => { if (localOrder.value.items.length > 1) localOrder.value.items.splice(index, 1) }

const formTotalSum = computed(() => localOrder.value.items.reduce((sum, item) => sum + (item.qty * item.price || 0), 0))

const isFormValid = computed(() => {
  return localOrder.value.supplier !== '' && localOrder.value.items.every(i => i.product_id !== '' && i.qty > 0)
})

const submitForm = () => {
  if (!isFormValid.value) return
  const payload = {
    comment_ttn: `Постачальник: ${localOrder.value.supplier} | Дата: ${localOrder.value.date}`,
    total_amount: formTotalSum.value,
    items: localOrder.value.items.map(i => ({ product: i.product_id, quantity: i.qty, price: i.price }))
  }
  emit('save', payload)
}
</script>

<style scoped>
* { box-sizing: border-box; }

.purchase-modal-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.form-row-top {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
.form-group {
  flex: 1 1 200px;
}

.form-label { font-size: 0.8rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; display: block; }
.supplier-label-container { display: flex; justify-content: space-between; align-items: center; }
.inline-add-btn { background: transparent; border: none; color: #2563eb; font-size: 0.8rem; font-weight: 600; cursor: pointer; padding: 0; }
.inline-supplier-input-block { display: flex; gap: 8px; align-items: flex-end; }
.section-subtitle { font-size: 0.75rem; font-weight: 700; color: #94a3b8; letter-spacing: 0.08em; margin-bottom: 12px; }

.items-blank-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 68px;
}

.form-item-row {
  display: flex;
  flex-wrap: nowrap;
  gap: 12px; /* Збільшили відступ між колонками */
  background: #f8fafc;
  padding: 12px 16px; /* Збільшили внутрішні відступи */
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  align-items: center;
}

.fg-name { flex: 1 1 140px; min-width: 0; }
.fg-qty { width: 75px; flex: 0 0 75px; min-width: 0; }
.fg-price { width: 100px; flex: 0 0 100px; min-width: 0; } /* Розширили поле ціни */
.fg-action { width: 32px; flex: 0 0 32px; display: flex; justify-content: flex-end; }

.fg-qty :deep(input), .fg-price :deep(input) {
  min-width: 0 !important;
  width: 100% !important;
  padding: 8px !important; /* Робимо текст трохи вільнішим всередині інпута */
}

.remove-item-btn { background: #fef2f2; border: 1px solid #fca5a5; color: #ef4444; width: 32px; height: 32px; border-radius: 6px; font-size: 1.2rem; cursor: pointer; display: flex; justify-content: center; align-items: center; transition: all 0.2s; padding: 0; margin: 0; }
.remove-item-btn:hover:not(:disabled) { background: #fee2e2; }
.remove-item-btn:disabled { opacity: 0.4; cursor: not-allowed; border-color: #f87171; }

.add-row-btn { display: inline-flex; align-items: center; justify-content: center; background: transparent; border: 1px dashed #cbd5e1; color: #2563eb; padding: 12px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; margin-top: 8px; width: 100%; }
.add-row-btn:hover { background-color: #eff6ff; border-color: #2563eb; }

.modal-footer { padding-top: 24px; border-top: 1px solid #e2e8f0; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; margin-top: 12px; gap: 16px; }
.form-grand-total { display: flex; flex-direction: column; }
.total-label { font-size: 0.7rem; color: #64748b; font-weight: 700; letter-spacing: 0.05em; }
.total-sum-value { font-size: 1.4rem; font-weight: 700; color: #2563eb; margin-top: 4px; }
.footer-actions { display: flex; gap: 12px; }
</style>
