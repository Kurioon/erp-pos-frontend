import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/axios'

export const useWarehousesStore = defineStore('warehouses', () => {
  const warehouses = ref([])
  const isLoading = ref(false)

  const products = ref([])
  const stocks = ref([])

  const fetchWarehouses = async () => {
    isLoading.value = true
    try {
      const response = await api.get('/warehouses/')
      warehouses.value = response.data.results || response.data || []
    } catch (error) {
      console.error('Помилка завантаження складів:', error)
      window.dispatchEvent(
        new CustomEvent('api-error', {
          detail: { message: 'Не вдалося завантажити список складів', type: 'error' },
        }),
      )
    } finally {
      isLoading.value = false
    }
  }

  const createWarehouse = async (warehouseData) => {
    const response = await api.post('/warehouses/', warehouseData)
    warehouses.value.push(response.data)
    window.dispatchEvent(
      new CustomEvent('app-success', {
        detail: { message: `Склад "${response.data.name}" успішно створено!`, type: 'success' },
      }),
    )
    return response.data
  }

  const updateWarehouse = async (id, warehouseData) => {
    const response = await api.patch(`/warehouses/${id}/`, warehouseData)
    const index = warehouses.value.findIndex((w) => w.id === id)
    if (index !== -1) warehouses.value[index] = response.data
    window.dispatchEvent(
      new CustomEvent('app-success', {
        detail: { message: 'Дані складу оновлено', type: 'success' },
      }),
    )
    return response.data
  }

  const deleteWarehouse = async (id) => {
    await api.delete(`/warehouses/${id}/`)
    warehouses.value = warehouses.value.filter((w) => w.id !== id)
    window.dispatchEvent(
      new CustomEvent('app-success', { detail: { message: 'Склад архівовано', type: 'success' } }),
    )
  }

  const fetchInventory = async () => {
    isLoading.value = true
    try {
      const [productsRes, stocksRes] = await Promise.all([
        api.get('/products/'),
        api.get('/warehouse-stocks/'),
      ])

      products.value = productsRes.data.results || productsRes.data || []
      stocks.value = stocksRes.data.results || stocksRes.data || []
    } catch (error) {
      console.error('Помилка завантаження інвентарю:', error)
      window.dispatchEvent(
        new CustomEvent('api-error', {
          detail: { message: 'Не вдалося завантажити товари та залишки', type: 'error' },
        }),
      )
    } finally {
      isLoading.value = false
    }
  }

  const updateProductPrices = async (id, payload) => {
    isLoading.value = true
    try {
      const response = await api.patch(`/products/${id}/`, payload)
      const index = products.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        products.value[index] = response.data
      }
      window.dispatchEvent(
        new CustomEvent('app-success', {
          detail: { message: 'Ціни товару успішно оновлено!', type: 'success' },
        }),
      )
    } catch (error) {
      console.error('Помилка оновлення цін:', error)
      window.dispatchEvent(
        new CustomEvent('api-error', {
          detail: { message: 'Не вдалося оновити ціни товару', type: 'error' },
        }),
      )
      throw error
    } finally {
      isLoading.value = false
    }
  }
const fetchProductMovement = async (productId) => {
  try {
    const response = await api.get(`/stock-movements/?nomenclature=${productId}`)
    return response.data.results || response.data || []
  } catch (error) {
    console.error('Помилка завантаження історії руху:', error)
    return []
  }
}

const moveStock = async (payload) => {
  isLoading.value = true
  try {
    // 1. Знаходимо ID залишку (WarehouseStock.id) для комбінації товар + склад
    const sourceStockRecord = stocks.value.find(
      (s) => s.nomenclature === payload.product_id && s.warehouse === payload.from_warehouse
    )

    if (!sourceStockRecord) {
      throw new Error('Залишок не знайдено для вказаної комбінації товару та складу')
    }

    // 2. Відправляємо POST запит з ID залишку в URL
    const response = await api.post(`/warehouse-stocks/${sourceStockRecord.id}/move/`, {
      quantity: Number(payload.quantity),
      destination_warehouse_id: payload.to_warehouse,
    })

    // 3. Перезавантажуємо дані
    await fetchInventory()

    window.dispatchEvent(
      new CustomEvent('app-success', {
        detail: { message: 'Товар успішно переміщено!', type: 'success' },
      }),
    )

    return response.data
  } catch (error) {
    console.error('Помилка переміщення товару:', error)
    
    let errorMessage = 'Не вдалося перемістити товар. Перевірте залишки.'
    if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail
    }
    
    window.dispatchEvent(
      new CustomEvent('api-error', {
        detail: { message: errorMessage, type: 'error' },
      }),
    )
    throw error
  } finally {
    isLoading.value = false
  }
}
  const inventoryList = computed(() => {
    return products.value.map((product) => {
      const productStocks = stocks.value.filter((s) => s.nomenclature === product.id)
      const totalStock = productStocks.reduce((sum, s) => sum + Number(s.quantity || 0), 0)

      const warehouseNames =
        productStocks
          .filter((s) => Number(s.quantity) > 0)
          .map((s) => {
            const w = warehouses.value.find((w) => w.id === s.warehouse)
            return w ? w.name : `Склад #${s.warehouse}`
          })
          .join(', ') || 'Немає на складі'

      return {
        ...product,
        purchase_price: product.purchase_price || 0,
        wholesale_price: product.wholesale_price || 0,
        retail_price: product.retail_price || product.sale_price || 0,
        stock: totalStock,
        stock_details: productStocks,
        warehouse_names: warehouseNames,
      }
    })

  })

  return {
    warehouses,
    products,
    stocks,
    inventoryList,
    isLoading,
    fetchWarehouses,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
    fetchInventory,
    updateProductPrices,
    fetchProductMovement,
    moveStock,
  }
})
