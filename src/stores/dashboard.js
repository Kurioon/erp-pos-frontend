import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axios'

export const useDashboardStore = defineStore('dashboard', () => {
  const lowStockAlerts = ref([])
  const isLoading = ref(false)

  const fetchLowStockAlerts = async () => {
    isLoading.value = true
    try {
      const response = await api.get('/warehouse-stocks/low-stock/')

      lowStockAlerts.value = (response.data.results || response.data || []).map((item) => ({
        name: item.nomenclature_name || `Товар #${item.nomenclature}`,
        sku: item.warehouse_name || `Склад #${item.warehouse}`,
        val: `${item.quantity} шт`,
        critical: Number(item.quantity) === 0,
      }))
    } catch (error) {
      console.error('Помилка завантаження критичних залишків:', error)
    } finally {
      isLoading.value = false
    }
  }

  return {
    lowStockAlerts,
    isLoading,
    fetchLowStockAlerts,
  }
})
