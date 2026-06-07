import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/axios'

export const useCartStore = defineStore('pos', () => {
  const items = ref([])
  const prepayAmount = ref(0)
  const commentTtn = ref('')
  const currency = ref('UAH')

  const cartDiscountType = ref('amount')
  const cartDiscountValue = ref(0)

  const availableCashboxes = ref([])
  const activeCashbox = ref(null)
  const products = ref([])
  const isLoading = ref(false)

  const totalAmount = computed(() => {
    const itemsTotal = items.value.reduce((sum, item) => {
      let currentPrice = 0
      if (currency.value === 'UAH') currentPrice = Number(item.price_uah || item.price)
      else if (currency.value === 'USD') currentPrice = Number(item.price_usd || 0)
      else if (currency.value === 'EUR') currentPrice = Number(item.price_eur || 0)
      
      let itemDiscountAmount = 0
      if (item.discount_type === 'percent') {
        itemDiscountAmount = currentPrice * (Number(item.discount_value) / 100)
      } else if (item.discount_type === 'amount') {
        itemDiscountAmount = Number(item.discount_value)
      }
      
      const itemFinalPrice = Math.max(0, currentPrice - itemDiscountAmount)
      return sum + (itemFinalPrice * item.qty)
    }, 0)

    let finalTotal = itemsTotal
    if (cartDiscountType.value === 'percent') {
      finalTotal -= itemsTotal * (Number(cartDiscountValue.value) / 100)
    } else if (cartDiscountType.value === 'amount') {
      finalTotal -= Number(cartDiscountValue.value)
    }
    
    return Math.max(0, finalTotal)
  })
  const balanceDue = computed(() => Math.max(0, totalAmount.value - prepayAmount.value))
  const orderStatus = computed(() => {
    if (items.value.length === 0) return 'new'
    if (balanceDue.value === 0) return 'paid'
    if (prepayAmount.value > 0) return 'partially_paid'
    return 'pending'
  })

  const fetchAllStocks = async () => {
    let allStocks = []
    let page = 1
    while (true) {
      try {
        const { data } = await api.get('/warehouse-stocks/', { params: { page } })
        if (data.results) allStocks = allStocks.concat(data.results)
        if (!data.next) break
        page++
      } catch (error) {
        console.error(`Помилка залишків на сторінці ${page}:`, error)
        break
      }
    }
    return allStocks
  }

  const fetchProducts = async (page = 1, params = {}) => {
    isLoading.value = true
    try {
      const stocksData = await fetchAllStocks()

      const filterParams = {}
      Object.entries(params).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) filterParams[k] = v
      })

      let allProducts = []
      let currentPage = 1
      while (true) {
        const { data } = await api.get('/products/', { params: { ...filterParams, page: currentPage } })
        const results = data.results || []
        allProducts = allProducts.concat(results)
        if (!data.next) break
        currentPage++
      }

      products.value = allProducts.map((product) => {
        const totalStock = stocksData
          .filter((s) => Number(s.nomenclature) === Number(product.id))
          .reduce((sum, stock) => sum + (Number(stock.quantity) || 0), 0)
        
        return { ...product, stock: totalStock }
      })
    } catch (error) {
      console.error('Помилка завантаження каталогу:', error)
      window.dispatchEvent(new CustomEvent('api-error', { detail: { message: 'Помилка завантаження товарів', type: 'error' } }))
    } finally {
      isLoading.value = false
    }
  }

  const fetchCashboxes = async () => {
    try {
      const { data } = await api.get('/cash-registers/')
      availableCashboxes.value = data.results || []
      if (availableCashboxes.value.length > 0 && !activeCashbox.value) {
        activeCashbox.value = availableCashboxes.value[0]
      }
    } catch (error) {
      console.error('Помилка завантаження кас:', error)
    }
  }

  const addItem = (product) => {
    if (product.stock <= 0) {
      window.dispatchEvent(new CustomEvent('api-error', { detail: { message: `Товар закінчився!`, type: 'error' } }))
      return
    }
    const existing = items.value.find((i) => i.id === product.id)
    if (existing) {
      if (existing.qty < product.stock) existing.qty += 1
      else window.dispatchEvent(new CustomEvent('api-error', { detail: { message: `Максимум: ${product.stock} шт.`, type: 'warning' } }))
    } else {
      // Тут ми явно присвоюємо 'title', щоб шаблон кошика міг його відобразити
      items.value.push({ 
        ...product, 
        title: product.name, // Призначаємо назву (name -> title)
        price: Number(product.sale_price), 
        price_uah: Number(product.price_uah || product.sale_price),
        price_usd: Number(product.price_usd || 0),
        price_eur: Number(product.price_eur || 0),
        discount_type: 'amount',
        discount_value: 0,
        qty: 1 
      })
    }
  }

  const removeItem = (productId) => { items.value = items.value.filter((i) => i.id !== productId) }
  
  const updateItemQuantity = (productId, newQty) => {
    const existing = items.value.find((i) => i.id === productId)
    if (existing) {
      if (newQty > existing.stock) {
        window.dispatchEvent(new CustomEvent('api-error', { detail: { message: `Доступно: ${existing.stock} шт.`, type: 'warning' } }))
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
    items.value = []; 
    prepayAmount.value = 0; 
    commentTtn.value = '';
    cartDiscountType.value = 'amount';
    cartDiscountValue.value = 0;
  }

  const getOrderPayload = () => {
    // Формуємо масив items зі зліпком ціни у вибраній валюті (для сумісності, якщо потрібно)
    const payloadItems = items.value.map((i) => {
      let currentPrice = Number(i.price_uah || i.price)
      if (currency.value === 'USD') currentPrice = Number(i.price_usd || 0)
      if (currency.value === 'EUR') currentPrice = Number(i.price_eur || 0)
      
      let itemDiscountAmount = 0
      if (i.discount_type === 'percent') {
        itemDiscountAmount = currentPrice * (Number(i.discount_value) / 100)
      } else if (i.discount_type === 'amount') {
        itemDiscountAmount = Number(i.discount_value)
      }

      return { 
        product: i.id, 
        quantity: i.qty, 
        price: currentPrice,
        discount_type: i.discount_type,
        discount_value: Number(i.discount_value),
        discount_amount: itemDiscountAmount
      }
    })

    let orderDiscountAmount = 0
    const itemsTotal = payloadItems.reduce((sum, item) => sum + ((item.price - item.discount_amount) * item.quantity), 0)
    if (cartDiscountType.value === 'percent') {
      orderDiscountAmount = itemsTotal * (Number(cartDiscountValue.value) / 100)
    } else if (cartDiscountType.value === 'amount') {
      orderDiscountAmount = Number(cartDiscountValue.value)
    }

    return {
      items: payloadItems,
      total_amount: totalAmount.value,
      order_type: 'retail',
      prepay_amount: prepayAmount.value,
      balance_due: balanceDue.value,
      status: 'draft',
      cash_register: activeCashbox.value?.id || null,
      currency: currency.value,
      comment_ttn: commentTtn.value.trim(),
      discount_type: cartDiscountType.value,
      discount_value: Number(cartDiscountValue.value),
      discount_amount: orderDiscountAmount
    }
  }

  const createCashbox = async (data) => { return (await api.post('/cash-registers/', data)).data }
  const deleteCashbox = async (id) => { await api.delete(`/cash-registers/${id}/`) }
  const updateCashbox = async (id, data) => { return (await api.patch(`/cash-registers/${id}/`, data)).data }

  return {
    items, prepayAmount, commentTtn, currency, availableCashboxes, activeCashbox, products, isLoading,
    cartDiscountType, cartDiscountValue,
    totalAmount, balanceDue, orderStatus, fetchCashboxes, fetchProducts, addItem, removeItem, 
    updateItemQuantity, clearCart, getOrderPayload, createCashbox, deleteCashbox, updateCashbox
  }
})