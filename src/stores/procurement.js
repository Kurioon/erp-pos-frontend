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

  const fetchOrders = async (filters = {}) => {
    isLoading.value = true
    try {
      const params = new URLSearchParams()
      params.append('order_type', 'purchase')
      if (filters.status) params.append('status', filters.status)
      if (filters.ordering) params.append('ordering', filters.ordering)

      const response = await api.get(`/orders/?${params.toString()}`)
      let fetchedOrders = response.data.results || response.data || []

      if (filters.status) {
        fetchedOrders = fetchedOrders.filter((o) => o.status === filters.status)
      }

      if (filters.ordering === 'created_at' || filters.ordering === 'oldest') {
        fetchedOrders.sort((a, b) => a.id - b.id)
      } else {
        fetchedOrders.sort((a, b) => b.id - a.id)
      }

      const cartStore = useCartStore()
      if (cartStore.products.length === 0) {
        await cartStore.fetchProducts()
      }

      orders.value = fetchedOrders.map((order) => {
        // Трансформуємо товари
        const transformedItems = (order.items || []).map((item) => {
          let prodId = item.product
          let prodName = item.product_name || item.name || item.title || ''

          if (typeof item.product === 'object' && item.product !== null) {
            prodName = item.product.name || item.product.title
            prodId = item.product.id
          }

          const productObj = cartStore.products.find((p) => p.id === prodId)

          return {
            ...item,
            product: prodId,
            name:
              prodName || (productObj ? productObj.name || productObj.title : `Товар #${prodId}`),
            qty: Number(item.quantity || item.qty || 0),
            price: Number(item.price || 0),
          }
        })

        // Обробляємо постачальника: шукаємо в 3 місцях
        let supplierName = order.supplier_name || order.supplier || null
        
        // Якщо постачальник не знайдено - шукаємо в comment_ttn
        if (!supplierName && order.comment_ttn && order.comment_ttn.includes('Постачальник:')) {
          const match = order.comment_ttn.match(/Постачальник:\s*(.*?)\s*\|/)
          if (match) supplierName = match[1]
        }

        // Fallback значення
        if (!supplierName) {
          supplierName = 'Невідомий постачальник'
        }

        // Динамично обчислюємо total_amount на основі items
        // Якщо бекенд не передав total_amount, то рахуємо суму товарів
        const calculatedTotal = transformedItems.reduce((sum, item) => {
          return sum + (Number(item.qty || 0) * Number(item.price || 0))
        }, 0)

        const totalAmount = calculatedTotal

        return {
          ...order,
          supplier: supplierName,
          date: order.created_at,
          items: transformedItems,
          total_amount: totalAmount,
          // Додаємо recalculated_total для дебагу (щоб знати, яка сума виходить з items)
          recalculated_total: calculatedTotal,
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
            quantity: Number(item.quantity),
            price: Number(item.price),
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
            quantity: Number(item.quantity),
            price: Number(item.price),
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
      await fetchOrders()
      window.dispatchEvent(
        new CustomEvent('app-success', {
          detail: { message: 'Закупівлю затверджено!', type: 'success' },
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
