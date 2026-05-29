import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('pos', () => {
  const items = ref([])
  const prepayAmount = ref(0) 
  const commentTtn = ref('') 
  const currency = ref('UAH') 

  const totalAmount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.price * item.qty, 0)
  })

  const balanceDue = computed(() => {
    return Math.max(0, totalAmount.value - prepayAmount.value)
  })

  const addItem = (product) => {
    const existing = items.value.find((i) => i.id === product.id)
    if (existing) {
      existing.qty += 1
    } else {
      items.value.push({
        id: product.id,
        title: product.title,
        price: product.retail_price,
        qty: 1,
      })
    }
  }

  const removeItem = (productId) => {
    items.value = items.value.filter((i) => i.id !== productId)
  }

  const updateItemQuantity = (productId, newQty) => {
    const existing = items.value.find((i) => i.id === productId)
    if (existing) {
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
    comment_ttn: commentTtn.value,
  })

  return {
    items,
    prepayAmount,
    commentTtn,
    currency,
    totalAmount,
    balanceDue,
    addItem,
    removeItem,
    updateItemQuantity,
    clearCart,
    getOrderPayload,
  }
})
