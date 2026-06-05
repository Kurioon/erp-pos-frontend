<template>
  <div class="purchases-view">
    <header class="page-header">
      <div class="header-info">
        <h1>Закупівлі</h1>
        <p class="subtitle">Замовлення постачальникам</p>
      </div>
      <BaseButton @click="openCreateModal">+ Створити чернетку</BaseButton>
    </header>

    <div class="filters-section">
      <BaseSelect
        v-model="filters.status"
        :options="statusOptions"
        placeholder="Всі статуси"
        @update:modelValue="applyFilters"
        class="filter-select"
      />
      <BaseSelect
        v-model="filters.ordering"
        :options="orderingOptions"
        @update:modelValue="applyFilters"
        class="filter-select"
      />
      <BaseButton variant="secondary" @click="resetFilters" class="reset-btn">
        Скинути
      </BaseButton>
    </div>

    <main>
      <div v-if="procurementStore.isLoading && procurementStore.orders.length === 0" class="loading-state">
        Завантаження закупівель...
      </div>
      <div v-else-if="!procurementStore.orders || procurementStore.orders.length === 0" class="loading-state">
        Закупівель не знайдено
      </div>

      <PurchasesTable
        v-else
        :purchases="procurementStore.orders"
        @edit="openEditModal"
        @approve="openReceiveModal"
      />
    </main>

    <PurchaseFormModal
      v-if="isModalOpen"
      :is-open="isModalOpen"
      :edit-mode="isEditMode"
      :order-data="selectedOrder"
      :suppliers="suppliersList"
      @close="isModalOpen = false"
      @add-supplier="handleAddSupplier"
      @save="handleSaveOrder"
    />

    <ReceiveOrderModal
      :is-open="isReceiveModalOpen"
      :order="orderToReceive"
      @close="closeReceiveModal"
      @confirm="handleReceiveConfirm"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useProcurementStore } from '@/stores/procurement'
import { PURCHASE_STATUS_LABELS } from '@/constants/purchases'
import api from '@/api/axios' // Підключаємо API для постачальників
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import PurchasesTable from '@/components/purchases/PurchasesTable.vue'
import PurchaseFormModal from '@/components/purchases/PurchaseFormModal.vue'
import ReceiveOrderModal from '@/components/orders/ReceiveOrderModal.vue'
import { useWarehousesStore } from '@/stores/warehouses'

const procurementStore = useProcurementStore()
const suppliersList = ref([]) // Тепер порожній масив, заповнюється з API

const isModalOpen = ref(false)
const isEditMode = ref(false)
const selectedOrder = ref(null)

const warehousesStore = useWarehousesStore()

const isReceiveModalOpen = ref(false)
const orderToReceive = ref(null)

const filters = ref({
  status: '',
  ordering: '-created_at'
})

const statusOptions = [
  { value: '', label: 'Всі статуси' },
  ...Object.entries(PURCHASE_STATUS_LABELS).map(([value, label]) => ({ value, label }))
]

const orderingOptions = [
  { value: '-created_at', label: 'Спочатку нові' },
  { value: 'created_at', label: 'Спочатку старі' }
]

// Отримуємо реальних постачальників
const fetchSuppliers = async () => {
  try {
    const response = await api.get('/suppliers/')
    suppliersList.value = response.data.results || response.data || []
  } catch (error) {
    console.error('Помилка завантаження постачальників:', error)
  }
}

const applyFilters = () => {
  procurementStore.fetchOrders(filters.value)
}

const resetFilters = () => {
  filters.value = { status: '', ordering: '-created_at' }
  applyFilters()
}

onMounted(async () => {
  await fetchSuppliers() // Спочатку тягнемо постачальників
  applyFilters()
})

const openCreateModal = () => {
  isEditMode.value = false
  selectedOrder.value = null
  isModalOpen.value = true
}

const openEditModal = (order) => {
  isEditMode.value = true
  selectedOrder.value = order
  isModalOpen.value = true
}

// Функція тепер створює постачальника на бекенді та повертає його ID
const handleAddSupplier = async (supplierName, callback) => {
  try {
    const response = await api.post('/suppliers/', { name: supplierName })
    const newSupplier = response.data
    suppliersList.value.push(newSupplier)
    
    // Передаємо новий ID у модалку для автоматичного вибору
    if (callback) callback(newSupplier.id)
  } catch (error) {
    console.error('Помилка створення постачальника:', error)
    window.dispatchEvent(new CustomEvent('api-error', { 
      detail: { message: 'Не вдалося створити постачальника', type: 'error' } 
    }))
  }
}

const handleSaveOrder = async (payload) => {
  if (!isEditMode.value) {
    await procurementStore.createOrder(payload)
  } else {
    await procurementStore.updateOrder(selectedOrder.value.id, payload)
  }
  isModalOpen.value = false
  applyFilters()
}

const openReceiveModal = (id) => {
  // Компонент таблиці передає тільки ID, тому робимо об'єкт-заглушку для модалки
  orderToReceive.value = { id } 
  isReceiveModalOpen.value = true
}

const closeReceiveModal = () => {
  isReceiveModalOpen.value = false
  orderToReceive.value = null
}

const handleReceiveConfirm = async ({ orderId, warehouseId }) => {
  try {
    // Робимо правильний запит на прийомку
    await api.post(`/orders/${orderId}/receive/`, { warehouse: warehouseId })
    closeReceiveModal()

    // 1. Оновлюємо статус в поточній таблиці
    applyFilters() 
    

    // alert('Товари успішно прийняті на склад!') // Можеш розкоментувати за бажанням
  } catch (error) {
    console.error('Помилка прийомки:', error)
    alert('Помилка прийомки. Перевірте консоль.')
  }
}
</script>

<style scoped>
.purchases-view { padding: 32px; background-color: #ffffff; min-height: 100vh; display: flex; flex-direction: column; max-width: 100vw; overflow-x: hidden; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
.header-info { display: flex; flex-direction: column; gap: 4px; }
.header-info h1 { font-size: 1.6rem; color: #0f172a; margin: 0; font-weight: 700; letter-spacing: -0.02em; }
.subtitle { margin: 0; color: #64748b; font-size: 0.9rem; }
.filters-section { display: flex; gap: 12px; align-items: center; background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 32px; flex-wrap: wrap; }
.filter-select { flex: 1; min-width: 180px; margin-bottom: 0 !important; }
.filter-select :deep(div) { margin-bottom: 0 !important; }
.reset-btn { flex-shrink: 0; height: 42px; display: flex; align-items: center; white-space: nowrap; }
.loading-state { text-align: center; color: #94a3b8; padding: 40px; font-size: 1.1rem; }

@media (max-width: 768px) {
  .purchases-view { padding: 16px; }
  .page-header { flex-direction: column; align-items: stretch; margin-bottom: 24px; }
  .page-header :deep(button) { width: 100%; justify-content: center; }
  .filters-section { flex-direction: column; align-items: stretch; }
  .reset-btn { width: 100%; justify-content: center; }
}
</style>