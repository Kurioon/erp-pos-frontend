<template>
  <div class="tab-pane">
    <section class="management-section">
      <div class="section-header">
        <h2>Активні каси</h2>
        <BaseButton
          v-if="isAdmin"
          variant="secondary"
          @click="openAddCashboxModal"
        >
          + Додати касу
        </BaseButton>
      </div>

      <div v-if="cartStore.isLoading || warehousesStore.isLoading" class="text-muted">Завантаження даних...</div>

      <div v-else class="registers-grid">
        <div v-for="reg in cartStore.availableCashboxes" :key="reg.id" class="register-card shadow-premium relative-card">

          <div v-if="isAdmin" class="card-actions">
            <button class="action-btn edit-btn" @click="openEditCashboxModal(reg)" title="Редагувати касу">
              ✎
            </button>
            <button class="action-btn delete-btn" @click="promptDeleteCashbox(reg)" title="Видалити касу">
              ×
            </button>
          </div>

          <div class="card-top-row">
            <span class="register-dot-indicator"></span>
            <span class="register-card-title">{{ reg.name }}</span>
          </div>
          <div class="register-balance-display">
            <span class="balance-value">{{ formatCurrency(reg.balance || 0, 'UAH') }}</span>
          </div>
          <p class="balance-sub-label">Поточний баланс</p>
          <p class="warehouse-label">Склад: <b>{{ getWarehouseName(reg.warehouse) }}</b></p>
        </div>

        <div v-if="cartStore.availableCashboxes.length === 0" class="text-muted">
          Каси не знайдені в системі.
        </div>
      </div>
    </section>

    <section class="management-section rate-section-spacing">
      <div class="section-header-simple">
        <div class="header-with-icon">
          <IconRefresh class="header-icon" />
          <h2>Курси валют</h2>
        </div>
      </div>

      <div class="rates-control-card shadow-premium">
        <div class="rates-inputs-row">
          <BaseInput label="UAH (база)" :modelValue="1.00" disabled />
          <BaseInput label="USD → UAH" type="number" step="0.1" v-model.number="currencyRates.USD" :disabled="!isAdmin" />
          <BaseInput label="EUR → UAH" type="number" step="0.1" v-model.number="currencyRates.EUR" :disabled="!isAdmin" />
        </div>

        <div class="rates-footer-actions">
          <BaseButton v-if="isAdmin" variant="primary" @click="handleSaveRates" :disabled="isSavingRates || isLoadingRates">
            <span v-if="isSavingRates">Збереження...</span>
            <span v-else>Зберегти курси</span>
          </BaseButton>
          <p class="rates-info-subtext">
            Курси використовуються для конвертації при мультивалютних операціях.
            <span v-if="!isAdmin" class="text-locked">(Редагування доступне лише адміністраторам)</span>
          </p>
        </div>
      </div>
    </section>

    <BaseModal
      :is-open="isCashboxModalOpen"
      @close="closeCashboxModal"
      :title="editingCashboxId ? 'Редагувати касу' : 'Нова каса'"
    >
      <form @submit.prevent="submitCashbox" class="cashbox-form">
        <BaseInput
          v-model="cashboxFormData.name"
          label="Назва каси *"
          placeholder="Наприклад: Каса Магазин №1"
          required
          autofocus
        />

        <BaseSelect
          v-model="cashboxFormData.warehouse"
          :options="warehouseOptions"
          label="Прив'язка до складу *"
          placeholder="Оберіть склад"
        />

        <div class="modal-actions">
          <BaseButton variant="secondary" type="button" @click="closeCashboxModal">Скасувати</BaseButton>
          <BaseButton variant="primary" type="submit" :disabled="!isFormValid || isSubmittingCashbox">
            {{ isSubmittingCashbox ? 'Збереження...' : 'Зберегти' }}
          </BaseButton>
        </div>
      </form>
    </BaseModal>

    <BaseModal
      :is-open="!!cashboxToDelete"
      @close="cashboxToDelete = null"
      title="Підтвердження видалення"
    >
      <div class="confirm-content">
        <p>Ви впевнені, що хочете видалити касу <strong>"{{ cashboxToDelete?.name }}"</strong>?</p>
        <p class="text-danger-sm">Цю дію неможливо скасувати. Переконайтесь, що по цій касі немає активних транзакцій.</p>
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="cashboxToDelete = null">Скасувати</BaseButton>
        <BaseButton class="danger-btn" @click="confirmDeleteCashbox">Видалити</BaseButton>
      </template>
    </BaseModal>

    <ConfirmModal
      :is-open="isConfirmSubmitOpen"
      :title="editingCashboxId ? 'Збереження змін' : 'Створення каси'"
      :message="editingCashboxId ? 'Ви впевнені, що хочете зберегти зміни для цієї каси?' : 'Ви впевнені, що хочете створити нову касу з цими даними?'"
      confirmText="Підтвердити"
      @close="isConfirmSubmitOpen = false"
      @confirm="executeSubmitCashbox"
    />

  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useCartStore } from '@/stores/pos'
