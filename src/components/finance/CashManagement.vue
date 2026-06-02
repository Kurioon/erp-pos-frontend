<template>
  <div class="tab-pane">
    <section class="management-section">
      <div class="section-header">
        <h2>Активні каси</h2>
      </div>

      <div v-if="cartStore.isLoading" class="text-muted">Завантаження кас...</div>

      <div v-else class="registers-grid">
        <div v-for="reg in cartStore.availableCashboxes" :key="reg.id" class="register-card shadow-premium">
          <div class="card-top-row">
            <span class="register-dot-indicator"></span>
            <span class="register-card-title">{{ reg.name }}</span>
          </div>
          <div class="register-balance-display">
            <span class="balance-value">{{ formatCurrency(reg.balance || 0, 'UAH') }}</span>
          </div>
          <p class="balance-sub-label">Поточний баланс</p>
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
          <BaseInput
            label="UAH (база)"
            :modelValue="1.00"
            disabled
          />
          <BaseInput
            label="USD → UAH"
            type="number"
            step="0.1"
            v-model.number="currencyRates.usd"
          />
          <BaseInput
            label="EUR → UAH"
            type="number"
            step="0.1"
            v-model.number="currencyRates.eur"
          />
        </div>

        <div class="rates-footer-actions">
          <BaseButton variant="primary" @click="handleSaveRates" :disabled="isSavingRates">
            <span v-if="isSavingRates">Збереження...</span>
            <span v-else>Зберегти курси</span>
          </BaseButton>
          <p class="rates-info-subtext">
            Курси використовуються для конвертації при мультивалютних операціях
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useCartStore } from '@/stores/pos'
import { formatCurrency } from '@/utils/formatters'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import IconRefresh from '@/components/icons/IconRefresh.vue'

const cartStore = useCartStore()
// Локальний стейт для курсів валют (тимчасово, поки немає API)
const currencyRates = ref({
  usd: 40.5,
  eur: 43.2
})
const isSavingRates = ref(false)

onMounted(() => {
  if (cartStore.availableCashboxes.length === 0) {
    cartStore.fetchCashboxes()
  }
})

const handleSaveRates = () => {
  isSavingRates.value = true
  setTimeout(() => {
    window.dispatchEvent(
      new CustomEvent('app-success', {
        detail: { message: 'Курси валют успішно оновлено!', type: 'success' },
      })
    )
    isSavingRates.value = false
  }, 1000)
}
</script>

<style scoped>
.management-section { display: flex; flex-direction: column; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.section-header h2, .section-header-simple h2 { font-size: 1.15rem; color: #0f172a; margin: 0; font-weight: 700; }
.registers-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
@media (max-width: 768px) { .registers-grid { grid-template-columns: 1fr; } }
.register-card { background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; display: flex; flex-direction: column; }
.shadow-premium { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 20px 25px -5px rgba(0, 0, 0, 0.03); }
.card-top-row { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
.register-dot-indicator { width: 8px; height: 8px; background-color: #10b981; border-radius: 50%; }
.register-card-title { font-size: 0.9rem; font-weight: 700; color: #334155; }
.register-balance-display { display: flex; align-items: baseline; gap: 6px; margin-bottom: 4px; }
.balance-value { font-size: 1.65rem; font-weight: 700; color: #0f172a; letter-spacing: -0.02em; }
.balance-sub-label { margin: 0; font-size: 0.8rem; color: #94a3b8; font-weight: 500; }
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
</style>
