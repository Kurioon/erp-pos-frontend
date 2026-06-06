<template>
  <section class="products-section" aria-label="Каталог товарів">
    <ReturnModal
      :is-open="isReturnModalOpen"
      @close="isReturnModalOpen = false"
    />
    <ProductDetailsDrawer
      :product="selectedProduct"
      :warehouses="warehousesStore.warehouses"
      :readonly="true"
      @close="selectedProduct = null"
    />
    <div class="catalog-header">
      <FilterBar
        searchPlaceholder="Пошук (назва, артикул, штрихкод)..."
        :filters="filterBarConfig"
        :modelValue="filters.search"
        @update:search="onSearchUpdate"
        @update:filter="onFilterUpdate"
        class="pos-filter"
      />
      <BaseButton class="return-btn" @click="handleReturn">
        ↺ Повернення
      </BaseButton>
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
        @click="openDrawer(product)"
        @keydown.enter.prevent="openDrawer(product)"
        @keydown.space.prevent="openDrawer(product)"
      >
        <h3 class="product-title">{{ product.name }}</h3>

        <div class="product-footer">
          <div class="footer-info">
            <span class="price">{{ formatCurrency(product.sale_price) }}</span>
            <span :class="['stock-badge', { 'stock-empty': product.stock === 0 }]">
              {{ product.stock }} шт
            </span>
          </div>
          <BaseButton class="add-btn" @click.stop="handleAdd(product)" :disabled="product.stock === 0">
            + Додати
          </BaseButton>
        </div>
      </div>
    </div>
  </section>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCartStore } from '@/stores/pos'
import { useCategoriesStore } from '@/stores/categories'
import { useWarehousesStore } from '@/stores/warehouses'
import { formatCurrency } from '@/utils/formatters'
import ReturnModal from '@/components/pos/ReturnModal.vue'
import FilterBar from '@/components/ui/FilterBar.vue'
import ProductDetailsDrawer from '@/components/warehouses/ProductDetailsDrawer.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const cartStore = useCartStore()
const categoriesStore = useCategoriesStore()
const warehousesStore = useWarehousesStore()

const isReturnModalOpen = ref(false)
const selectedProduct = ref(null)

const openDrawer = (product) => {
  selectedProduct.value = product
}

const filters = ref({
  search: '',
  category: ''
})

const categoryOptions = computed(() => {
  return [
    { value: '', label: 'Всі категорії' },
    ...categoriesStore.categories.map(c => ({ value: c.id, label: c.name }))
  ]
})

const filterBarConfig = computed(() => [
  { key: 'category', label: 'Всі категорії', options: categoryOptions.value }
])

const onSearchUpdate = (val) => {
  filters.value.search = val
  fetchProducts()
}

const onFilterUpdate = ({ key, value }) => {
  filters.value[key] = value
  fetchProducts()
}

const fetchProducts = () => {
  cartStore.fetchProducts(1, filters.value)
}

onMounted(() => {
  if (categoriesStore.categories.length === 0) {
    categoriesStore.fetchList()
  }
  if (warehousesStore.warehouses.length === 0) {
    warehousesStore.fetchWarehouses()
  }
})

const filteredProducts = computed(() => {
  // Фільтрація тепер на бекенді, тому просто повертаємо товари зі стору
  // Але якщо користувач ввів щось швидко, бекенд відпрацює
  return cartStore.products
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

.pos-filter {
  flex-grow: 1;
  margin-bottom: 0 !important;
  padding: 8px 12px !important;
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
  min-height: 160px;
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
  flex-direction: column;
  gap: 12px;
  margin-top: auto;
}

.footer-info {
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

.add-btn {
  align-self: stretch;
  box-sizing: border-box;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
}

.add-btn:hover:not(:disabled) {
  background: #2563eb;
}

.add-btn:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

@media (max-width: 1023px) {
  .products-section {
    height: 45vh; 
    min-height: 350px;
  }
}

@media (max-width: 1023px) {
  .products-section {
    height: 45vh;
    min-height: 350px;
  }
}

@media (max-width: 640px) {
  .catalog-header {
    flex-direction: column;
    gap: 12px;
    margin-bottom: 12px;
  }

  .return-btn {
    width: 100%;
    padding: 10px;
  }

  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    padding: 4px 4px 20px 4px;
  }

  .product-card {
    padding: 12px;
    min-height: 140px;
  }

  .product-title {
    font-size: 0.85rem;
    margin-bottom: 8px;
  }

  .price {
    font-size: 0.95rem;
  }

  .stock-badge {
    padding: 2px 4px;
    font-size: 0.75rem;
  }
}
</style>
