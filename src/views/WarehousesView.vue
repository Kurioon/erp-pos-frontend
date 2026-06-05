<template>
  <div class="warehouses-view">
    <header class="warehouse-header">
      <h1>Склади та Номенклатура</h1>
      <p class="subtitle">Управління місцями зберігання та залишками</p>
    </header>

    <section class="warehouses-management-section">
      <div class="section-header">
        <h2>Активні склади</h2>
        <BaseButton @click="openWarehouseModal()">+ Додати склад</BaseButton>
      </div>

      <div v-if="warehousesStore.isLoading && warehousesStore.warehouses.length === 0" class="loading-state text-muted">
        Завантаження складів...
      </div>

      <div v-else class="warehouses-grid">
        <div v-for="warehouse in warehousesStore.warehouses" :key="warehouse.id" class="warehouse-card">
          <div class="card-header">
            <div class="w-name">
              <span class="status-dot"></span>
              {{ warehouse.name }}
            </div>
            <div class="w-actions">
              <button class="icon-btn edit" @click="openWarehouseModal(warehouse)" title="Редагувати">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
              </button>
              <button class="icon-btn delete" @click="promptDeleteWarehouse(warehouse)" title="Видалити">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          </div>
          <div class="card-footer">
            <span class="text-muted">ID: {{ warehouse.id }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="inventory-section">
      <div class="section-header">
        <h2>Номенклатура товарів</h2>
      </div>

      <WarehouseFilters
        class="inventory-filters"
        v-model:searchQuery="searchQuery"
        v-model:selectedWarehouse="selectedWarehouse"
        :warehouses="warehousesStore.warehouses"
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
    </section>

    <ProductDetailsDrawer
      :product="selectedProduct"
      :movement-history="movementHistory"
      :warehouses="warehousesStore.warehouses"
      @close="closeDrawer"
      @save="handleUpdatePrices"
      @move-stock="handleMoveStock"
    />

    <WarehouseFormModal
      v-if="isWarehouseModalOpen"
      :is-open="isWarehouseModalOpen"
      :edit-mode="!!editingWarehouse"
      :warehouse-data="editingWarehouse"
      @close="isWarehouseModalOpen = false"
      @save="handleSaveWarehouse"
    />

    <BaseModal
      :is-open="!!warehouseToDelete"
      @close="warehouseToDelete = null"
      title="Підтвердження видалення"
    >
      <div class="confirm-content">
        <p>Ви впевнені, що хочете видалити склад <strong>"{{ warehouseToDelete?.name }}"</strong>?</p>
        <p class="text-danger-sm">Всі товари будуть відв'язані від цього складу.</p>
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="warehouseToDelete = null">Скасувати</BaseButton>
        <BaseButton class="danger-btn" @click="confirmDeleteWarehouse">Видалити</BaseButton>
      </template>
    </BaseModal>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useWarehousesStore } from '@/stores/warehouses'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import WarehouseFilters from '@/components/warehouses/WarehouseFilters.vue'
import WarehouseTable from '@/components/warehouses/WarehouseTable.vue'
import ProductDetailsDrawer from '@/components/warehouses/ProductDetailsDrawer.vue'
import WarehouseFormModal from '@/components/warehouses/WarehouseFormModal.vue'

const warehousesStore = useWarehousesStore()

const searchQuery = ref('')
const selectedWarehouse = ref('')
const selectedProduct = ref(null)

const movementHistory = ref([])

const isWarehouseModalOpen = ref(false)
const editingWarehouse = ref(null)
const warehouseToDelete = ref(null)

onMounted(() => {
  warehousesStore.fetchWarehouses()
  warehousesStore.fetchInventory()
})

const openWarehouseModal = (warehouse = null) => {
  editingWarehouse.value = warehouse
  isWarehouseModalOpen.value = true
}

const handleSaveWarehouse = async (data) => {
  if (editingWarehouse.value) {
    await warehousesStore.updateWarehouse(editingWarehouse.value.id, data)
  } else {
    await warehousesStore.createWarehouse(data)
  }
  isWarehouseModalOpen.value = false
}

const promptDeleteWarehouse = (warehouse) => {
  warehouseToDelete.value = warehouse
}

