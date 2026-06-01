<template>
  <div class="pos-toolbar">
    <div class="cashbox-selector">
      <span class="label">Робоча каса:</span>

      <BaseSelect
        v-if="authStore.user?.role === 'admin'"
        :model-value="cartStore.activeCashbox?.id"
        :options="cashboxOptions"
        @update:model-value="handleCashboxChange"
      />

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

const authStore = useAuthStore()
const cartStore = useCartStore()
const cashboxOptions = computed(() => {
  return cartStore.availableCashboxes.map(box => ({
    value: box.id,
    label: box.name
  }))
})

const handleCashboxChange = (newId) => {
  const selectedBox = cartStore.availableCashboxes.find(box => String(box.id) === String(newId))
  if (selectedBox) {
    cartStore.activeCashbox = selectedBox
  }
}
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
</style>
