<template>
  <div class="purchases-view">
    <header class="page-header">
      <div class="header-info">
        <h1>Закупівлі</h1>
        <p class="subtitle">Замовлення постачальникам</p>
      </div>
      <BaseButton @click="openCreateModal">+ Створити чернетку</BaseButton>
    </header>

    <main>
      <div class="controls-bar">
        <div class="filters-group">
          <BaseSelect
            v-model="filterStatus"
            :options="statusOptions"
            placeholder="Всі статуси"
            class="control-select"
          />
          <BaseSelect
            v-model="sortOrder"
            :options="SORT_OPTIONS"
            class="control-select"
          />
        </div>
        <div class="stats-text text-muted">
          Знайдено записів: <b>{{ filteredAndSortedOrders.length }}</b>
        </div>
      </div>

      <div v-if="procurementStore.isLoading && procurementStore.orders.length === 0" class="loading-state">
        Завантаження закупівель...
      </div>

      <PurchasesTable
        v-else
        :purchases="filteredAndSortedOrders"
        @edit="openEditModal"
        @approve="approveOrder"
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProcurementStore } from '@/stores/procurement'
import { PURCHASE_STATUS_LABELS, SORT_OPTIONS } from '@/constants/purchases'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import PurchasesTable from '@/components/purchases/PurchasesTable.vue'
import PurchaseFormModal from '@/components/purchases/PurchaseFormModal.vue'

const procurementStore = useProcurementStore()
const suppliersList = ref(['Apple Distribution Ukraine', 'Samsung Electronics Ukraine', 'Lenovo Ukraine', 'Xiaomi Official'])

const isModalOpen = ref(false)
const isEditMode = ref(false)
const selectedOrder = ref(null)

const filterStatus = ref('all')
const sortOrder = ref('newest')

const statusOptions = computed(() => {
  const options = [{ value: 'all', label: 'Всі статуси' }]
  Object.entries(PURCHASE_STATUS_LABELS).forEach(([val, label]) => {
    options.push({ value: val, label })
  })
  return options
})

const filteredAndSortedOrders = computed(() => {
  let result = [...procurementStore.orders]
  if (filterStatus.value !== 'all') {
    result = result.filter(o => o.status === filterStatus.value)
  }
  result.sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return sortOrder.value === 'newest' ? dateB - dateA : dateA - dateB
  })
  return result
})

onMounted(() => {
  procurementStore.fetchOrders()
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

const handleAddSupplier = (supplierName) => {
  if (!suppliersList.value.includes(supplierName)) {
    suppliersList.value.push(supplierName)
  }
}

const handleSaveOrder = async (payload) => {
  if (isEditMode.value && selectedOrder.value) {
    await procurementStore.updateOrder(selectedOrder.value.id, payload)
  } else {
    await procurementStore.createOrder(payload)
  }
  isModalOpen.value = false
}

const approveOrder = async (id) => {
  if (confirm('Затвердити закупівлю? Товари будуть зараховані на склад.')) {
    await procurementStore.approveOrder(id)
  }
}
</script>

<style scoped>
.purchases-view { padding: 32px; background-color: #ffffff; min-height: 100vh; display: flex; flex-direction: column; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.header-info h1 { font-size: 1.6rem; color: #0f172a; margin: 0 0 4px 0; font-weight: 700; }
.subtitle { margin: 0; color: #64748b; font-size: 0.9rem; }
.controls-bar { display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 20px; }
.filters-group { display: flex; gap: 16px; }
.control-select { width: 220px; }
.stats-text { font-size: 0.9rem; }
.stats-text b { color: #0f172a; }
.loading-state { text-align: center; color: #94a3b8; padding: 40px; font-size: 1.1rem; }
</style>
