<!-- src/components/purchases/PurchaseFormModal.vue -->
<script setup>
import { ref, computed, onMounted } from 'vue'
import { formatCurrency } from '@/utils/formatters'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  editMode: { type: Boolean, default: false },
  orderData: { type: Object, default: null },
  suppliers: { type: Array, required: true }
})

const emit = defineEmits(['close', 'save', 'add-supplier'])

const isAddingNewSupplier = ref(false)
const newSupplierName = ref('')

const localOrder = ref({
  supplier: '',
  date: new Date().toISOString().split('T')[0],
  items: [{ name: '', qty: 1, price: 0 }]
})

onMounted(() => {
  if (props.editMode && props.orderData) {
    localOrder.value = {
      supplier: props.orderData.supplier,
      date: props.orderData.date,
      items: props.orderData.items.map(item => ({ ...item }))
    }
  }
})

const handleAddNewSupplier = () => {
  const cleanName = newSupplierName.value.trim()
  if (!cleanName) return
  
  emit('add-supplier', cleanName)
  localOrder.value.supplier = cleanName
  
  newSupplierName.value = ''
  isAddingNewSupplier.value = false
}

const addFormItem = () => {
  localOrder.value.items.push({ name: '', qty: 1, price: 0 })
}

const removeFormItem = (index) => {
  if (localOrder.value.items.length > 1) {
    localOrder.value.items.splice(index, 1)
  }
}

const formTotalSum = computed(() => {
  return localOrder.value.items.reduce((sum, item) => sum + (item.qty * item.price || 0), 0)
})

const submitForm = () => {
  if (!localOrder.value.supplier) return alert('Оберіть або додайте постачальника')
  emit('save', localOrder.value)
}
</script>

