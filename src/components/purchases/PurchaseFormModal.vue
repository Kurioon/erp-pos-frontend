<template>
  <BaseModal :is-open="isOpen" @close="emit('close')" :title="editMode ? 'Редагувати замовлення' : 'Нове замовлення'">
    <div class="purchase-modal-wrapper">

      <div v-if="relatedSourceLabel" class="backorder-banner">
        🔗 Ця закупівля виконується під {{ relatedSourceLabel }}
      </div>

      <div class="form-row-top">
        <div class="form-group">
          <CounterpartySelect
            v-if="!fixedSupplierId"
            v-model="localOrder.counterparty"
            label="Контрагент (Постачальник)"
            role-filter="supplier"
          />
          <div v-else class="supplier-locked">
            <label class="locked-label">Постачальник (зафіксовано)</label>
            <div class="locked-value">Обраний постачальник</div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Дата замовлення</label>
          <BaseInput type="date" v-model="localOrder.date" label="" />
        </div>
      </div>

      <div class="items-section">
        <div style="display: flex; justify-content: flex-end; margin-bottom: 12px;">
          <BaseButton variant="primary" @click.stop="openProductModal(null)">
            + Додати товар
          </BaseButton>
        </div>

        <div class="items-blank-list">
          <div v-for="(item, index) in localOrder.items" :key="index" class="form-item-row">
            <div class="fg-name">
              <BaseSelect
                v-model="item.product_id"
                :options="productOptions"
                placeholder="Оберіть товар..."
                @update:modelValue="handleProductChange(item)"
              >
                <template #header>
                  <div class="product-dropdown-filters">
                    <input 
                      type="text" 
                      v-model="filters.search" 
                      @input="onSearchInput" 
                      placeholder="Пошук товару..." 
                      class="dropdown-search-input"
                    />
                    <BaseSelect 
                      v-model="filters.category" 
                      :options="purchaseCategoryOptions" 
                      @change="onCategoryChange" 
                    />
                  </div>
                </template>
              </BaseSelect>
            </div>
            
            <div class="row-bottom">
              <div class="fg-qty">
                <BaseInput type="number" v-model.number="item.qty" min="1" placeholder="К-сть" label="" />
              </div>
              <div class="fg-price">
                <BaseInput type="number" v-model.number="item.price" min="0" placeholder="Ціна" label="" />
              </div>
              <div class="fg-action">
                <button class="remove-item-btn" @click="removeFormItem(index)" :disabled="localOrder.items.length === 1">
                  ×
                </button>
              </div>
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
          <BaseButton variant="secondary" @click="submitDraft">Зберегти чернетку</BaseButton>
          <div style="position: relative; display: inline-block;" :title="!isFormValid ? 'Додайте хоча б один товар' : ''">
            <BaseButton variant="primary" @click="submitConfirm" :disabled="!isFormValid">
              Підтвердити
            </BaseButton>
          </div>
        </div>
      </div>

    </div>

    <ProductFormModal
      v-if="isProductModalOpen"
      :is-open="isProductModalOpen"
      @close="isProductModalOpen = false"
      @save="onProductCreated"
    />
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
import FilterBar from '@/components/ui/FilterBar.vue'
import ProductFormModal from '@/components/warehouses/ProductFormModal.vue'
import CounterpartySelect from '@/components/counterparties/CounterpartySelect.vue'
import { useCategoriesStore } from '@/stores/categories'

const props = defineProps({
  isOpen: Boolean,
  editMode: Boolean,
  orderData: Object,
  fixedSupplierId: { type: Number, default: null },
  // Сценарій 2 (Backordering): прив'язка до джерела
  relatedRetailOrderId: { type: Number, default: null },
  relatedServiceJobId: { type: Number, default: null },
  relatedSourceLabel: { type: String, default: '' }
})

const emit = defineEmits(['close', 'save'])
const cartStore = useCartStore()
const categoriesStore = useCategoriesStore()

const filters = ref({
  search: '',
  category: ''
})

let searchTimeout = null
const onSearchInput = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    cartStore.fetchProducts(1, filters.value)
  }, 300)
}

const onCategoryChange = () => {
  cartStore.fetchProducts(1, filters.value)
}

const purchaseCategoryOptions = computed(() => {
  const opts = [{ value: '', label: 'Всі категорії' }]
  categoriesStore.categories.forEach(c => {
    opts.push({ value: c.id, label: c.name })
  })
  return opts
})

const isProductModalOpen = ref(false)
const targetItemRow = ref(null)

const openProductModal = (item) => {
  targetItemRow.value = item
  isProductModalOpen.value = true
}

const onProductCreated = async (newProduct) => {
  if (!cartStore.products.find(p => p.id === newProduct.id)) {
    cartStore.products.unshift(newProduct)
  }
  
  const emptyRow = localOrder.value.items.find(i => !i.product_id)
  if (emptyRow) {
    emptyRow.product_id = newProduct.id
    handleProductChange(emptyRow)
  } else {
    const newItem = { product_id: newProduct.id, qty: 1, price: 0 }
    localOrder.value.items.push(newItem)
    handleProductChange(newItem)
  }
}

const localOrder = ref({
  counterparty: props.fixedSupplierId || '',
  date: new Date().toISOString().split('T')[0],
  items: [{ product_id: '', qty: 1, price: 0 }]
})

