<script setup>
import { ref } from 'vue'
import { PURCHASE_STATUSES } from '@/constants/purchases'

// Базові UI та твої нові декомпоновані компоненти
import BaseButton from '@/components/ui/BaseButton.vue'
import PurchasesTable from '@/components/purchases/PurchasesTable.vue'
import PurchaseFormModal from '@/components/purchases/PurchaseFormModal.vue'

// Мокові дані закупівель
const purchases = ref([
  {
    id: 'PO-001',
    supplier: 'Apple Distribution Ukraine',
    date: '2026-05-25',
    status: PURCHASE_STATUSES.APPROVED,
    items: [
      { name: 'iPhone 15 Pro Max 256GB', qty: 5, price: 38000 },
      { name: 'MacBook Air M3 13"', qty: 4, price: 54000 },
      { name: 'Зарядний пристрій Apple 140W', qty: 20, price: 2500 }
    ]
  },
  {
    id: 'PO-002',
    supplier: 'Samsung Electronics Ukraine',
    date: '2026-05-26', 
    status: PURCHASE_STATUSES.DRAFT,
    items: [
      { name: 'Samsung Galaxy S24 Ultra', qty: 6, price: 32000 },
      { name: 'Samsung 55" QLED 4K', qty: 3, price: 32000 }
    ]
  },
  {
    id: 'PO-003',
    supplier: 'Lenovo Ukraine',
    date: '2026-05-27',
    status: PURCHASE_STATUSES.DRAFT,
    items: [
      { name: 'Lenovo ThinkPad X1 Carbon', qty: 3, price: 52000 }
    ]
  },
  {
    id: 'PO-004',
    supplier: 'Apple Distribution Ukraine',
    date: '2026-05-20',
    status: PURCHASE_STATUSES.RECEIVED,
    items: [
      { name: 'AirPods Pro 2nd Gen', qty: 10, price: 6000 },
      { name: 'Apple Watch Ultra 2', qty: 5, price: 18000 },
      { name: 'Зарядний пристрій Apple 140W', qty: 12, price: 2500 }
    ]
  }
])

const suppliersList = ref(['Apple Distribution Ukraine', 'Samsung Electronics Ukraine', 'Lenovo Ukraine', 'Xiaomi Official'])

const isModalOpen = ref(false)
const isEditMode = ref(false)
const selectedOrder = ref(null)

const approveOrder = (id) => {
  const order = purchases.value.find(p => p.id === id)
  if (order) order.status = PURCHASE_STATUSES.APPROVED
}

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

const handleSaveOrder = (modalOrderData) => {
  if (isEditMode.value && selectedOrder.value) {
    const order = purchases.value.find(p => p.id === selectedOrder.value.id)
    if (order) {
      order.supplier = modalOrderData.supplier
      order.date = modalOrderData.date
      order.items = [...modalOrderData.items]
    }
  } else {
    const nextIdNumber = purchases.value.length + 1
    const formattedId = `PO-${String(nextIdNumber).padStart(3, '0')}`
    purchases.value.unshift({
      id: formattedId,
      supplier: modalOrderData.supplier,
      date: modalOrderData.date,
      status: PURCHASE_STATUSES.DRAFT,
      items: [...modalOrderData.items]
    })
  }
  isModalOpen.value = false
}
</script>

<template>
  <div class="purchases-view">
    <header class="page-header">
      <div class="header-info">
        <h1>Закупівлі</h1>
        <p class="subtitle">Замовлення постачальникам</p>
      </div>
    </header>

    <main>
      <PurchasesTable 
        :purchases="purchases" 
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

<style scoped>
.purchases-view {
  padding: 32px;
  background-color: #ffffff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.header-info h1 {
  font-size: 1.6rem;
  color: #0f172a;
  margin: 0 0 4px 0;
  font-weight: 700;
}

.subtitle {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
}
</style>
