<template>
  <BaseModal :is-open="true" @close="$emit('close')" :title="editMode ? 'Редагувати ремонт' : 'Новий ремонт'">
    <form @submit.prevent="handleSubmit" class="repair-form">
      <div class="form-group device-selection">
        <label class="form-label">Пристрій *</label>

        <div v-if="formData.device || formData.device_name" class="selected-device-card">
          <div class="device-info">
             <IconBox class="device-icon" />
             <span class="device-name">{{ formData.device_name }}</span>
          </div>
          <button type="button" class="change-btn" @click="clearDevice">Змінити</button>
        </div>

        <div v-else class="device-search-area" ref="deviceSearchRef">
          <div class="search-controls" @click="isDropdownOpen = true">
            <BaseInput v-model="searchQuery" placeholder="Пошук по назві..." @update:modelValue="onSearchInput" />
            <BaseSelect v-model="searchCategory" :options="categoryOptions" placeholder="Всі категорії" @update:modelValue="searchProducts" />
          </div>

          <div class="search-results-box" v-if="isDropdownOpen">
            <div class="search-status" v-if="isSearching">
              <span class="text-muted">Завантаження...</span>
            </div>
            <ul class="results-list" v-else-if="searchResults.length > 0">
              <li v-for="product in searchResults" :key="product.id" @click="selectDevice(product)" class="result-item">
                <span class="product-name">{{ product.name }}</span>
                <span class="product-code text-muted text-sm">{{ product.code }}</span>
              </li>
            </ul>
            <div class="no-results" v-else>
              <span class="text-muted">Нічого не знайдено.</span>
            </div>
            
            <div class="dropdown-footer">
              <BaseButton type="button" variant="secondary" class="create-product-btn w-100" @click.stop="isProductModalOpen = true; isDropdownOpen = false">
                + Створити новий товар
              </BaseButton>
            </div>
          </div>
        </div>
        <div v-if="isSubmitted && !formData.device && !formData.device_name" class="error-text">Обов'язкове поле</div>
      </div>

      <div class="form-row">
        <BaseInput
          v-model="formData.customer_name"
          @input="validateName"
          label="Клієнт *"
          placeholder="ПІБ клієнта"
          :error="customerNameError"
        />
        <BaseInput
          v-model="formData.customer_phone"
          @input="handlePhoneInput"
          label="Телефон *"
          placeholder="+380..."
          :error="isSubmitted && !formData.customer_phone ? 'Обов\'язкове поле' : errors.customer_phone"
        />
      </div>

      <BaseInput
        v-model="formData.description"
        @input="validateDescription"
        label="Несправність *"
        placeholder="Опис проблеми (мінімум 5 символів)"
        :error="descriptionError"
      />

      <div class="form-row">
        <BaseInput
          v-model="formData.storage_cell"
          @input="handleCellInput"
          label="Комірка зберігання *"
          placeholder="A1, B3..."
          :error="isSubmitted && !formData.storage_cell ? 'Обов\'язкове поле' : ''"
        />
        <BaseInput
          v-model="formData.price"
          type="number"
          label="Попередня вартість (₴)"
          placeholder="0"
        />
      </div>

      <BaseInput v-if="!editMode" label="Дата та час прийняття" :model-value="currentDate" disabled />

      <div class="modal-actions">
        <BaseButton variant="secondary" type="button" @click="$emit('close')">Скасувати</BaseButton>
        <BaseButton variant="primary" type="submit" :disabled="hasErrors">
          {{ editMode ? 'Зберегти зміни' : 'Прийняти' }}
        </BaseButton>
      </div>
    </form>

    <ProductFormModal
      v-if="isProductModalOpen"
      :is-open="isProductModalOpen"
      @close="isProductModalOpen = false"
      @save="handleProductCreated"
    />
  </BaseModal>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import ProductFormModal from '@/components/warehouses/ProductFormModal.vue'
import IconBox from '@/components/icons/IconBox.vue'
import { useCategoriesStore } from '@/stores/categories'
import api from '@/api/axios'

const props = defineProps({
  editMode: Boolean,
  jobData: Object
})

const emit = defineEmits(['close', 'submit'])

const categoriesStore = useCategoriesStore()

const formData = ref({
  device: null,
  device_name: '',
  customer_name: '',
  customer_phone: '+380',
  description: '',
  storage_cell: '',
  price: ''
})

const errors = ref({ customer_name: '', customer_phone: '', description: '' })
const isSubmitted = ref(false)

const currentDate = new Date().toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

watch(() => props.jobData, (newJob) => {
  if (props.editMode && newJob) {
    formData.value = { ...newJob }
  } else {
    formData.value.customer_phone = '+380'
    formData.value.device = null
    formData.value.device_name = ''
  }
}, { immediate: true })

const categoryOptions = computed(() => {
  return [
    { value: '', label: 'Всі категорії' },
    ...categoriesStore.categories.map(c => ({ value: c.id, label: c.name }))
  ]
})

const searchQuery = ref('')
const searchCategory = ref('')
const searchResults = ref([])
const isSearching = ref(false)
const isProductModalOpen = ref(false)
const isDropdownOpen = ref(false)
const deviceSearchRef = ref(null)

let searchTimeout = null
const onSearchInput = () => {
  isDropdownOpen.value = true
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(searchProducts, 300)
}

const searchProducts = async () => {
  isSearching.value = true
  try {
    const params = {}
    if (searchQuery.value) params.search = searchQuery.value
    if (searchCategory.value) params.category = searchCategory.value

    const response = await api.get('/products/', { params })
    searchResults.value = response.data.results || response.data || []
  } catch(e) {
    console.error('Error fetching products', e)
  } finally {
    isSearching.value = false
  }
}

