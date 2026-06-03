<template>
  <div class="filters-section">
    <div class="search-box-wrapper">
      <BaseInput
        :modelValue="props.searchQuery"
        @update:modelValue="val => emit('update:searchQuery', val)"
        placeholder="Пошук за назвою або кодом..."
        icon="search"
      />
    </div>

    <div class="categories-scroll">
      <button
        v-for="cat in props.categories"
        :key="cat"
        class="category-pill"
        :class="{ active: props.selectedCategory === cat }"
        @click="emit('update:selectedCategory', cat)"
      >
        {{ cat }}
      </button>
    </div>
  </div>
</template>

<script setup>
import BaseInput from '@/components/ui/BaseInput.vue'

const props = defineProps({
  searchQuery: { type: String, default: '' },
  selectedCategory: { type: String, default: 'Всі' },
  categories: { type: Array, required: true }
})

const emit = defineEmits(['update:searchQuery', 'update:selectedCategory'])
</script>

<style scoped>
.filters-section { display: flex; gap: 16px; margin-bottom: 24px; align-items: center; }
.search-box-wrapper { min-width: 280px; }
.categories-scroll { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; }
.categories-scroll::-webkit-scrollbar { display: none; }
.category-pill { padding: 8px 16px; background: white; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.9rem; font-weight: 500; color: #475569; cursor: pointer; white-space: nowrap; transition: all 0.2s; }
.category-pill:hover { border-color: #cbd5e1; color: #0f172a; }
.category-pill.active { background: #2563eb; color: white; border-color: #2563eb; }

@media (max-width: 1024px) {
  .filters-section { flex-direction: column; align-items: stretch; }
}
</style>
