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

  const totalAmount = computed(() => items.value.reduce((sum, item) => sum + (Number(item.price) * item.qty), 0))
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
      
      const queryParams = { page }
      Object.entries(params).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) queryParams[k] = v
      })
      
      const productsResponse = await api.get('/products/', { params: queryParams })
      const fetchedProducts = productsResponse.data.results || []

      products.value = fetchedProducts.map((product) => {
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
      newQty > 0 ? existing.qty = newQty : removeItem(productId)
    }
  }

  const clearCart = () => { items.value = []; prepayAmount.value = 0; commentTtn.value = '' }

  const getOrderPayload = () => ({
    items: items.value.map((i) => ({ product: i.id, quantity: i.qty })),
    total_amount: totalAmount.value,
    order_type: 'retail',
    prepay_amount: prepayAmount.value,
    balance_due: balanceDue.value,
    status: 'draft',
    cash_register: activeCashbox.value?.id || null,
    currency: currency.value,
    comment_ttn: commentTtn.value.trim()
  })

  const createCashbox = async (data) => { return (await api.post('/cash-registers/', data)).data }
  const deleteCashbox = async (id) => { await api.delete(`/cash-registers/${id}/`) }
  const updateCashbox = async (id, data) => { return (await api.patch(`/cash-registers/${id}/`, data)).data }

  return {
    items, prepayAmount, commentTtn, currency, availableCashboxes, activeCashbox, products, isLoading,
    totalAmount, balanceDue, orderStatus, fetchCashboxes, fetchProducts, addItem, removeItem, 
    updateItemQuantity, clearCart, getOrderPayload, createCashbox, deleteCashbox, updateCashbox
  }
})