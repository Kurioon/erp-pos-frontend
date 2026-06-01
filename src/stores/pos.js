import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/axios'

export const useCartStore = defineStore('pos', () => {
  const items = ref([])
  const prepayAmount = ref(0)
  const commentTtn = ref('')
  const currency = ref('UAH')

  const availableCashboxes = ref([])
  const activeCashbox = ref(null)
  const products = ref([])
  const isLoading = ref(false)

  const totalAmount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.price * item.qty, 0)
  })

  const balanceDue = computed(() => {
    return Math.max(0, totalAmount.value - prepayAmount.value)
  })

  const orderStatus = computed(() => {
    if (items.value.length === 0) return 'new'
    if (balanceDue.value === 0) return 'paid'
    if (prepayAmount.value > 0) return 'partially_paid'
    return 'pending'
  })

  const fetchCashboxes = async () => {
    try {
      const response = await api.get('/cash-registers/')
      availableCashboxes.value = response.data.results || []

      if (availableCashboxes.value.length > 0 && !activeCashbox.value) {
        activeCashbox.value = availableCashboxes.value[0]
      }
    } catch (error) {
      console.error('Помилка завантаження кас:', error)
      window.dispatchEvent(
        new CustomEvent('api-error', {
          detail: { message: 'Не вдалося завантажити список кас', type: 'error' },
        }),
      )
    }
  }

  const fetchProducts = async (page = 1) => {
    isLoading.value = true
    try {
      const [productsResponse, stocksResponse] = await Promise.all([
        api.get(`/products/?page=${page}`),
        api.get('/warehouse-stocks/'),
      ])

      const fetchedProducts = productsResponse.data.results || []
      const stocksData = stocksResponse.data.results || []

      products.value = fetchedProducts.map((product) => {
        const productStocks = stocksData.filter((s) => s.nomenclature === product.id)

        const totalStock = productStocks.reduce((sum, stockRecord) => sum + stockRecord.quantity, 0)

        return {
          ...product,
          stock: totalStock,
        }
      })
    } catch (error) {
      console.error('Помилка завантаження каталогу:', error)
      window.dispatchEvent(
        new CustomEvent('api-error', {
          detail: { message: 'Помилка завантаження товарів', type: 'error' },
        }),
      )
    } finally {
      isLoading.value = false
    }
  }

  const addItem = (product) => {
    const stock = product.stock

    if (stock <= 0) {
      window.dispatchEvent(
        new CustomEvent('api-error', {
          detail: { message: `Товар "${product.name}" закінчився на складі!`, type: 'error' },
        }),
      )
      return
    }

    const existing = items.value.find((i) => i.id === product.id)
    if (existing) {
      if (existing.qty < stock) {
        existing.qty += 1
      } else {
        window.dispatchEvent(
          new CustomEvent('api-error', {
            detail: { message: `Максимальна доступна кількість: ${stock} шт.`, type: 'warning' },
          }),
        )
      }
    } else {
      items.value.push({
        id: product.id,
        title: product.name,
        price: Number(product.sale_price),
        qty: 1,
        stock: stock,
      })
    }
  }

  const removeItem = (productId) => {
    items.value = items.value.filter((i) => i.id !== productId)
  }

  const updateItemQuantity = (productId, newQty) => {
    const existing = items.value.find((i) => i.id === productId)
    if (existing) {
      if (newQty > existing.stock) {
        window.dispatchEvent(
          new CustomEvent('api-error', {
            detail: {
              message: `Більше немає на складі. Доступно: ${existing.stock} шт.`,
              type: 'warning',
            },
          }),
        )
        return
      }

      if (newQty > 0) {
        existing.qty = newQty
      } else {
        removeItem(productId)
      }
    }
  }

  const clearCart = () => {
    items.value = []
    prepayAmount.value = 0
    commentTtn.value = ''
  }

const getOrderPayload = () => ({
    items: items.value.map((i) => ({
    product: i.id,
    quantity: i.qty,
  })),

  total_amount: totalAmount.value,
  order_type: 'retail',

  prepay_amount: prepayAmount.value,
  balance_due: balanceDue.value,
  status: orderStatus.value,
  comment_ttn: commentTtn.value,
  cash_register: activeCashbox.value?.id || null,
})

  return {
    items,
    prepayAmount,
    commentTtn,
    currency,
    availableCashboxes,
    activeCashbox,
    products,
    isLoading,
    totalAmount,
    balanceDue,
    orderStatus,
    fetchCashboxes,
    fetchProducts,
    addItem,
    removeItem,
    updateItemQuantity,
    clearCart,
    getOrderPayload,
  }
})
