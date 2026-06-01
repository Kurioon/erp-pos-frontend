import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axios'

export const useInventoryStore = defineStore('inventory', () => {
  const items = ref([])
  const isLoading = ref(false)

  const fetchInventory = async () => {
    isLoading.value = true
    try {
      const response = await api.get('/warehouse-stocks/')
      const results = response.data.results || []

      items.value = results.map((stock) => ({
        id: stock.id,
        title: stock.nomenclature_name,
        warehouse_name: stock.warehouse_name,
        quantity: stock.quantity,
        // Заглушки для полів, яких немає в цьому ендпоінті API
        sku: `ID-${stock.nomenclature}`,
        retail_price: '—',
      }))
    } catch (error) {
      console.error('Помилка завантаження залишків:', error)
      window.dispatchEvent(
        new CustomEvent('api-error', {
          detail: { message: 'Не вдалося завантажити дані складів', type: 'error' },
        }),
      )
    } finally {
      isLoading.value = false
    }
  }

  return {
    items,
    isLoading,
    fetchInventory,
  }
})
