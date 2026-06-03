import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axios'

export const useWarehousesStore = defineStore('warehouses', () => {
  const warehouses = ref([])
  const isLoading = ref(false)

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
    isLoading.value = true
    try {
      const response = await api.post('/warehouses/', warehouseData)
      warehouses.value.push(response.data)
      window.dispatchEvent(
        new CustomEvent('app-success', {
          detail: { message: `Склад "${response.data.name}" успішно створено!`, type: 'success' },
        }),
      )
      return response.data
    } catch (error) {
      console.error('Помилка створення складу:', error)
      window.dispatchEvent(
        new CustomEvent('api-error', {
          detail: { message: 'Не вдалося створити склад', type: 'error' },
        }),
      )
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const updateWarehouse = async (id, warehouseData) => {
    isLoading.value = true
    try {
      const response = await api.patch(`/warehouses/${id}/`, warehouseData)
      const index = warehouses.value.findIndex((w) => w.id === id)
      if (index !== -1) {
        warehouses.value[index] = response.data
      }
      window.dispatchEvent(
        new CustomEvent('app-success', {
          detail: { message: 'Дані складу оновлено', type: 'success' },
        }),
      )
      return response.data
    } catch (error) {
      console.error('Помилка оновлення складу:', error)
      window.dispatchEvent(
        new CustomEvent('api-error', {
          detail: { message: 'Не вдалося оновити склад', type: 'error' },
        }),
      )
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const deleteWarehouse = async (id) => {
    try {
      await api.delete(`/warehouses/${id}/`)
      warehouses.value = warehouses.value.filter((w) => w.id !== id)
      window.dispatchEvent(
        new CustomEvent('app-success', {
          detail: { message: 'Склад архіввовано', type: 'success' },
        }),
      )
    } catch (error) {
      console.error('Помилка видалення складу:', error)
      window.dispatchEvent(
        new CustomEvent('api-error', {
          detail: { message: 'Не вдалося видалити склад', type: 'error' },
        }),
      )
    }
  }

  return {
    warehouses,
    isLoading,
    fetchWarehouses,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
  }
})
