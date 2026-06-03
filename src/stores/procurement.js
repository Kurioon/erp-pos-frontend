import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/axios'
import { PURCHASE_STATUSES } from '@/constants/purchases'

export const useProcurementStore = defineStore('procurement', () => {
  const orders = ref([])
  const isLoading = ref(false)

  const draftOrders = computed(() => {
    return orders.value.filter((order) => order.status === PURCHASE_STATUSES.DRAFT)
  })

  const fetchOrders = async () => {
    isLoading.value = true
    try {
      const response = await api.get('/orders/?order_type=purchase')
      orders.value = response.data.results || response.data || []
    } catch (error) {
      console.error('Помилка завантаження закупівель:', error)
      window.dispatchEvent(
        new CustomEvent('api-error', {
          detail: { message: 'Не вдалося завантажити закупівлі', type: 'error' },
        }),
      )
    } finally {
      isLoading.value = false
    }
  }

  const createOrder = async (payload) => {
    isLoading.value = true
    try {
      const response = await api.post('/orders/', {
        ...payload,
        order_type: 'purchase',
        status: PURCHASE_STATUSES.DRAFT,
      })

      orders.value.unshift(response.data)
      window.dispatchEvent(
        new CustomEvent('app-success', {
          detail: { message: 'Чернетку успішно створено!', type: 'success' },
        }),
      )
      return response.data
    } catch (error) {
      console.error('Помилка створення чернетки:', error)
      window.dispatchEvent(
        new CustomEvent('api-error', {
          detail: { message: 'Не вдалося створити закупівлю', type: 'error' },
        }),
      )
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const approveOrder = async (id) => {
    isLoading.value = true
    try {
      await api.patch(`/orders/${id}/`, { status: PURCHASE_STATUSES.APPROVED })

      const index = orders.value.findIndex((o) => o.id === id)
      if (index !== -1) {
        orders.value[index].status = PURCHASE_STATUSES.APPROVED
      }

      window.dispatchEvent(
        new CustomEvent('app-success', {
          detail: { message: 'Закупівлю затверджено! Товар додано на склад.', type: 'success' },
        }),
      )
    } catch (error) {
      console.error('Помилка затвердження:', error)
      window.dispatchEvent(
        new CustomEvent('api-error', {
          detail: { message: 'Не вдалося затвердити замовлення', type: 'error' },
        }),
      )
    } finally {
      isLoading.value = false
    }
  }

  return {
    orders,
    draftOrders,
    isLoading,
    fetchOrders,
    createOrder,
    approveOrder,
  }
})