const confirmDeleteWarehouse = async () => {
  if (warehouseToDelete.value) {
    await warehousesStore.deleteWarehouse(warehouseToDelete.value.id)
    warehouseToDelete.value = null
  }
}

const filteredProducts = computed(() => {
  return warehousesStore.inventoryList.filter(p => {
    const matchesSearch = (p.name && p.name.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
                          (p.code && p.code.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
                          (p.id && String(p.id).toLowerCase().includes(searchQuery.value.toLowerCase()))

    const matchesWarehouse = selectedWarehouse.value === '' || p.stock_details.some(s => s.warehouse === selectedWarehouse.value && Number(s.quantity) > 0)

    return matchesSearch && matchesWarehouse
  }).map(p => {
    if (selectedWarehouse.value !== '') {
      const specificStock = p.stock_details.find(s => s.warehouse === selectedWarehouse.value)
      const wName = warehousesStore.warehouses.find(w => w.id === selectedWarehouse.value)?.name
      return {
        ...p,
        display_stock: specificStock ? Number(specificStock.quantity || 0) : 0,
        display_warehouse: wName || ''
      }
    } else {
      return {
        ...p,
        display_stock: p.stock,
        display_warehouse: p.warehouse_names
      }
    }
  })
})

const openDrawer = async (product) => {
  selectedProduct.value = product
  movementHistory.value = await warehousesStore.fetchProductMovement(product.id)
}

const closeDrawer = () => {
  selectedProduct.value = null
  movementHistory.value = []
}

const handleUpdatePrices = async (updatedProductData) => {
  const payload = {
    purchase_price: String(updatedProductData.purchase_price),
    wholesale_price: String(updatedProductData.wholesale_price),
    retail_price: String(updatedProductData.retail_price),
    sale_price: String(updatedProductData.retail_price)
  }
  await warehousesStore.updateProductPrices(updatedProductData.id, payload)
  closeDrawer()
}

const handleMoveStock = async (moveData) => {
  await warehousesStore.moveStock(moveData)
  if (selectedProduct.value) {
    movementHistory.value = await warehousesStore.fetchProductMovement(selectedProduct.value.id)
    const updatedProduct = warehousesStore.inventoryList.find(p => p.id === selectedProduct.value.id)
    if (updatedProduct) {
      selectedProduct.value = updatedProduct
    }
  }
}
</script>

<style scoped>
.warehouses-view { padding: 32px; min-height: 100vh; display: flex; flex-direction: column; background-color: #f8fafc; }
.warehouse-header { margin-bottom: 32px; }
.warehouse-header h1 { font-size: 1.6rem; color: #0f172a; margin: 0 0 4px 0; font-weight: 700; letter-spacing: -0.02em; }
.subtitle { margin: 0; color: #64748b; font-size: 0.9rem; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; }
.section-header h2 { font-size: 1.15rem; color: #1e293b; margin: 0; font-weight: 700; }
.warehouses-management-section { margin-bottom: 40px; }
.warehouses-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
.warehouse-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); transition: all 0.2s ease; }
.warehouse-card:hover { border-color: #cbd5e1; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
.card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
.w-name { font-size: 1.05rem; font-weight: 600; color: #0f172a; display: flex; align-items: center; gap: 8px; }
.status-dot { width: 8px; height: 8px; background-color: #10b981; border-radius: 50%; display: inline-block; }
.w-actions { display: flex; gap: 4px; }
.icon-btn { background: transparent; border: none; width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; color: #94a3b8; }
.icon-btn.edit:hover { background: #f1f5f9; color: #2563eb; }
.icon-btn.delete:hover { background: #fef2f2; color: #ef4444; }
.card-footer { font-size: 0.8rem; color: #64748b; }

.inventory-filters {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .inventory-filters {
    flex-direction: column;
    gap: 12px;
  }
}
.loading-state { text-align: center; padding: 40px; }

.confirm-content { padding: 10px 0; font-size: 0.95rem; color: #334155; }
.confirm-content p { margin: 0 0 8px 0; }
.text-danger-sm { color: #ef4444; font-size: 0.8rem; }
.danger-btn { background-color: #ef4444 !important; border-color: #ef4444 !important; color: white !important;}
.danger-btn:hover { background-color: #dc2626 !important; border-color: #dc2626 !important; }
</style>