import { useAuthStore } from '@/stores/auth'
import { useWarehousesStore } from '@/stores/warehouses'
import { USER_ROLES } from '@/constants/roles'
import { formatCurrency } from '@/utils/formatters'
import api from '@/api/axios'

import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'
import IconRefresh from '@/components/icons/IconRefresh.vue'

const cartStore = useCartStore()
const authStore = useAuthStore()
const warehousesStore = useWarehousesStore()

const isAdmin = computed(() => authStore.user?.role === USER_ROLES.ADMIN)

const currencyRates = ref({ USD: 0, EUR: 0 })
const isSavingRates = ref(false)
const isLoadingRates = ref(false)

const loadExchangeRates = async () => {
  isLoadingRates.value = true
  try {
    const response = await api.get('/exchange-rates/')
    const rates = response.data.results || response.data || []
    rates.forEach(rate => {
      if (rate.currency === 'USD') currencyRates.value.USD = Number(rate.rate_to_uah)
      if (rate.currency === 'EUR') currencyRates.value.EUR = Number(rate.rate_to_uah)
    })
  } catch (error) {
    console.error('Помилка завантаження курсів валют:', error)
  } finally {
    isLoadingRates.value = false
  }
}

const handleSaveRates = async () => {
  if (!isAdmin.value) return
  isSavingRates.value = true
  try {
    await Promise.all([
      api.put('/exchange-rates/USD/', { rate_to_uah: String(currencyRates.value.USD) }),
      api.put('/exchange-rates/EUR/', { rate_to_uah: String(currencyRates.value.EUR) })
    ])
    window.dispatchEvent(new CustomEvent('app-success', { detail: { message: 'Курси валют оновлено!', type: 'success' } }))
  } catch (error) {
    console.error('Помилка оновлення курсів:', error)
    window.dispatchEvent(new CustomEvent('api-error', { detail: { message: 'Не вдалося зберегти нові курси.', type: 'error' } }))
  } finally {
    isSavingRates.value = false
  }
}

const isCashboxModalOpen = ref(false)
const isConfirmSubmitOpen = ref(false)
const isSubmittingCashbox = ref(false)
const editingCashboxId = ref(null)
const cashboxFormData = ref({ name: '', warehouse: '' })
const cashboxToDelete = ref(null)

const warehouseOptions = computed(() => {
  return warehousesStore.warehouses.map(w => ({
    value: w.id,
    label: w.name
  }))
})

const getWarehouseName = (warehouseId) => {
  if (!warehouseId) return 'Не прив\'язано'
  const wh = warehousesStore.warehouses.find(w => w.id === warehouseId)
  return wh ? wh.name : `Склад #${warehouseId}`
}

const isFormValid = computed(() => {
  return cashboxFormData.value.name.trim() !== '' && cashboxFormData.value.warehouse !== ''
})

const openAddCashboxModal = () => {
  editingCashboxId.value = null
  cashboxFormData.value = { name: '', warehouse: '' }
  isCashboxModalOpen.value = true
}

const openEditCashboxModal = (cashbox) => {
  editingCashboxId.value = cashbox.id
  cashboxFormData.value = {
    name: cashbox.name,
    warehouse: cashbox.warehouse
  }
  isCashboxModalOpen.value = true
}

const closeCashboxModal = () => {
  isCashboxModalOpen.value = false
}

const submitCashbox = () => {
  if (!isFormValid.value) return

  const trimmedName = cashboxFormData.value.name.trim()
  const isDuplicate = cartStore.availableCashboxes.some(box =>
    box.name.toLowerCase() === trimmedName.toLowerCase() && box.id !== editingCashboxId.value
  )

  if (isDuplicate) {
    window.dispatchEvent(new CustomEvent('api-error', { detail: { message: 'Каса з такою назвою вже існує!', type: 'warning' } }))
    return
  }

  isConfirmSubmitOpen.value = true
}

const executeSubmitCashbox = async () => {
  isConfirmSubmitOpen.value = false
  isSubmittingCashbox.value = true
  try {
    const payload = {
      name: cashboxFormData.value.name.trim(),
      warehouse: Number(cashboxFormData.value.warehouse)
    }

    if (editingCashboxId.value) {
      await cartStore.updateCashbox(editingCashboxId.value, payload)
      window.dispatchEvent(new CustomEvent('app-success', { detail: { message: 'Касу успішно оновлено!', type: 'success' } }))
    } else {
      await cartStore.createCashbox(payload)
      window.dispatchEvent(new CustomEvent('app-success', { detail: { message: 'Касу успішно створено!', type: 'success' } }))
    }

    closeCashboxModal()
    await cartStore.fetchCashboxes()
  } catch (error) {
    console.error('Помилка збереження каси:', error)
    window.dispatchEvent(new CustomEvent('api-error', { detail: { message: 'Не вдалося зберегти касу', type: 'error' } }))
  } finally {
    isSubmittingCashbox.value = false
  }
}

