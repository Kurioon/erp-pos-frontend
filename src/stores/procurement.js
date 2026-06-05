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
      // 1. Формуємо параметри запиту
      const params = { order_type: 'purchase' }
      if (filters.status) params.status = filters.status
      if (filters.ordering) params.ordering = filters.ordering

      let allOrders = []
      let page = 1

      // 2. Збираємо всі сторінки пагінації (Вирішення Завдання #3)
      while (true) {
        params.page = page
        const { data } = await api.get('/orders/', { params })
        
        const results = data.results || data || []
        allOrders = allOrders.concat(results)

        // Якщо наступної сторінки немає — виходимо з циклу
        if (!data.next) break
        page++
      }

      let fetchedOrders = allOrders

      // Залишаємо локальну фільтрацію/сортування для страховки
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
            name: prodName || (productObj ? productObj.name || productObj.title : `Товар #${prodId}`),
            qty: Number(item.quantity || item.qty || 0),
            price: Number(item.price || 0),
          }
        })

        // Обробляємо постачальника (Вирішення Завдання #1)
        const supplierName = order.supplier_name || 'Невідомий постачальник'

        // Динамічно обчислюємо суму
        const calculatedTotal = transformedItems.reduce((sum, item) => {
          return sum + (Number(item.qty || 0) * Number(item.price || 0))
        }, 0)

        return {
          ...order,
          supplier_id: order.supplier, // ID для збереження
          supplier: supplierName,      // Текстова назва для UI
          date: order.created_at,
          items: transformedItems,
          total_amount: calculatedTotal,
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
        supplier: payload.supplier, // Передаємо ID постачальника
        comment_ttn: payload.comment_ttn || '',
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
        supplier: payload.supplier, // Оновлюємо ID постачальника
        comment_ttn: payload.comment_ttn || '',
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