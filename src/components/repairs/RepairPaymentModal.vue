<template>
  <BaseModal :is-open="isOpen" @close="$emit('close')" title="Оплата ремонту">
    <form @submit.prevent="handleSubmit" class="payment-form">
      <div class="job-summary">
        <p v-if="jobData.payment_status === 'partial'">Залишок до сплати: <strong>{{ convertedBalanceDue }} {{ formData.currency }}</strong></p>
        <p v-else>Орієнтовна вартість: <strong>{{ convertedBalanceDue }} {{ formData.currency }}</strong></p>
      </div>

      <BaseSelect
        v-model="formData.cash_register"
        label="Каса *"
        :options="cashboxOptions"
        placeholder="Оберіть касу"
        :error="errors.cash_register"
      />

      <div class="form-row">
        <BaseInput
          v-model="formData.amount"
          type="number"
          label="Сума оплати *"
          placeholder="0.00"
          :error="errors.amount"
          step="0.01"
        />
        <BaseSelect
          v-model="formData.currency"
          label="Валюта"
          :options="currencyOptions"
        />
      </div>

      <div class="modal-actions">
        <BaseButton variant="secondary" type="button" @click="$emit('close')">Пропустити</BaseButton>
        <BaseButton variant="primary" type="submit" :disabled="isLoading">
          {{ isLoading ? 'Обробка...' : 'Оплатити' }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import { useCartStore } from '@/stores/pos'
import { useRepairsStore } from '@/stores/repairs'
import { useExchangeRatesStore } from '@/stores/exchangeRates'
import { watch } from 'vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  jobData: { type: Object, required: true }
})

const emit = defineEmits(['close', 'paid'])

const posStore = useCartStore()
const repairsStore = useRepairsStore()
const exchangeRatesStore = useExchangeRatesStore()

const isLoading = ref(false)
const errors = ref({ amount: '', cash_register: '' })

const initialAmountUAH = props.jobData.paid_amount > 0
  ? Number(props.jobData.balance_due || 0)
  : Number(props.jobData.price || 0)

const formData = ref({
  amount: initialAmountUAH,
  currency: 'UAH',
  cash_register: posStore.activeCashbox?.id || ''
})

const convertedBalanceDue = computed(() => {
  const rate = exchangeRatesStore.getRate(formData.value.currency)
  return (initialAmountUAH / rate).toFixed(2)
})

watch(() => formData.value.currency, () => {
  formData.value.amount = convertedBalanceDue.value
})

const currencyOptions = [
  { value: 'UAH', label: 'UAH (₴)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' }
]

const cashboxOptions = computed(() => {
  return posStore.availableCashboxes.map(c => ({
    value: c.id,
    label: c.name
  }))
})

onMounted(async () => {
  if (exchangeRatesStore.rates.length === 0) {
    await exchangeRatesStore.fetchRates()
  }

  if (posStore.availableCashboxes.length === 0) {
    await posStore.fetchCashboxes()
    if (posStore.activeCashbox) {
      formData.value.cash_register = posStore.activeCashbox.id
    }
  }
})

const handleSubmit = async () => {
  errors.value = { amount: '', cash_register: '' }
  let isValid = true

  if (!formData.value.amount || Number(formData.value.amount) <= 0) {
    errors.value.amount = 'Сума повинна бути більшою за 0'
    isValid = false
  }
  if (!formData.value.cash_register) {
    errors.value.cash_register = 'Оберіть касу'
    isValid = false
  }

  if (!isValid) return

  isLoading.value = true
  try {
    await repairsStore.payJob(props.jobData.id || props.jobData.job_id, formData.value)
    emit('paid')
    emit('close')
  } catch (error) {
    console.error('Помилка оплати:', error)
    if (error.response?.data?.error) {
      errors.value.amount = error.response.data.error
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.payment-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  /* Не ширше за модалку: на телефоні стає 100%, на десктопі — 350px */
  min-width: min(350px, 100%);
  width: 100%;
}
.job-summary {
  padding: 12px;
  background-color: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}
.form-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 12px;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

@media (max-width: 480px) {
  .payment-form { min-width: 0; }
  .form-row { grid-template-columns: 1fr; }
  .modal-actions { flex-direction: column-reverse; }
  .modal-actions :deep(button) { width: 100%; }
}
</style>
