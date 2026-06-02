import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/axios'

export const useFinanceStore = defineStore('finance', () => {
  const transactions = ref([])
  const isLoading = ref(false)
  const pagination = ref({ count: 0, next: null, previous: null })

  const currentBalance = computed(() => {
    return transactions.value.reduce((sum, t) => sum + Number(t.amount), 0)
  })

  const totalIncome = computed(() => {
    return transactions.value
      .filter((t) => Number(t.amount) > 0)
      .reduce((sum, t) => sum + Number(t.amount), 0)
  })

  const totalExpense = computed(() => {
    return transactions.value
      .filter((t) => Number(t.amount) < 0)
      .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)
  })

  const fetchTransactions = async (page = 1) => {
    isLoading.value = true
    try {
      const response = await api.get(`/transactions/?page=${page}`)
      transactions.value = response.data.results || []

      pagination.value = {
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
      }
    } catch (error) {
      console.error('Помилка завантаження транзакцій:', error)
      window.dispatchEvent(
        new CustomEvent('api-error', {
          detail: { message: 'Не вдалося завантажити фінансові операції', type: 'error' },
        }),
      )
    } finally {
      isLoading.value = false
    }
  }

  const addTransaction = async (payload) => {
    isLoading.value = true
    try {
      const response = await api.post('/transactions/', payload)

      transactions.value.unshift(response.data)

      window.dispatchEvent(
        new CustomEvent('app-success', {
          detail: { message: 'Транзакцію успішно проведено!', type: 'success' },
        }),
      )
      return response.data
    } catch (error) {
      console.error('Помилка створення транзакції:', error)
      window.dispatchEvent(
        new CustomEvent('api-error', {
          detail: { message: 'Не вдалося додати транзакцію. Перевірте дані.', type: 'error' },
        }),
      )
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const exportCsv = async () => {
    isLoading.value = true
    try {
      const response = await api.get('/transactions/export/csv/', {
        responseType: 'blob',
      })

      const fileURL = window.URL.createObjectURL(new Blob([response.data]))
      const fileLink = document.createElement('a')
      fileLink.href = fileURL

      const dateStr = new Date().toISOString().split('T')[0]
      fileLink.setAttribute('download', `finance_report_${dateStr}.csv`)

      document.body.appendChild(fileLink)
      fileLink.click()
      fileLink.remove()
      setTimeout(() => window.URL.revokeObjectURL(fileURL), 1000)
    } catch (error) {
      console.error('Помилка експорту CSV:', error)
      window.dispatchEvent(
        new CustomEvent('api-error', {
          detail: { message: 'Не вдалося завантажити CSV звіт', type: 'error' },
        }),
      )
    } finally {
      isLoading.value = false
    }
  }

  return {
    transactions,
    isLoading,
    pagination,
    currentBalance,
    totalIncome,
    totalExpense,
    fetchTransactions,
    addTransaction,
    exportCsv,
  }
})
