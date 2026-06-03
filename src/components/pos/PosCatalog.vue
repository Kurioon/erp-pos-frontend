<template>
  <section class="products-section" aria-label="Каталог товарів">
    <ReturnModal
      :is-open="isReturnModalOpen"
      @close="isReturnModalOpen = false"
    />
    <div class="catalog-header">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Пошук або сканер штрих-коду..."
        class="search-input"
        aria-label="Пошук товарів"
      >
      <button class="return-btn" @click="handleReturn">
        ↺ Повернення
      </button>
    </div>

    <div v-if="cartStore.isLoading" class="loading-state">
      Завантаження товарів...
    </div>

    <div v-else class="products-grid">
      <div
        v-for="product in filteredProducts"
        :key="product.id"
        :class="['product-card', { 'out-of-stock': product.stock === 0 }]"
        :tabindex="product.stock > 0 ? 0 : -1"
        role="button"
        :aria-disabled="product.stock === 0"
        @click="handleAdd(product)"
        @keydown.enter.prevent="handleAdd(product)"
        @keydown.space.prevent="handleAdd(product)"
      >
        <h3 class="product-title">{{ product.name }}</h3>

        <div class="product-footer">
          <span class="price">{{ formatCurrency(product.sale_price) }}</span>
          <span :class="['stock-badge', { 'stock-empty': product.stock === 0 }]">
            {{ product.stock }} шт
          </span>
        </div>
      </div>
    </div>
  </section>
</template>


<script setup>
import { ref, computed } from 'vue'
import { useCartStore } from '@/stores/pos'
import { formatCurrency } from '@/utils/formatters'
import ReturnModal from '@/components/pos/ReturnModal.vue'

const cartStore = useCartStore()
const searchQuery = ref('')
const isReturnModalOpen = ref(false)

const filteredProducts = computed(() => {
  if (!searchQuery.value) return cartStore.products
  return cartStore.products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    (p.barcode && p.barcode.includes(searchQuery.value))
  )
})

const handleAdd = (product) => {
  if (product.stock > 0) {
    cartStore.addItem(product)
  }
}

const handleReturn = () => {
  isReturnModalOpen.value = true
}
</script>

<style scoped>
.products-section {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.catalog-header {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  flex-shrink: 0;
}

.search-input {
  flex-grow: 1;
  padding: 12px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.return-btn {
  padding: 0 20px;
  background: white;
  border: 1px solid #3b82f6;
  color: #3b82f6;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.return-btn:hover, .return-btn:focus-visible {
  background: #eff6ff;
  outline: none;
}

.products-grid {
  flex-grow: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 16px;
  align-content: start;
  scrollbar-width: none;
  padding: 6px 6px 32px 6px;
}
.products-grid::-webkit-scrollbar { display: none; }

.product-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #ffffff;
  min-height: 110px;
  outline: none;
  position: relative;
  z-index: 1;
}

.product-card:hover:not(.out-of-stock),
.product-card:focus-visible:not(.out-of-stock) {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.12);
  transform: translateY(-2px);
  z-index: 2;
}

.out-of-stock {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(100%);
  background-color: #f8fafc;
}

.product-title {
  margin: 0 0 16px 0;
  font-size: 1rem;
  color: #0f172a;
  line-height: 1.4;
  font-weight: 600;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-weight: 600;
  color: #3b82f6;
  font-size: 1.1rem;
}

.stock-badge {
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
}

.stock-empty {
  background: #fef2f2;
  color: #ef4444;
}
</style>
