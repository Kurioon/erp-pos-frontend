<script setup>
const props = defineProps({
  searchQuery: { type: String, default: '' },
  selectedCategory: { type: String, default: 'Всі' },
  categories: { type: Array, required: true }
})

const emit = defineEmits(['update:searchQuery', 'update:selectedCategory'])
</script>

<template>
  <div class="filters-section">
    <div class="search-box">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <input 
        :value="props.searchQuery" 
        @input="emit('update:searchQuery', $target.value)"
        type="text" 
        placeholder="Пошук за назвою або SKU..." 
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

<style scoped>
.filters-section { display: flex; gap: 16px; margin-bottom: 24px; align-items: center; }
.search-box { display: flex; align-items: center; background: white; border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px 12px; min-width: 260px; }
.search-box svg { color: #94a3b8; margin-right: 8px; }
.search-box input { border: none; outline: none; font-size: 0.95rem; width: 100%; }
.categories-scroll { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; }
.categories-scroll::-webkit-scrollbar { display: none; }
.category-pill { padding: 8px 16px; background: white; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.9rem; font-weight: 500; color: #475569; cursor: pointer; white-space: nowrap; transition: all 0.2s; }
.category-pill:hover { border-color: #cbd5e1; color: #0f172a; }
.category-pill.active { background: #2563eb; color: white; border-color: #2563eb; }

@media (max-width: 1024px) {
  .filters-section { flex-direction: column; align-items: stretch; }
}
</style>