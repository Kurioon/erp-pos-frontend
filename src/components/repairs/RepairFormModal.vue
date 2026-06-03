<template>
  <BaseModal :is-open="true" @close="$emit('close')" title="Новий ремонт">
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
          @input="validatePhone"
          label="Телефон *"
          placeholder="+380..."
          :error="isSubmitted && !formData.customer_phone ? 'Обов\'язкове поле' : errors.customer_phone"
        />
      </div>

      <BaseInput
        v-model="formData.description"
        label="Несправність *"
        placeholder="Опис проблеми"
        :error="isSubmitted && !formData.description ? 'Обов\'язкове поле' : ''"
      />

      <div class="form-row">
        <BaseInput
          v-model="formData.storage_cell"
          label="Комірка зберігання *"
          placeholder="A1, B3, R5..."
          :error="isSubmitted && !formData.storage_cell ? 'Обов\'язкове поле' : ''"
        />
        <BaseInput
          v-model.number="formData.price"
          type="number"
          label="Попередня вартість (₴)"
          placeholder="0"
        />
      </div>

      <BaseInput label="Дата та час прийняття" :model-value="currentDate" disabled />

      <div class="modal-actions">
        <BaseButton variant="secondary" type="button" @click="$emit('close')">Скасувати</BaseButton>
        <BaseButton variant="primary" type="submit" :disabled="hasErrors">Прийняти</BaseButton>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const emit = defineEmits(['close', 'submit'])

const formData = ref({ device_name: '', customer_name: '', customer_phone: '', description: '', storage_cell: '', price: '' })
const errors = ref({ customer_name: '', customer_phone: '' })
const isSubmitted = ref(false)

const currentDate = new Date().toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

const validateName = () => { errors.value.customer_name = /[0-9]/.test(formData.value.customer_name) ? 'Ім\'я не може містити цифри' : '' }
const validatePhone = () => {
  const phone = formData.value.customer_phone
  errors.value.customer_phone = (/[^\d\s+\-()]/.test(phone) && phone !== '') ? 'Лише цифри та символи +, -, ()' : ''
}

const customerNameError = computed(() => {
  if (errors.value.customer_name) return errors.value.customer_name
  if (isSubmitted.value && !formData.value.customer_name) return 'Обов\'язкове поле'
  return ''
})

const hasErrors = computed(() => errors.value.customer_name !== '' || errors.value.customer_phone !== '')

const handleSubmit = () => {
  isSubmitted.value = true
  if (hasErrors.value || !formData.value.device_name || !formData.value.customer_name || !formData.value.customer_phone || !formData.value.storage_cell || !formData.value.description) return
  emit('submit', { ...formData.value })
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