const selectDevice = (product) => {
  formData.value.device = product.id
  formData.value.device_name = product.name
  searchQuery.value = ''
  searchCategory.value = ''
  searchResults.value = []
}

const clearDevice = () => {
  formData.value.device = null
  formData.value.device_name = ''
}

const handleProductCreated = (product) => {
  selectDevice(product)
  isProductModalOpen.value = false
}

const validateName = () => {
  errors.value.customer_name = /[0-9]/.test(formData.value.customer_name) ? 'Ім\'я не може містити цифри' : ''
}

const validateDescription = () => {
  if (formData.value.description.length > 0 && formData.value.description.length < 5) {
    errors.value.description = 'Мінімум 5 символів'
  } else {
    errors.value.description = ''
  }
}

const handlePhoneInput = (event) => {
  let val = event.target.value.replace(/[^\d+]/g, '')

  if (val.length > 0 && !val.startsWith('+380')) {
    if (val.startsWith('380')) val = '+' + val
    else if (val.startsWith('0')) val = '+380' + val.slice(1)
    else val = '+380'
  }

  if (val.length > 13) val = val.slice(0, 13)

  formData.value.customer_phone = val

  if (val.length > 0 && val.length < 13) {
    errors.value.customer_phone = 'Введіть повний номер (+380...)'
  } else {
    errors.value.customer_phone = ''
  }
}

const handleCellInput = (event) => {
  let val = event.target.value.toUpperCase()
  formData.value.storage_cell = val.replace(/[^A-ZА-ЯІЇЄҐ0-9-]/g, '')
}

const customerNameError = computed(() => {
  if (errors.value.customer_name) return errors.value.customer_name
  if (isSubmitted.value && !formData.value.customer_name) return 'Обов\'язкове поле'
  return ''
})

const descriptionError = computed(() => {
  if (errors.value.description) return errors.value.description
  if (isSubmitted.value && !formData.value.description) return 'Обов\'язкове поле'
  return ''
})

const hasErrors = computed(() => errors.value.customer_name !== '' || errors.value.customer_phone !== '' || errors.value.description !== '')

const handleSubmit = () => {
  isSubmitted.value = true

  if (formData.value.description.length < 5) errors.value.description = 'Мінімум 5 символів'
  if (formData.value.customer_phone.length < 13) errors.value.customer_phone = 'Введіть повний номер (+380...)'

  if (hasErrors.value || formData.value.customer_phone.length < 13 || formData.value.description.length < 5 || (!formData.value.device && !formData.value.device_name) || !formData.value.customer_name || !formData.value.storage_cell) {
    return
  }

  const finalData = { ...formData.value }
  if (finalData.price) finalData.price = Number(finalData.price)

  emit('submit', finalData)
}

const handleKeydown = (e) => { if (e.key === 'Escape') emit('close') }
const handleOutsideClick = (e) => {
  if (isDropdownOpen.value && deviceSearchRef.value && !deviceSearchRef.value.contains(e.target)) {
    isDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('mousedown', handleOutsideClick)
  if (categoriesStore.categories.length === 0) {
    categoriesStore.fetchList()
  }
  searchProducts()
})
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('mousedown', handleOutsideClick)
})
</script>

<style scoped>
.repair-form { display: flex; flex-direction: column; gap: 16px; min-width: 400px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: start; }
.modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; }

.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 0.85rem; font-weight: 600; color: #1e293b; }
.error-text { color: #dc2626; font-size: 0.75rem; margin-top: -2px; }

.selected-device-card { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; }
.device-info { display: flex; align-items: center; gap: 10px; }
.device-icon { width: 20px; height: 20px; color: #3b82f6; }
.device-name { font-weight: 600; color: #0f172a; }
.change-btn { background: none; border: none; color: #3b82f6; font-size: 0.85rem; font-weight: 600; cursor: pointer; padding: 4px 8px; border-radius: 4px; transition: background 0.2s; }
.change-btn:hover { background: #eff6ff; }

.device-search-area { position: relative; display: flex; flex-direction: column; gap: 8px; }
.search-controls { display: grid; grid-template-columns: 2fr 1fr; gap: 8px; }
.search-results-box { position: absolute; top: 100%; left: 0; right: 0; z-index: 50; margin-top: 4px; border: 1px solid #e2e8f0; border-radius: 8px; background: white; max-height: 200px; overflow-y: auto; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
.search-status { padding: 12px; text-align: center; font-size: 0.85rem; color: #64748b; }
.results-list { list-style: none; padding: 0; margin: 0; }
.result-item { padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; border-bottom: 1px solid #f1f5f9; transition: background 0.2s; }
.result-item:last-child { border-bottom: none; }
.result-item:hover { background: #f8fafc; }
.product-name { font-weight: 500; color: #1e293b; font-size: 0.9rem; }
.text-muted { color: #64748b; }
.text-sm { font-size: 0.8rem; }
.no-results { padding: 16px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px; font-size: 0.9rem; }
.create-product-btn { padding: 6px 12px; font-size: 0.85rem; }

.dropdown-footer { padding: 8px 12px; border-top: 1px solid #f1f5f9; background: #fafafa; position: sticky; bottom: 0; }
.create-product-btn { width: 100%; justify-content: center; font-weight: 500; }

@media (max-width: 640px) { .repair-form { min-width: 100%; } .form-row { grid-template-columns: 1fr; gap: 12px; } .search-controls { grid-template-columns: 1fr; } }
</style>