const promptDeleteCashbox = (cashbox) => {
  cashboxToDelete.value = cashbox
}

const confirmDeleteCashbox = async () => {
  if (!cashboxToDelete.value) return
  
  try {
    await cartStore.deleteCashbox(cashboxToDelete.value.id)
    window.dispatchEvent(new CustomEvent('app-success', { detail: { message: 'Касу успішно видалено!', type: 'success' } }))
    await cartStore.fetchCashboxes()
  } catch (error) {
    console.error('Помилка видалення каси:', error)
    const errorMsg = error.response?.data?.detail || error.response?.data?.error || 'Не вдалося видалити касу. Можливо, по ній є транзакції.'
    window.dispatchEvent(new CustomEvent('api-error', { detail: { message: errorMsg, type: 'error' } }))
  } finally {
    cashboxToDelete.value = null
  }
}

onMounted(() => {
  if (cartStore.availableCashboxes.length === 0) cartStore.fetchCashboxes()
  if (warehousesStore.warehouses.length === 0) warehousesStore.fetchWarehouses()
  loadExchangeRates()
})
</script>

<style scoped>
.management-section { display: flex; flex-direction: column; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.section-header h2, .section-header-simple h2 { font-size: 1.15rem; color: #0f172a; margin: 0; font-weight: 700; }
.registers-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
@media (max-width: 768px) { .registers-grid { grid-template-columns: 1fr; } }

.register-card { background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; display: flex; flex-direction: column; position: relative; }
.shadow-premium { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 20px 25px -5px rgba(0, 0, 0, 0.03); }
.card-top-row { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; padding-right: 40px; }
.register-dot-indicator { width: 8px; height: 8px; background-color: #10b981; border-radius: 50%; flex-shrink: 0; }
.register-card-title { font-size: 0.9rem; font-weight: 700; color: #334155; line-height: 1.2; }
.register-balance-display { display: flex; align-items: baseline; gap: 6px; margin-bottom: 4px; }
.balance-value { font-size: 1.65rem; font-weight: 700; color: #0f172a; letter-spacing: -0.02em; }
.balance-sub-label { margin: 0 0 12px 0; font-size: 0.8rem; color: #94a3b8; font-weight: 500; }
.warehouse-label { margin: 0; font-size: 0.85rem; color: #475569; background: #f8fafc; padding: 6px 10px; border-radius: 6px; display: inline-block; align-self: flex-start; }
.text-muted { color: #94a3b8; }

.rate-section-spacing { margin-top: 36px; }
.section-header-simple { margin-bottom: 16px; }
.header-with-icon { display: flex; align-items: center; gap: 8px; }
.header-icon { color: #64748b; width: 20px; height: 20px; }
.rates-control-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; }
.rates-inputs-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px; }
@media (max-width: 768px) { .rates-inputs-row { grid-template-columns: 1fr; } }
.rates-footer-actions { display: flex; align-items: center; gap: 16px; }
.rates-info-subtext { margin: 0; font-size: 0.8rem; color: #64748b; font-weight: 500; }
.text-locked { color: #ef4444; font-style: italic; }

.card-actions { position: absolute; top: 12px; right: 12px; display: flex; gap: 4px; }
.action-btn { background: transparent; border: none; color: #cbd5e1; font-size: 1.2rem; cursor: pointer; transition: color 0.2s; padding: 4px; border-radius: 4px; display: flex; align-items: center; justify-content: center; }
.action-btn:hover { background: #f1f5f9; }
.edit-btn:hover { color: #2563eb; }
.delete-btn { font-size: 1.5rem; line-height: 1; }
.delete-btn:hover { color: #ef4444; }

.cashbox-form { display: flex; flex-direction: column; gap: 16px; min-width: 350px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; }
@media (max-width: 640px) { .cashbox-form { min-width: 100%; } }

.confirm-content { padding: 10px 0; font-size: 0.95rem; color: #334155; }
.confirm-content p { margin: 0 0 8px 0; }
.text-danger-sm { color: #ef4444; font-size: 0.8rem; }
.danger-btn { background-color: #ef4444 !important; border-color: #ef4444 !important; color: white !important;}
.danger-btn:hover { background-color: #dc2626 !important; border-color: #dc2626 !important; }
</style>
