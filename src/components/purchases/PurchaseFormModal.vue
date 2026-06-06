<template>
  <BaseModal :is-open="isOpen" @close="emit('close')" :title="editMode ? 'Редагувати замовлення' : 'Нове замовлення'">
    <div class="purchase-modal-wrapper">

      <div class="form-row-top">
        <div class="form-group">
          <div class="supplier-label-container">
            <label class="form-label">Постачальник</label>
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
            <BaseInput v-model="newSupplierName" label="" placeholder="Назва..." @keyup.enter="handleAddNewSupplier" />
            <BaseButton variant="secondary" @click="handleAddNewSupplier">Додати</BaseButton>
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
                    <select v-model="filters.category" @change="onCategoryChange" class="dropdown-category-select">
                      <option value="">Всі категорії</option>
                      <option v-for="c in categoriesStore.categories" :key="c.id" :value="c.id">{{ c.name }}</option>
                    </select>
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
import { useCategoriesStore } from '@/stores/categories'

const props = defineProps({
  isOpen: Boolean,
  editMode: Boolean,
  orderData: Object,
  suppliers: Array
})

const emit = defineEmits(['close', 'save', 'add-supplier'])
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

const isProductModalOpen = ref(false)
const targetItemRow = ref(null)

const openProductModal = (item) => {
  targetItemRow.value = item
  isProductModalOpen.value = true
}

const onProductCreated = async (newProduct) => {
  // Додаємо створений товар в локальний список cartStore, щоб він одразу з'явився в опціях
  if (!cartStore.products.find(p => p.id === newProduct.id)) {
    cartStore.products.unshift(newProduct)
  }
  
  // Якщо створення викликано для конкретного рядка (якого вже немає, бо кнопка зверху), 
  // але ми можемо підставити його в порожній рядок
  const emptyRow = localOrder.value.items.find(i => !i.product_id)
  if (emptyRow) {
    emptyRow.product_id = newProduct.id
    handleProductChange(emptyRow)
  } else {
    // Або створюємо новий рядок
    const newItem = { product_id: newProduct.id, qty: 1, price: 0 }
    localOrder.value.items.push(newItem)
    handleProductChange(newItem)
  }
}

const isAddingNewSupplier = ref(false)
const newSupplierName = ref('')

const localOrder = ref({
  supplier: '',
  date: new Date().toISOString().split('T')[0],
  items: [{ product_id: '', qty: 1, price: 0 }]
})

watch(() => props.orderData, (newData) => {
  if (props.editMode && newData) {
    // Трансформуємо дату правильно: якщо це об'єкт Date, то .toISOString()
    let dateStr = ''
    if (newData.date) {
      const dateObj = new Date(newData.date)
      dateStr = dateObj.toISOString().split('T')[0]
    } else {
      dateStr = new Date().toISOString().split('T')[0]
    }
    
    localOrder.value = {
      supplier: newData.supplier || '',
      date: dateStr,
      items: newData.items && Array.isArray(newData.items) && newData.items.length > 0
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
  if (categoriesStore.categories.length === 0) {
    categoriesStore.fetchList()
  }
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

const validItems = computed(() => localOrder.value.items.filter(i => i.product_id !== '' && i.qty > 0))

const isFormValid = computed(() => {
  return validItems.value.length > 0
})

const submitDraft = () => {
  const payload = {
    comment_ttn: localOrder.value.supplier
      ? `Постачальник: ${localOrder.value.supplier} | Дата: ${localOrder.value.date}`
      : `Дата: ${localOrder.value.date}`,
    total_amount: formTotalSum.value,
    items: validItems.value.map(i => ({ product: i.product_id, quantity: i.qty, price: i.price }))
  }
  if (localOrder.value.supplier) {
    payload.supplier = localOrder.value.supplier
  }
  emit('save', payload)
}

const submitConfirm = () => {
  if (!isFormValid.value) return
  const payload = {
    comment_ttn: localOrder.value.supplier
      ? `Постачальник: ${localOrder.value.supplier} | Дата: ${localOrder.value.date}`
      : `Дата: ${localOrder.value.date}`,
    total_amount: formTotalSum.value,
    items: validItems.value.map(i => ({ product: i.product_id, quantity: i.qty, price: i.price })),
    status: 'pending' // TODO: or 'received' depending on logic, for now draft is enough, emit 'save-confirm' if supported. Wait, ProcurementView just handles 'save' as draft.
  }
  if (localOrder.value.supplier) {
    payload.supplier = localOrder.value.supplier
  }
  // If ProcurementView doesn't handle save-confirm yet, we just emit save for now.
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

.product-dropdown-filters { padding: 8px; border-bottom: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 8px; background: #f8fafc; }
.dropdown-search-input, .dropdown-category-select { width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; font-size: 0.85rem; }
.dropdown-search-input:focus, .dropdown-category-select:focus { border-color: #2563eb; }
</style>
