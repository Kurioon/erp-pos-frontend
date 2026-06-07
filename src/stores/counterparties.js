import { defineStore } from 'pinia'
import api from '@/api/axios'

export const useCounterpartiesStore = defineStore('counterparties', {
  state: () => ({
    counterparties: [],
    pagination: {
      count: 0,
      next: null,
      previous: null
    },
    isLoading: false,
    currentCounterparty: null,
    currentCounterpartyOrders: [],
    currentCounterpartyServiceJobs: [],
    currentCounterpartyBalance: null,
    isGlobalDrawerOpen: false
  }),

  actions: {
    async openGlobalDrawer(id) {
      if (!id) return
      try {
        await this.fetchOne(id)
        this.isGlobalDrawerOpen = true
      } catch (e) {
        console.error(e)
      }
    },
    closeGlobalDrawer() {
      this.isGlobalDrawerOpen = false
    },
    async fetchList(page = 1, filters = {}) {
      this.isLoading = true
      try {
        const queryParams = { page }
        
        // Remove empty filters
        Object.entries(filters).forEach(([k, v]) => {
          if (v !== '' && v !== null && v !== undefined) {
            queryParams[k] = v
          }
        })

        const { data } = await api.get('/counterparties/', { params: queryParams })
        this.counterparties = data.results || []
        this.pagination = {
          count: data.count,
          next: data.next,
          previous: data.previous
        }
      } catch (error) {
        console.error('Помилка завантаження списку контрагентів:', error)
        window.dispatchEvent(
          new CustomEvent('api-error', {
            detail: { message: 'Помилка завантаження контрагентів', type: 'error' }
          })
        )
      } finally {
        this.isLoading = false
      }
    },

    async fetchOne(id) {
      this.isLoading = true
      try {
        const { data } = await api.get(`/counterparties/${id}/`)
        this.currentCounterparty = data
        return data
      } catch (error) {
        console.error(`Помилка завантаження контрагента ${id}:`, error)
        window.dispatchEvent(
          new CustomEvent('api-error', {
            detail: { message: 'Помилка завантаження профілю контрагента', type: 'error' }
          })
        )
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async create(payload) {
      try {
        const { data } = await api.post('/counterparties/', payload)
        // Refetch list to show new item at the top
        await this.fetchList(1)
        window.dispatchEvent(
          new CustomEvent('api-error', {
            detail: { message: 'Контрагента успішно створено', type: 'success' }
          })
        )
        return data
      } catch (error) {
        console.error('Помилка створення контрагента:', error)
        throw error
      }
    },

    async update(id, payload) {
      try {
        const { data } = await api.patch(`/counterparties/${id}/`, payload)
        // Update in list
        const index = this.counterparties.findIndex((c) => c.id === id)
        if (index !== -1) {
          this.counterparties[index] = data
        }
        // Update current if needed
        if (this.currentCounterparty && this.currentCounterparty.id === id) {
          this.currentCounterparty = data
        }
        window.dispatchEvent(
          new CustomEvent('api-error', {
            detail: { message: 'Дані контрагента оновлено', type: 'success' }
          })
        )
        return data
      } catch (error) {
        console.error(`Помилка оновлення контрагента ${id}:`, error)
        throw error
      }
    },

    async remove(id) {
      try {
        await api.delete(`/counterparties/${id}/`)
        this.counterparties = this.counterparties.filter((c) => c.id !== id)
        window.dispatchEvent(
          new CustomEvent('api-error', {
            detail: { message: 'Контрагента видалено', type: 'success' }
          })
        )
      } catch (error) {
        console.error(`Помилка видалення контрагента ${id}:`, error)
        throw error
      }
    },

    async fetchOrders(id, filters = {}) {
      try {
        const { data } = await api.get(`/counterparties/${id}/orders/`, { params: filters })
        this.currentCounterpartyOrders = data.results || []
        return data
      } catch (error) {
        console.error(`Помилка завантаження замовлень контрагента ${id}:`, error)
        throw error
      }
    },

    async fetchServiceJobs(id, filters = {}) {
      try {
        const { data } = await api.get(`/counterparties/${id}/service-jobs/`, { params: filters })
        this.currentCounterpartyServiceJobs = data.results || []
        return data
      } catch (error) {
        console.error(`Помилка завантаження ремонтів контрагента ${id}:`, error)
        throw error
      }
    },

    async fetchBalance(id) {
      try {
        const { data } = await api.get(`/counterparties/${id}/balance/`)
        this.currentCounterpartyBalance = data
        return data
      } catch (error) {
        console.error(`Помилка завантаження балансу контрагента ${id}:`, error)
        // Do not throw, as this might fail if the backend is not ready
        return null
      }
    }
  }
})
