<template>
  <div class="pos-toolbar">
    <div class="cashbox-selector">
      <span class="label">Робоча каса:</span>

      <div v-if="authStore.user?.role === USER_ROLES.ADMIN" class="base-select-wrapper">
        <BaseSelect
          v-model="selectedCashboxId"
          :options="cashboxOptions"
          :show-dot="true"
        />
      </div>

      <div v-else class="locked-cashbox">
        <IconLock class="lock-icon" />
        {{ cartStore.activeCashbox?.name || 'Завантаження...' }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/pos'
import IconLock from '@/components/icons/IconLock.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import { USER_ROLES } from '@/constants/roles'

const authStore = useAuthStore()
const cartStore = useCartStore()

const cashboxOptions = computed(() => {
  return cartStore.availableCashboxes.map(box => ({
    value: box.id,
    label: box.name
  }))
})

const selectedCashboxId = computed({
  get() {
    return cartStore.activeCashbox?.id || ''
  },
  set(newId) {
    const box = cartStore.availableCashboxes.find(b => b.id === newId)
    if (box) {
      cartStore.activeCashbox = box
      cartStore.fetchProducts()
    }
  }
})
</script>

<style scoped>
.pos-toolbar {
  background: #ffffff;
  border-radius: 12px;
  padding: 12px 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex-shrink: 0;
}

.cashbox-selector {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cashbox-selector .label {
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 500;
}

.base-select-wrapper {
  width: 220px;
}

:deep(.custom-select-wrapper) {
  min-height: 38px;
}
:deep(.select-trigger) {
  padding: 8px 12px;
  min-height: 38px;
}

.locked-cashbox {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f1f5f9;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  color: #475569;
  font-size: 0.95rem;
  font-weight: 500;
  user-select: none;
}

.lock-icon {
  width: 16px;
  height: 16px;
  color: #64748b;
}

@media (max-width: 640px) {
  .pos-toolbar {
    padding: 10px 16px;
    justify-content: flex-end;
  }

  .cashbox-selector .label {
    display: none;
  }

  .base-select-wrapper {
    width: 180px;
  }

  .locked-cashbox {
    font-size: 0.85rem;
    padding: 6px 10px;
  }
}
</style>