watch(() => props.orderData, (newData) => {
  if (props.editMode && newData) {
    let dateStr = ''
    if (newData.date) {
      const dateObj = new Date(newData.date)
      dateStr = dateObj.toISOString().split('T')[0]
    } else {
      dateStr = new Date().toISOString().split('T')[0]
    }
    
    localOrder.value = {
      counterparty: props.fixedSupplierId || newData.counterparty || '',
      date: dateStr,
      items: newData.items && Array.isArray(newData.items) && newData.items.length > 0
        ? newData.items.map(item => ({
            product_id: item.product,
            qty: item.quantity,
            price: Number(item.price)
          }))
        : [{ product_id: '', qty: 1, price: 0 }]
    }
  } else if (!props.editMode) {
    localOrder.value = {
      counterparty: props.fixedSupplierId || '',
      date: new Date().toISOString().split('T')[0],
      items: [{ product_id: '', qty: 1, price: 0 }]
    }
  }
}, { immediate: true })

onMounted(async () => {
  if (categoriesStore.categories.length === 0) {
    categoriesStore.fetchList()
  }
  if (cartStore.products.length === 0) {
    await cartStore.fetchProducts()
  }
})

const handleProductChange = (item) => {
  if (!item.product_id) return
  const product = cartStore.products.find(p => p.id === item.product_id)
  if (product) {
    item.price = Number(product.purchase_price || product.price || 0)
  }
}

const productOptions = computed(() => cartStore.products.map(p => ({ value: p.id, label: p.title || p.name })))

const addFormItem = () => localOrder.value.items.push({ product_id: '', qty: 1, price: 0 })
const removeFormItem = (index) => { if (localOrder.value.items.length > 1) localOrder.value.items.splice(index, 1) }

const formTotalSum = computed(() => localOrder.value.items.reduce((sum, item) => sum + (item.qty * item.price || 0), 0))

const validItems = computed(() => localOrder.value.items.filter(i => i.product_id !== '' && i.qty > 0))

const isFormValid = computed(() => {
  return validItems.value.length > 0
})

const applyRelations = (payload) => {
  if (props.relatedRetailOrderId) payload.related_retail_order = props.relatedRetailOrderId
  if (props.relatedServiceJobId) payload.related_service_job = props.relatedServiceJobId
  return payload
}

const submitDraft = () => {
  const payload = applyRelations({
    total_amount: formTotalSum.value,
    items: validItems.value.map(i => ({ product: i.product_id, quantity: i.qty, price: i.price }))
  })
  if (localOrder.value.counterparty) {
    payload.counterparty = localOrder.value.counterparty
  }
  emit('save', payload)
}

const submitConfirm = () => {
  if (!isFormValid.value) return
  const payload = applyRelations({
    total_amount: formTotalSum.value,
    items: validItems.value.map(i => ({ product: i.product_id, quantity: i.qty, price: i.price })),
    status: 'pending'
  })
  if (localOrder.value.counterparty) {
    payload.counterparty = localOrder.value.counterparty
  }
  payload.auto_confirm = true
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

.items-blank-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 68px;
}

.form-item-row {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #f8fafc;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  align-items: stretch;
}

.fg-name { width: 100%; }
.row-bottom { display: flex; gap: 8px; align-items: center; justify-content: flex-end; width: 100%; }
.fg-qty { flex: 1 1 80px; max-width: 100px; min-width: 0; }
.fg-price { flex: 2 1 120px; max-width: 140px; min-width: 0; }
.fg-action { flex: 0 0 32px; display: flex; justify-content: flex-end; }

.fg-qty :deep(input), .fg-price :deep(input) {
  min-width: 0 !important;
  width: 100% !important;
  padding: 8px !important;
}

.remove-item-btn { background: #fef2f2; border: 1px solid #fca5a5; color: #ef4444; width: 32px; height: 32px; border-radius: 6px; font-size: 1.2rem; cursor: pointer; display: flex; justify-content: center; align-items: center; transition: all 0.2s; padding: 0; margin: 0; }
.remove-item-btn:hover:not(:disabled) { background: #fee2e2; }
.remove-item-btn:disabled { opacity: 0.4; cursor: not-allowed; border-color: #f87171; }

.backorder-banner {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1d4ed8;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
}

.supplier-locked {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.locked-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
}
.locked-value {
  padding: 10px 16px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #475569;
  font-weight: 500;
  cursor: not-allowed;
}

.add-row-btn { display: inline-flex; align-items: center; justify-content: center; background: transparent; border: 1px dashed #cbd5e1; color: #2563eb; padding: 12px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; margin-top: 8px; width: 100%; }
.add-row-btn:hover { background-color: #eff6ff; border-color: #2563eb; }

.modal-footer { padding-top: 24px; border-top: 1px solid #e2e8f0; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; margin-top: 12px; gap: 16px; }
.form-grand-total { display: flex; flex-direction: column; }
.total-label { font-size: 0.7rem; color: #64748b; font-weight: 700; letter-spacing: 0.05em; }
.total-sum-value { font-size: 1.4rem; font-weight: 700; color: #2563eb; margin-top: 4px; }
.footer-actions { display: flex; gap: 12px; }

.product-dropdown-filters { padding: 8px; border-bottom: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 8px; background: #f8fafc; }
.dropdown-search-input, .dropdown-category-select { width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; font-size: 0.85rem; }
.dropdown-search-input:focus, .dropdown-category-select:focus { border-color: #2563eb; }
</style>
