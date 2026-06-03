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

  const inventoryList = computed(() => {
    return products.value.map((product) => {
      const productStocks = stocks.value.filter((s) => s.nomenclature === product.id)
      const totalStock = productStocks.reduce((sum, s) => sum + Number(s.quantity || 0), 0)

      return {
        ...product,
        category: product.unit || 'Загальна', // В БД нема категорій, використовуємо одиниці виміру як заглушку
        retail_price: product.sale_price,
        wholesale_price: product.sale_price, // Заглушка для опту
        stock: totalStock,
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
  }
})
