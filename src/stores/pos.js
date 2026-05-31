import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('pos', () => {
  const items = ref([])
  const prepayAmount = ref(0)
  const commentTtn = ref('')
  const currency = ref('UAH')

  const availableCashboxes = ref([
    { id: 1, name: 'Каса №1 (Головна)', currency: 'UAH' },
    { id: 2, name: 'Каса №2 (Долар)', currency: 'USD' },
  ])
  const activeCashbox = ref(availableCashboxes.value[0])

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

  const addItem = (product) => {
    if (product.stock === 0) {
      window.dispatchEvent(
        new CustomEvent('api-error', {
          detail: { message: `Товар "${product.title}" закінчився на складі!`, type: 'warning' },
        }),
      )
      return
    }

    const existing = items.value.find((i) => i.id === product.id)
    if (existing) {
      if (existing.qty < existing.stock) {
        existing.qty += 1
      } else {
        window.dispatchEvent(
          new CustomEvent('api-error', {
            detail: {
              message: `Максимальна доступна кількість: ${existing.stock} шт.`,
              type: 'warning',
            },
          }),
        )
      }
    } else {
      items.value.push({
        id: product.id,
        title: product.title,
        price: product.retail_price,
        qty: 1,
        stock: product.stock,
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
    items: items.value.map((i) => ({ id: i.id, qty: i.qty })),
    prepay_amount: prepayAmount.value,
    debt_amount: balanceDue.value,
    status: orderStatus.value,
    comment_ttn: commentTtn.value,
    cashbox_id: activeCashbox.value.id,
  })

  return {
    items,
    prepayAmount,
    commentTtn,
    currency,
    availableCashboxes, 
    activeCashbox,
    totalAmount,
    balanceDue,
    orderStatus,
    addItem,
    removeItem,
    updateItemQuantity,
    clearCart,
    getOrderPayload,
  }
})
