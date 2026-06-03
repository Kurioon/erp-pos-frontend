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
      <div v-if="procurementStore.isLoading && procurementStore.orders.length === 0" class="loading-state">
        Завантаження закупівель...
      </div>
      <PurchasesTable
        v-else
        :purchases="procurementStore.orders"
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
import { ref, onMounted } from 'vue'
import { useProcurementStore } from '@/stores/procurement'
import BaseButton from '@/components/ui/BaseButton.vue'
import PurchasesTable from '@/components/purchases/PurchasesTable.vue'
import PurchaseFormModal from '@/components/purchases/PurchaseFormModal.vue'

const procurementStore = useProcurementStore()

// Тимчасовий мок постачальників, поки бекенд не зробить довідник контрагентів
const suppliersList = ref(['Apple Distribution Ukraine', 'Samsung Electronics Ukraine', 'Lenovo Ukraine', 'Xiaomi Official'])

const isModalOpen = ref(false)
const isEditMode = ref(false)
const selectedOrder = ref(null)

onMounted(() => {
  procurementStore.fetchOrders()
})

const openCreateModal = () => {
  isEditMode.value = false
  selectedOrder.value = null
  isModalOpen.value = true
}

const handleAddSupplier = (supplierName) => {
  if (!suppliersList.value.includes(supplierName)) {
    suppliersList.value.push(supplierName)
  }
}

const handleSaveOrder = async (payload) => {
  if (!isEditMode.value) {
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
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
.header-info h1 { font-size: 1.6rem; color: #0f172a; margin: 0 0 4px 0; font-weight: 700; }
.subtitle { margin: 0; color: #64748b; font-size: 0.9rem; }
.loading-state { text-align: center; color: #94a3b8; padding: 40px; font-size: 1.1rem; }
</style>
