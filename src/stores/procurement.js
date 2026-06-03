import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/axios'
import { PURCHASE_STATUSES } from '@/constants/purchases'
import { useCartStore } from '@/stores/pos'

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
      let fetchedOrders = response.data.results || response.data || []

      fetchedOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

      const cartStore = useCartStore()
      if (cartStore.products.length === 0) {
        await cartStore.fetchProducts()
      }

      orders.value = fetchedOrders.map((order) => {
        let supplierName = 'Невідомий постачальник'
        if (order.comment_ttn && order.comment_ttn.includes('Постачальник:')) {
          const match = order.comment_ttn.match(/Постачальник:\s*(.*?)\s*\|/)
          if (match) supplierName = match[1]
        }

        return {
          ...order,
          supplier: supplierName,
          date: order.created_at,
          items: (order.items || []).map((item) => {
            const productObj = cartStore.products.find((p) => p.id === item.product)
            return {
              ...item,
              name: productObj ? productObj.name || productObj.title : `Товар #${item.product}`,
              qty: item.quantity,
              price: Number(item.price || 0),
            }
          }),
        }
      })
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
      const orderResponse = await api.post('/orders/', {
        order_type: 'purchase',
        status: PURCHASE_STATUSES.DRAFT,
        total_amount: payload.total_amount,
        comment_ttn: payload.comment_ttn,
      })

      const newOrderId = orderResponse.data.id

      if (payload.items && payload.items.length > 0) {
        const itemPromises = payload.items.map((item) => {
          return api.post(`/orders/${newOrderId}/items/`, {
            product: item.product,
            quantity: item.quantity,
            price: String(item.price),
          })
        })
        await Promise.all(itemPromises)
      }

      await fetchOrders()

      window.dispatchEvent(
        new CustomEvent('app-success', {
          detail: { message: 'Чернетку закупівлі успішно створено!', type: 'success' },
        }),
      )
      return orderResponse.data
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

  const updateOrder = async (id, payload) => {
    isLoading.value = true
    try {
      const existingOrder = orders.value.find((o) => o.id === id)

      if (existingOrder && existingOrder.items && existingOrder.items.length > 0) {
        const deletePromises = existingOrder.items
          .filter((item) => item.id)
          .map((item) => api.delete(`/orders/${id}/items/${item.id}/`))

        await Promise.all(deletePromises)
      }

      if (payload.items && payload.items.length > 0) {
        const createPromises = payload.items.map((item) => {
          return api.post(`/orders/${id}/items/`, {
            product: item.product,
            quantity: item.quantity,
            price: String(item.price),
          })
        })
        await Promise.all(createPromises)
      }

      await api.patch(`/orders/${id}/`, {
        total_amount: payload.total_amount,
        comment_ttn: payload.comment_ttn,
      })

      await fetchOrders()
      window.dispatchEvent(
        new CustomEvent('app-success', {
          detail: { message: 'Закупівлю успішно оновлено!', type: 'success' },
        }),
      )
    } catch (error) {
      console.error('Помилка оновлення:', error)
      window.dispatchEvent(
        new CustomEvent('api-error', {
          detail: { message: 'Не вдалося оновити замовлення', type: 'error' },
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
          detail: { message: 'Закупівлю затверджено! Товари додано на склад.', type: 'success' },
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
    updateOrder,
    approveOrder,
  }
})
