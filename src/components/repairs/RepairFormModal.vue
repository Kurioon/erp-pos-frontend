<template>
  <BaseModal :is-open="true" @close="$emit('close')" :title="editMode ? 'Редагувати ремонт' : 'Новий ремонт'">
    <form @submit.prevent="handleSubmit" class="repair-form">
      <BaseInput
        v-model="formData.device_name"
        label="Пристрій *"
        placeholder="iPhone 15, MacBook Pro..."
        :error="isSubmitted && !formData.device_name ? 'Обов\'язкове поле' : ''"
        autofocus
      />

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
  </BaseModal>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({
  editMode: Boolean,
  jobData: Object
})

const emit = defineEmits(['close', 'submit'])

const formData = ref({
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
  }
}, { immediate: true })

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

  if (hasErrors.value || formData.value.customer_phone.length < 13 || formData.value.description.length < 5 || !formData.value.device_name || !formData.value.customer_name || !formData.value.storage_cell) {
    return
  }

  const finalData = { ...formData.value }
  if (finalData.price) finalData.price = Number(finalData.price)

  emit('submit', finalData)
}

const handleKeydown = (e) => { if (e.key === 'Escape') emit('close') }
onMounted(() => document.addEventListener('keydown', handleKeydown))
onUnmounted(() => document.removeEventListener('keydown', handleKeydown))
</script>

<style scoped>
.repair-form { display: flex; flex-direction: column; gap: 16px; min-width: 400px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: start; }
.modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; }
@media (max-width: 640px) { .repair-form { min-width: 100%; } .form-row { grid-template-columns: 1fr; gap: 12px; } }
</style>
