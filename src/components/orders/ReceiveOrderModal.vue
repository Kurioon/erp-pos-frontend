<template>
  <BaseModal
    :is-open="isOpen"
    @close="$emit('close')"
    title="Прийомка товарів на склад"
  >
    <div class="receive-modal-content">
      <p v-if="order">
        Ви збираєтесь прийняти товари по замовленню
        <strong>#{{ order.id }}</strong>.
      </p>
      <p>Будь ласка, оберіть склад для оприбуткування товарів:</p>

      <div v-if="warehousesStore.isLoading" class="text-muted">
        Завантаження складів...
      </div>
      <BaseSelect
        v-else
        v-model="selectedWarehouseId"
        label="Склад призначення"
        :options="warehouseOptions"
        required
      />
      <div v-if="error" class="text-danger-sm mt-2">{{ error }}</div>
    </div>
    <template #footer>
      <BaseButton variant="secondary" @click="$emit('close')">
        Скасувати
      </BaseButton>
      <BaseButton
        @click="handleConfirm"
        :disabled="!selectedWarehouseId || isReceiving"
      >
        <span v-if="isReceiving">Приймаємо...</span>
        <span v-else>Підтвердити прийомку</span>
      </BaseButton>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useWarehousesStore } from '@/stores/warehouses'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue' // Assuming a BaseSelect component

const props = defineProps({
  isOpen: Boolean,
  order: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'confirm'])

const warehousesStore = useWarehousesStore()

const selectedWarehouseId = ref('')
const isReceiving = ref(false)
const error = ref('')

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      selectedWarehouseId.value = ''
      isReceiving.value = false
      error.value = ''
      if (warehousesStore.warehouses.length === 0) {
        warehousesStore.fetchWarehouses()
      }
    }
  }
)

const warehouseOptions = computed(() => {
  return warehousesStore.warehouses.map((w) => ({
    value: w.id,
    label: w.name,
  }))
})

async function handleConfirm() {
  if (!selectedWarehouseId.value) return
  isReceiving.value = true
  emit('confirm', {
    orderId: props.order.id,
    warehouseId: selectedWarehouseId.value,
  })
  isReceiving.value = false
}
</script>