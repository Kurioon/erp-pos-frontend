<template>
  <div class="filters-section">
    <BaseInput
      :modelValue="props.searchQuery"
      @update:modelValue="val => emit('update:searchQuery', val)"
      placeholder="Пошук за назвою або кодом..."
      icon="search"
      class="f-search"
    />

    <BaseSelect
      :modelValue="props.selectedWarehouse"
      @update:modelValue="val => emit('update:selectedWarehouse', val)"
      :options="warehouseOptions"
      placeholder="Всі склади"
      class="f-select"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'

const props = defineProps({
  searchQuery: { type: String, default: '' },
  selectedWarehouse: { type: [String, Number], default: '' },
  warehouses: { type: Array, required: true }
})

const emit = defineEmits(['update:searchQuery', 'update:selectedWarehouse'])

const warehouseOptions = computed(() => {
  const opts = props.warehouses.map(w => ({ value: w.id, label: w.name }))
  return [{ value: '', label: 'Всі склади' }, ...opts]
})
</script>

<style scoped>
.filters-section { display: flex; gap: 16px; margin-bottom: 24px; align-items: center; }
.f-search { flex: 2; min-width: 250px; margin-bottom: 0 !important; }
.f-select { flex: 1; min-width: 180px; margin-bottom: 0 !important; }
.f-search :deep(div) { margin-bottom: 0 !important; }
.f-select :deep(div) { margin-bottom: 0 !important; }
</style>
