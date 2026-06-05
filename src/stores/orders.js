import { defineStore } from 'pinia'
import api from '@/services/api' // Assuming an api service exists

export const useOrdersStore = defineStore('orders', {
  state: () => ({
    orders: [],
    isLoading: false,
    // ... other state properties
  }),
  actions: {
    async fetchOrders() {
      this.isLoading = true
      try {
        const response = await api.get('/orders/') // Assuming endpoint
        this.orders = response.data
      } catch (error) {
        console.error('Failed to fetch orders:', error)
        // Handle error (e.g., show a notification)
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Нова дія для прийомки товарів по замовленню на склад.
     * @param {number} orderId - ID замовлення
     * @param {number} warehouseId - ID складу для прийомки
     */
    async receiveOrder(orderId, warehouseId) {
      try {
        const response = await api.post(`/orders/${orderId}/receive/`, {
          warehouse_id: warehouseId,
        })
        return response.data
      } catch (error) {
        console.error(`Failed to receive order ${orderId}:`, error)
        throw error
      }
    },
  },
})