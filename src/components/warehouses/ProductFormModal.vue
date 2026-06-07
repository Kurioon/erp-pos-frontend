<template>
  <BaseModal :is-open="isOpen" @close="emit('close')" title="Новий товар">
    <div class="form-wrapper">
      <div class="form-group">
        <label class="form-label">Назва *</label>
        <BaseInput v-model="form.name" placeholder="Назва товару" />
      </div>
      <div class="form-group">
        <label class="form-label">Артикул / Код *</label>
        <BaseInput v-model="form.code" placeholder="Артикул" />
      </div>
      <div class="form-group">
        <label class="form-label">Категорія</label>
        <BaseSelect v-if="!isCreatingNewCategory" v-model="form.category" :options="categoryOptions" placeholder="Оберіть категорію...">
          <template #append>
            <div class="dropdown-footer-btn-wrapper">
              <BaseButton type="button" variant="primary" class="w-100 dropdown-new-btn" @click.stop="isCreatingNewCategory = true">
                + Створити нову категорію
              </BaseButton>
            </div>
          </template>
        </BaseSelect>
        
        <div v-else class="new-category-inline">
          <BaseInput v-model="newCategoryName" placeholder="Назва нової категорії..." autofocus />
          <BaseButton variant="primary" type="button" @click="saveNewCategory" :disabled="!newCategoryName.trim() || isSavingCategory">
             {{ isSavingCategory ? '...' : 'Додати' }}
          </BaseButton>
          <BaseButton variant="secondary" type="button" class="cancel-cat-btn" @click="cancelNewCategory">✕</BaseButton>
        </div>
      </div>
      <div class="form-row-2">
        <div class="form-group">
          <label class="form-label">Ціна *</label>
          <BaseInput v-model.number="form.base_price" type="number" step="0.01" min="0" placeholder="Ціна" />
        </div>
        <div class="form-group currency-select-group">
          <label class="form-label">Валюта</label>
          <BaseSelect v-model="form.base_currency" :options="[
            { value: 'UAH', label: '₴ (Гривня)' },
            { value: 'USD', label: '$ (Долар США)' },
            { value: 'EUR', label: '€ (Євро)' }
          ]" />
        </div>
      </div>
      
      <div class="price-preview-card" v-if="form.base_price > 0">
        <p class="preview-label">Прев'ю ціни:</p>
        <p class="preview-values">
           <span class="main-price">{{ previewUah }} ₴</span>
           <span class="other-prices">/ {{ previewUsd }} $ / {{ previewEur }} €</span>
        </p>
      </div>

      <div v-if="apiError" class="api-error-msg">{{ apiError }}</div>

      <div class="modal-actions">
        <BaseButton variant="secondary" @click="emit('close')">Скасувати</BaseButton>
        <BaseButton variant="primary" @click="submitForm" :disabled="!isFormValid || warehousesStore.isLoading">Створити товар</BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useCategoriesStore } from '@/stores/categories'
import { useWarehousesStore } from '@/stores/warehouses'
import { useExchangeRatesStore } from '@/stores/exchangeRates'

const props = defineProps({
  isOpen: Boolean
})
const emit = defineEmits(['close', 'save'])

const categoriesStore = useCategoriesStore()
const warehousesStore = useWarehousesStore()
const exchangeRatesStore = useExchangeRatesStore()

const form = ref({
  name: '',
  code: '',
  category: '',
  base_price: 0,
  base_currency: 'USD'
})

onMounted(() => {
  if (categoriesStore.categories.length === 0) {
    categoriesStore.fetchList()
  }
  if (exchangeRatesStore.rates.length === 0) {
    exchangeRatesStore.fetchRates()
  }
})

const categoryOptions = computed(() => {
  return categoriesStore.categories.map(c => ({ value: c.id, label: c.name }))
})

const isCreatingNewCategory = ref(false)
const newCategoryName = ref('')
const isSavingCategory = ref(false)

const cancelNewCategory = () => {
  isCreatingNewCategory.value = false
  newCategoryName.value = ''
  form.value.category = ''
}

