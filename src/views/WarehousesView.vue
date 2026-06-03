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
      <div v-if="warehousesStore.isLoading && warehousesStore.inventoryList.length === 0" class="loading-state text-muted">
        Завантаження інвентарю...
      </div>
      <WarehouseTable
        v-else
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

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useWarehousesStore } from '@/stores/warehouses'
import WarehouseFilters from '@/components/warehouses/WarehouseFilters.vue'
import WarehouseTable from '@/components/warehouses/WarehouseTable.vue'
import ProductDetailsDrawer from '@/components/warehouses/ProductDetailsDrawer.vue'

const warehousesStore = useWarehousesStore()

// Тимчасовий мок історії рухів (бо в API немає окремого ендпоінта для цього)
const movementHistory = ref([
  { id: 1, date: '2026-06-03', type: 'Надходження', qty: 10, order: 'PO-001', balance: 10 }
])

const searchQuery = ref('')
const selectedCategory = ref('Всі')
const selectedProduct = ref(null)

onMounted(() => {
  warehousesStore.fetchInventory()
})

const categories = computed(() => {
  const uniqueCats = new Set(warehousesStore.inventoryList.map(p => p.category))
  return ['Всі', ...Array.from(uniqueCats)]
})

const filteredProducts = computed(() => {
  return warehousesStore.inventoryList.filter(p => {
    const matchesCategory = selectedCategory.value === 'Всі' || p.category === selectedCategory.value
    const matchesSearch =
      (p.name && p.name.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
      (p.code && p.code.toLowerCase().includes(searchQuery.value.toLowerCase()))
    return matchesCategory && matchesSearch
  })
})

const openDrawer = (product) => selectedProduct.value = product
const closeDrawer = () => selectedProduct.value = null

const handleUpdatePrices = async (updatedProductData) => {
  const payload = {
    purchase_price: String(updatedProductData.purchase_price),
    sale_price: String(updatedProductData.retail_price) 
  }
  await warehousesStore.updateProductPrices(updatedProductData.id, payload)
  closeDrawer()
}
</script>

<style scoped>
.warehouses-view { padding: 32px; min-height: 100vh; display: flex; flex-direction: column; background-color: #f8fafc; }
.warehouse-header { margin-bottom: 24px; }
.warehouse-header h1 { font-size: 1.6rem; color: #0f172a; margin: 0; font-weight: 700; letter-spacing: -0.02em; }
.loading-state { text-align: center; padding: 40px; }
</style>
