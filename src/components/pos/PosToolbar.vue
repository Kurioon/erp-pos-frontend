<template>
  <div class="pos-toolbar">
    <div class="cashbox-selector">
      <span class="label">Робоча каса:</span>

      <select
        v-if="authStore.user?.role === 'admin'"
        v-model="cartStore.activeCashbox"
        class="custom-select"
      >
        <option
          v-for="box in cartStore.availableCashboxes"
          :key="box.id"
          :value="box"
        >
          {{ box.name }}
        </option>
      </select>

      <div v-else class="locked-cashbox">
        <span class="lock-icon">🔒</span>
        {{ cartStore.activeCashbox?.name || 'Завантаження...' }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/pos'

const authStore = useAuthStore()
const cartStore = useCartStore()
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

.custom-select {
  padding: 8px 32px 8px 12px;
  font-size: 0.95rem;
  color: #0f172a;
  background-color: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  outline: none;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  transition: all 0.2s;
}

.custom-select:hover {
  border-color: #94a3b8;
}

.custom-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.locked-cashbox {
  display: flex;
  align-items: center;
  gap: 6px;
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
  font-size: 0.85rem;
  opacity: 0.7;
}
</style>
