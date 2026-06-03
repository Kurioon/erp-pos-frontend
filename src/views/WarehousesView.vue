<script setup>
import { ref, computed } from 'vue'
import WarehouseFilters from '@/components/warehouses/WarehouseFilters.vue'
import WarehouseTable from '@/components/warehouses/WarehouseTable.vue'
import ProductDetailsDrawer from '@/components/warehouses/ProductDetailsDrawer.vue'


const products = ref([
  { id: 'APL-001', name: 'iPhone 15 Pro Max 256GB', category: 'Смартфони', purchase_price: 38000, wholesale_price: 42000, retail_price: 45990, stock: 12 },
  { id: 'SAM-002', name: 'Samsung Galaxy S24 Ultra', category: 'Смартфони', purchase_price: 32000, wholesale_price: 36000, retail_price: 39990, stock: 8 },
  { id: 'APL-003', name: 'MacBook Air M3 13" 256GB', category: 'Ноутбуки', purchase_price: 45000, wholesale_price: 50000, retail_price: 54990, stock: 3 },
  { id: 'APL-004', name: 'iPad Pro 12.9" M4 256GB', category: 'Планшети', purchase_price: 28000, wholesale_price: 32000, retail_price: 35990, stock: 6 },
  { id: 'SAM-005', name: 'Samsung 55" QLED 4K', category: 'Телевізори', purchase_price: 22000, wholesale_price: 26000, retail_price: 28990, stock: 4 },
  { id: 'ACC-006', name: 'AirPods Pro 2nd Gen', category: 'Навушники', purchase_price: 6000, wholesale_price: 7000, retail_price: 7990, stock: 2 },
  { id: 'APL-007', name: 'Apple Watch Ultra 2', category: 'Смарт-годинники', purchase_price: 18000, wholesale_price: 21000, retail_price: 23990, stock: 1 },
  { id: 'SAM-008', name: 'Samsung Galaxy Buds3 Pro', category: 'Навушники', purchase_price: 5500, wholesale_price: 6500, retail_price: 7490, stock: 0 }
])


const movementHistory = ref([
  { id: 1, date: '2026-05-27', type: 'Продаж', qty: -1, order: 'ORD-0142', balance: 11 },
  { id: 2, date: '2026-05-25', type: 'Надходження', qty: 5, order: 'PO-0041', balance: 12 },
  { id: 3, date: '2026-05-23', type: 'Продаж', qty: -2, order: 'ORD-0138', balance: 7 },
  { id: 4, date: '2026-05-15', type: 'Надходження', qty: 10, order: 'PO-0039', balance: 9 }
])

const categories = ['Всі', 'Смартфони', 'Ноутбуки', 'Планшети', 'Телевізори', 'Навушники', 'Смарт-годинники', 'Аксесуари']
const selectedCategory = ref('Всі')
const searchQuery = ref('')
const selectedProduct = ref(null)


const filteredProducts = computed(() => {
  return products.value.filter(p => {
    const matchesCategory = selectedCategory.value === 'Всі' || p.category === selectedCategory.value
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          p.id.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesCategory && matchesSearch
  })
})

const openDrawer = (product) => {
  selectedProduct.value = product
}

const closeDrawer = () => {
  selectedProduct.value = null
}

const handleUpdatePrices = (updatedProduct) => {
  const index = products.value.findIndex(p => p.id === updatedProduct.id)
  if (index !== -1) {
    products.value[index] = updatedProduct
  }
  closeDrawer()
}
</script>

<template>
  <div class="warehouses-view">
    <header class="warehouse-header">
      <h1>Склади — Номенклатура</h1>
    </header>

    <WarehouseFilters 
      v-model:searchQuery="searchQuery"
      v-model:selectedCategory="selectedCategory"
      :categories="categories"
    />

    <main>
      <WarehouseTable 
        :products="filteredProducts"
        @select-product="openDrawer"
      />
    </main>

    <ProductDetailsDrawer 
      :product="selectedProduct"
      :movement-history="movementHistory"
      @close="closeDrawer"
      @save="handleUpdatePrices"
    />
  </div>
</template>

<style scoped>
.warehouses-view {
  padding: 32px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8fafc;
}
.warehouse-header {
  margin-bottom: 24px;
}
.warehouse-header h1 {
  font-size: 1.6rem;
  color: #0f172a;
  margin: 0;
  font-weight: 700;
  letter-spacing: -0.02em;
}
</style>