const saveNewCategory = async () => {
  if (!newCategoryName.value.trim()) return
  isSavingCategory.value = true
  try {
    const newCat = await categoriesStore.create(newCategoryName.value.trim())
    isCreatingNewCategory.value = false
    newCategoryName.value = ''
    form.value.category = newCat.id
  } catch (e) {
    console.error('Помилка створення категорії', e)
  } finally {
    isSavingCategory.value = false
  }
}

const apiError = ref('')

const isFormValid = computed(() => {
  return form.value.name.trim().length > 0 && form.value.code.trim().length > 0 && form.value.base_price > 0
})

const previewUah = computed(() => {
  if (!form.value.base_price) return '0.00'
  const rate = exchangeRatesStore.getRate(form.value.base_currency)
  return (form.value.base_price * rate).toFixed(2)
})

const previewUsd = computed(() => {
  if (!form.value.base_price) return '0.00'
  const uah = Number(previewUah.value)
  const rate = exchangeRatesStore.getRate('USD')
  return rate ? (uah / rate).toFixed(2) : '0.00'
})

const previewEur = computed(() => {
  if (!form.value.base_price) return '0.00'
  const uah = Number(previewUah.value)
  const rate = exchangeRatesStore.getRate('EUR')
  return rate ? (uah / rate).toFixed(2) : '0.00'
})

const submitForm = async () => {
  if (!isFormValid.value) return
  apiError.value = ''
  const payload = {
    name: form.value.name,
    code: form.value.code,
    category: form.value.category || null,
    base_price: String(form.value.base_price),
    base_currency: form.value.base_currency
  }
  try {
    const createdProduct = await warehousesStore.createProduct(payload)
    emit('save', createdProduct)
    emit('close')
  } catch (error) {
    // Задача 5: показати помилку дубль code → 400
    const data = error.response?.data
    if (data) {
      if (data.code) {
        apiError.value = Array.isArray(data.code) ? data.code[0] : data.code
      } else if (data.detail) {
        apiError.value = data.detail
      } else {
        apiError.value = JSON.stringify(data)
      }
    } else {
      apiError.value = 'Не вдалося створити товар'
    }
  }
}
</script>

<style scoped>
.form-wrapper { display: flex; flex-direction: column; gap: 16px; width: 100%; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 0.8rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; }
.form-row-2 { display: flex; gap: 16px; }
.form-row-2 .form-group { flex: 1; }
.custom-select { width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid #cbd5e1; background-color: #ffffff; color: #0f172a; font-size: 0.95rem; outline: none; transition: border-color 0.2s; }
.custom-select:focus { border-color: #2563eb; }

.price-preview-card { background: #f8fafc; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; align-items: center; justify-content: center; margin-top: 8px; }
.preview-label { font-size: 0.75rem; color: #64748b; font-weight: 600; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.05em; }
.preview-values { margin: 0; display: flex; align-items: center; gap: 8px; }
.main-price { font-weight: 700; color: #10b981; font-size: 1.1rem; }
.other-prices { color: #64748b; font-size: 0.9rem; }

.new-category-inline {
  display: flex;
  gap: 8px;
  align-items: center;
}
.new-category-inline :deep(.input-group) {
  margin-bottom: 0;
  flex: 1;
}
.cancel-cat-btn {
  padding: 0 12px;
}

.dropdown-footer-btn-wrapper {
  padding: 8px;
  border-top: 1px solid #e2e8f0;
  background-color: #f8fafc;
  border-radius: 0 0 8px 8px;
}
.dropdown-new-btn {
  border-radius: 6px;
  font-weight: 600;
  box-shadow: none;
}
.w-100 { width: 100%; }

.modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px; padding-top: 16px; border-top: 1px solid #e2e8f0; }

.api-error-msg { background: #fef2f2; color: #dc2626; padding: 10px 14px; border-radius: 8px; font-size: 0.85rem; font-weight: 500; border: 1px solid #fca5a5; }

@media (max-width: 480px) {
  .form-row-2 { flex-direction: column; gap: 16px; }
  .modal-actions { flex-direction: column-reverse; align-items: stretch; }
  .modal-actions button { width: 100%; margin: 0; }
  .new-category-inline { flex-direction: column; align-items: stretch; }
}
</style>
