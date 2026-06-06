<template>
  <BaseModal :is-open="isOpen" @close="emit('close')" title="Новий товар">
    <div class="form-wrapper">
      <div class="form-group">
        <label class="form-label">Назва *</label>
        <BaseInput v-model="form.name" placeholder="Назва товару" />
      </div>
      <div class="form-group">
        <label class="form-label">Артикул / Код</label>
        <BaseInput v-model="form.code" placeholder="Артикул" />
      </div>
      <div class="form-group">
        <label class="form-label">Категорія</label>
        <BaseSelect v-model="form.category" :options="categoryOptions" placeholder="Оберіть категорію..." />
      </div>
      <div class="form-row-2">
        <div class="form-group">
          <label class="form-label">Ціна *</label>
          <BaseInput v-model.number="form.base_price" type="number" step="0.01" min="0" placeholder="Ціна" />
        </div>
        <div class="form-group currency-select-group">
          <label class="form-label">Валюта</label>
          <select v-model="form.base_currency" class="custom-select">
            <option value="UAH">₴ (Гривня)</option>
            <option value="USD">$ (Долар США)</option>
            <option value="EUR">€ (Євро)</option>
          </select>
        </div>
      </div>
      
      <div class="price-preview-card" v-if="form.base_price > 0">
        <p class="preview-label">Прев'ю ціни:</p>
        <p class="preview-values">
           <span class="main-price">{{ previewUah }} ₴</span>
           <span class="other-prices">/ {{ previewUsd }} $ / {{ previewEur }} €</span>
        </p>
      </div>

      <div class="modal-actions">
        <BaseButton variant="secondary" @click="emit('close')">Скасувати</BaseButton>
        <BaseButton variant="primary" @click="submitForm" :disabled="!isFormValid || warehousesStore.isLoading">Створити товар</BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
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

const isFormValid = computed(() => {
  return form.value.name.trim().length > 0 && form.value.base_price > 0
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
  const payload = {
    name: form.value.name,
    code: form.value.code,
    category: form.value.category || null,
    base_price: String(form.value.base_price),
    base_currency: form.value.base_currency
  }
  const createdProduct = await warehousesStore.createProduct(payload)
  emit('save', createdProduct)
  emit('close')
}
</script>

<style scoped>
.form-wrapper { display: flex; flex-direction: column; gap: 16px; min-width: 380px; max-width: 100%; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 0.8rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; }
.form-row-2 { display: flex; gap: 16px; }
.form-row-2 .form-group { flex: 1; }
.custom-select { width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid #cbd5e1; background-color: #ffffff; color: #0f172a; font-size: 0.95rem; outline: none; transition: border-color 0.2s; }
.custom-select:focus { border-color: #2563eb; }

.price-preview-card { background: #f8fafc; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; align-items: center; justify-content: center; margin-top: 8px; }
.preview-label { font-size: 0.75rem; color: #64748b; font-weight: 600; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.05em; }
.preview-values { margin: 0; font-family: monospace; display: flex; align-items: baseline; gap: 8px; }
.main-price { font-size: 1.25rem; font-weight: 700; color: #2563eb; }
.other-prices { font-size: 0.9rem; color: #94a3b8; }

.modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
</style>
