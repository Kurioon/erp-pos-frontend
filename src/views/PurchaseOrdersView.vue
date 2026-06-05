<template>
  <div class="purchase-orders-view">
    <h1>Замовлення на закупівлю</h1>

    <table v-if="!ordersStore.isLoading" class="orders-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Статус</th>
          <th>Сума</th>
          <th>Постачальник</th>
          <th>Дата</th>
          <th>Дії</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in purchaseOrders" :key="order.id">
          <td>#{{ order.id }}</td>
          <td>
            <span :class="['status-badge', `status-${order.status}`]">{{
              order.status
            }}</span>
          </td>
          <td>{{ order.total_amount }}</td>
          <td>{{ order.supplier_name || 'N/A' }}</td>
          <td>{{ new Date(order.created_at).toLocaleDateString() }}</td>
          <td>
            <BaseButton
              v-if="order.status === 'paid'"
              @click="openReceiveModal(order)"
              size="small"
            >
              Затвердити
            </BaseButton>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else>Завантаження замовлень...</div>

    <ReceiveOrderModal
      :is-open="isReceiveModalOpen"
      :order="orderToReceive"
      @close="closeReceiveModal"
      @confirm="handleReceiveConfirm"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useOrdersStore } from '@/stores/orders'
import { useWarehousesStore } from '@/stores/warehouses'
import { useCartStore } from '@/stores/cart'

import BaseButton from '@/components/ui/BaseButton.vue'
import ReceiveOrderModal from '@/components/orders/ReceiveOrderModal.vue'

const ordersStore = useOrdersStore()
const warehousesStore = useWarehousesStore()
const cartStore = useCartStore()

const isReceiveModalOpen = ref(false)
const orderToReceive = ref(null)

onMounted(() => {
  ordersStore.fetchOrders()
})

const purchaseOrders = computed(() => {
  return ordersStore.orders.filter((o) => o.order_type === 'purchase')
})

function openReceiveModal(order) {
  orderToReceive.value = order
  isReceiveModalOpen.value = true
}

function closeReceiveModal() {
  isReceiveModalOpen.value = false
  orderToReceive.value = null
}

async function handleReceiveConfirm({ orderId, warehouseId }) {
  try {
    await ordersStore.receiveOrder(orderId, warehouseId)
    closeReceiveModal()

    // Оновлюємо всі необхідні дані
    await Promise.all([
      ordersStore.fetchOrders(),
      warehousesStore.fetchWarehouses(),
      warehousesStore.fetchInventory(),
      cartStore.fetchProducts(),
    ])
    // Тут можна показати сповіщення про успіх
  } catch (error) {
    // Тут можна показати сповіщення про помилку
  }
}
</script>

<style scoped>
.orders-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
.orders-table th, .orders-table td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
.status-badge { padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; font-weight: 600; color: white; }
.status-paid { background-color: #22c55e; }
.status-draft { background-color: #a1a1aa; }
.status-completed { background-color: #3b82f6; }
</style>