<template>
  <transition name="modal">
    <div v-if="props.isOpen" class="modal-overlay" @click.self="emit('close')">
      <div class="modal-window">
        <div class="modal-header">
          <div>
            <h2>{{ props.editMode ? 'Редагувати замовлення' : 'Нове замовлення постачальнику' }}</h2>
            <p class="modal-header-sub">Заповніть дані та перелік товарів для постачання</p>
          </div>
          <button class="close-modal-btn" @click="emit('close')">✕</button>
        </div>

        <div class="modal-body">
          <div class="form-row-top">
            
            <div class="form-group">
              <div class="supplier-label-container">
                <label>Постачальник</label>
                <button type="button" class="inline-add-btn" @click="isAddingNewSupplier = !isAddingNewSupplier">
                  {{ isAddingNewSupplier ? '← До списку' : '+ Новий постачальник' }}
                </button>
              </div>

              <div v-if="!isAddingNewSupplier" class="select-wrapper">
                <select v-model="localOrder.supplier" class="form-select">
                  <option value="" disabled>Оберіть постачальника з переліку...</option>
                  <option v-for="s in props.suppliers" :key="s" :value="s">{{ s }}</option>
                </select>
              </div>

              <div v-else class="inline-supplier-input-block">
                <input 
                  type="text" 
                  v-model="newSupplierName" 
                  placeholder="Введіть назву компанії..." 
                  class="form-input"
                  @keyup.enter="handleAddNewSupplier"
                />
                <button type="button" class="btn-confirm-supplier" @click="handleAddNewSupplier">
                  Додати
                </button>
              </div>
            </div>

            <div class="form-group">
              <label>Дата замовлення</label>
              <input type="date" v-model="localOrder.date" class="form-input date-input" />
            </div>
          </div>

          <div class="items-section">
            <p class="section-subtitle">СПИСОК ТОВАРІВ ДЛЯ ЗАКУПІВЛІ</p>
            
            <div class="items-table-header">
              <span class="th-name">Назва товару / Артикул</span>
              <span class="th-qty text-center">К-сть</span>
              <span class="th-price class-right">Ціна закупівлі</span>
              <span class="th-total class-right">Загалом</span>
              <span class="th-action"></span>
            </div>

            <div class="items-blank-list">
              <div v-for="(item, index) in localOrder.items" :key="index" class="form-item-row">
                <div class="fg-name">
                  <input type="text" v-model="item.name" placeholder="Наприклад, iPhone 15 Pro Max..." class="form-table-input" />
                </div>
                <div class="fg-qty">
                  <input type="number" v-model.number="item.qty" min="1" class="form-table-input text-center" />
                </div>
                <div class="fg-price">
                  <div class="price-input-wrapper">
                    <input type="number" v-model.number="item.price" min="0" class="form-table-input text-right" />
                    <span class="currency-inside">₴</span>
                  </div>
                </div>
                <div class="fg-total text-right font-bold">
                  {{ formatCurrency(item.qty * item.price || 0, 'UAH') }}
                </div>
                <div class="fg-action">
                  <button class="remove-item-btn" @click="removeFormItem(index)" :disabled="localOrder.items.length === 1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
              </div>
            </div>

            <button class="add-row-btn" @click="addFormItem">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Додати товарну позицію
            </button>
          </div>
        </div>

        <div class="modal-footer">
          <div class="form-grand-total">
            <span class="total-label">РАЗОМ ДО ОПЛАТИ</span>
            <span class="total-sum-value">{{ formatCurrency(formTotalSum, 'UAH') }}</span>
          </div>
          <div class="footer-actions">
            <button class="btn-secondary" @click="emit('close')">Скасувати</button>
            <BaseButton variant="primary" @click="submitForm">
              {{ props.editMode ? 'Зберегти зміни' : 'Створити чернетку' }}
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.3); backdrop-filter: blur(4px); z-index: 999; display: flex; justify-content: center; align-items: center; }
.modal-window { background: white; border-radius: 16px; width: 840px; max-width: 95%; max-height: 85vh; display: flex; flex-direction: column; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15); border: 1px solid #e2e8f0; }
.modal-header { padding: 24px 32px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
.modal-header h2 { font-size: 1.35rem; margin: 0 0 4px 0; color: #0f172a; font-weight: 700; letter-spacing: -0.01em; }
.modal-header-sub { margin: 0; font-size: 0.85rem; color: #64748b; }
.close-modal-btn { background: #f1f5f9; border: none; font-size: 0.9rem; color: #64748b; cursor: pointer; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.close-modal-btn:hover { background: #e2e8f0; color: #0f172a; }
.modal-body { padding: 32px; overflow-y: auto; flex: 1; }
.form-row-top { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-bottom: 32px; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-group label { font-size: 0.8rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; }
.supplier-label-container { display: flex; justify-content: space-between; align-items: center; }
.inline-add-btn { background: transparent; border: none; color: #2563eb; font-size: 0.8rem; font-weight: 600; cursor: pointer; padding: 0; transition: color 0.15s ease; }
.inline-add-btn:hover { color: #1d4ed8; text-decoration: underline; }
.inline-supplier-input-block { display: flex; gap: 8px; width: 100%; }
.inline-supplier-input-block .form-input { flex: 1; }
.btn-confirm-supplier { background-color: #f1f5f9; border: 1px solid #cbd5e1; color: #1e293b; padding: 0 16px; border-radius: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.15s; }
.btn-confirm-supplier:hover { background-color: #e2e8f0; color: #0f172a; }
.form-input, .form-select { width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem; color: #1e293b; outline: none; background-color: #ffffff; transition: all 0.2s; }
.form-input:focus, .form-select:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
.date-input { color: #334155; font-weight: 500; }
.items-section { display: flex; flex-direction: column; }
.section-subtitle { font-size: 0.75rem; font-weight: 700; color: #94a3b8; letter-spacing: 0.08em; margin-bottom: 16px; }
.items-table-header { display: flex; align-items: center; gap: 16px; padding: 0 12px 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 0.75rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
.th-name { flex: 1; }
.th-qty { width: 80px; }
.th-price { width: 140px; text-align: right; }
.th-total { width: 120px; text-align: right; }
.th-action { width: 32px; }
.items-blank-list { display: flex; flex-direction: column; gap: 10px; margin-top: 10px; max-height: 240px; overflow-y: auto; }
.form-item-row { display: flex; align-items: center; gap: 16px; padding: 6px 12px; background: #ffffff; border-bottom: 1px solid #f1f5f9; }
.fg-name { flex: 1; }
.fg-qty { width: 80px; }
.fg-price { width: 140px; }
.fg-total { width: 120px; font-size: 0.95rem; color: #0f172a; }
.fg-action { width: 32px; display: flex; justify-content: center; }
.form-table-input { width: 100%; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.9rem; outline: none; color: #0f172a; background-color: #f8fafc; transition: all 0.15s; }
.form-table-input:focus { background-color: #ffffff; border-color: #2563eb; box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.08); }
.price-input-wrapper { position: relative; display: flex; align-items: center; }
.price-input-wrapper .form-table-input { padding-right: 24px; }
.currency-inside { position: absolute; right: 12px; font-size: 0.85rem; color: #94a3b8; font-weight: 500; pointer-events: none; }
.remove-item-btn { background: transparent; border: none; color: #94a3b8; cursor: pointer; width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.remove-item-btn:hover:not(:disabled) { background: #fef2f2; color: #ef4444; }
.remove-item-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.add-row-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: #ffffff; border: 1px dashed #cbd5e1; color: #2563eb; padding: 12px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; margin-top: 14px; }
.add-row-btn:hover { background-color: #eff6ff; border-color: #2563eb; }
.modal-footer { padding: 24px 32px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border-bottom-left-radius: 16px; border-bottom-right-radius: 16px; }
.form-grand-total { display: flex; flex-direction: column; }
.total-label { font-size: 0.7rem; color: #64748b; font-weight: 700; letter-spacing: 0.05em; }
.total-sum-value { font-size: 1.4rem; font-weight: 700; color: #2563eb; margin-top: 2px; }
.footer-actions { display: flex; gap: 12px; }
.btn-secondary { background: white; border: 1px solid #cbd5e1; color: #475569; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: background 0.15s; }
.btn-secondary:hover { background: #f1f5f9; }

.modal-enter-active, .modal-leave-active { transition: opacity 0.3s ease, backdrop-filter 0.3s ease; }
.modal-enter-active .modal-window, .modal-leave-active .modal-window { transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; backdrop-filter: blur(0px); }
.modal-enter-from .modal-window, .modal-leave-to .modal-window { opacity: 0; transform: scale(0.96) translateY(16px); }
</style>