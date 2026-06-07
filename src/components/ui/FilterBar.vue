<template>
  <div class="filter-bar">
    <BaseInput
      v-model="searchQuery"
      :placeholder="searchPlaceholder"
      @input="onSearchInput"
      class="filter-search"
    />
    <BaseSelect
      v-for="filter in filters"
      :key="filter.key"
      v-model="internalFilterValues[filter.key]"
      :options="filter.options"
      :placeholder="filter.label"
      @update:modelValue="onFilterChange(filter.key, $event)"
      class="filter-select"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import BaseInput from './BaseInput.vue'
import BaseSelect from './BaseSelect.vue'

const props = defineProps({
  searchPlaceholder: {
    type: String,
    default: 'Пошук...'
  },
  filters: {
    type: Array,
    default: () => [] // [{key: 'status', label: 'Статус', options: [...]}]
  },
  modelValue: {
    type: String,
    default: ''
  },
  filterValues: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:search', 'update:filter', 'update:modelValue'])

const searchQuery = ref(props.modelValue)
const internalFilterValues = ref({ ...props.filterValues })

watch(() => props.modelValue, (newVal) => {
  if (searchQuery.value !== newVal) {
    searchQuery.value = newVal
  }
})

watch(() => props.filterValues, (newVal) => {
  internalFilterValues.value = { ...newVal }
}, { deep: true })

let searchTimeout = null

const onSearchInput = (e) => {
  const val = e.target.value || ''
  emit('update:modelValue', val)
  
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    emit('update:search', val)
  }, 300)
}

const onFilterChange = (key, value) => {
  emit('update:filter', { key, value })
}
</script>

<style scoped>
.filter-bar {
  display: flex;
  gap: 12px;
  align-items: center;
  background: #f8fafc;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  margin-bottom: 24px;
  flex-wrap: wrap;
  width: 100%;
}

.filter-search {
  flex: 2;
  min-width: 250px;
  margin-bottom: 0 !important;
}

.filter-select {
  flex: 1;
  min-width: 180px;
  margin-bottom: 0 !important;
}

:deep(.filter-select > div) {
  margin-bottom: 0 !important;
}

@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
