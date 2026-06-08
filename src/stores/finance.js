import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/axios'
import { useCartStore } from '@/stores/pos'

export const useFinanceStore = defineStore('finance', () => {
  const transactions = ref([])
  const partialOrders = ref([]) // Список замовлень, що чекають дооплати
  const isLoading = ref(false)
  const isSubmittingPrepay = ref(false)
  const pagination = ref({ count: 0, next: null, previous: null })

  const currentBalance = computed(() => {
    return totalIncome.value - totalExpense.value
  })

  const totalIncome = computed(() => {
    const incomeTypes = ['prepay', 'payment', 'sale', 'income']
    return transactions.value
      .filter((t) => incomeTypes.includes(t.transaction_type))
      .reduce((sum, t) => sum + Number(t.amount_uah || t.amount), 0)
  })

  const totalExpense = computed(() => {
    const expenseTypes = ['refund', 'return', 'expense', 'purchase']
    return transactions.value
      .filter((t) => expenseTypes.includes(t.transaction_type))
      .reduce((sum, t) => sum + Number(t.amount_uah || t.amount), 0)
  })

  const fetchTransactions = async (page = 1, filters = {}) => {
    isLoading.value = true
    try {
      let url = `/transactions/?page=${page}`
      if (filters.date) {
        url += `&date=${filters.date}`
      }
      // Уніфікований пошук (ID / замовник / телефон / дата) та фільтр джерела
      if (filters.search) {
        url += `&search=${encodeURIComponent(filters.search)}`
      }
      if (filters.source_type) {
        url += `&source_type=${filters.source_type}`
      }
      const response = await api.get(url)
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

  const fetchPartialOrders = async () => {
    try {
      const response = await api.get('/transactions/?status=pending')
      partialOrders.value = response.data.results || response.data || []
    } catch (error) {
      console.error('Помилка завантаження боргів:', error)
    }
  }

  const submitPrepay = async (transaction, amount, cashboxId) => {
    isSubmittingPrepay.value = true
    try {
      let endpoint = ''
      let currency = 'UAH'

      if (typeof transaction === 'object' && transaction !== null) {
        currency = transaction.currency || 'UAH'
        const source = transaction.source_document || {}
        if (source.type === 'repair') {
          endpoint = `/warehouses/service-jobs/${source.id}/payment/`
        } else if (source.id) {
          endpoint = `/orders/${source.id}/prepay/`
        } else if (transaction.id) {
          endpoint = `/orders/${transaction.id}/prepay/`
        }
      } else {
        endpoint = `/orders/${transaction}/prepay/`
      }

      if (!endpoint) {
        throw new Error('Invalid transaction or order ID')
      }

      await api.post(endpoint, {
        amount: Number(amount),
        cash_register: cashboxId,
        currency: currency
      })

      window.dispatchEvent(
        new CustomEvent('app-success', {
          detail: { message: 'Дооплату успішно внесено!', type: 'success' },
        })
      )

      await fetchPartialOrders()
      await fetchTransactions()

      const cartStore = useCartStore()
      await cartStore.fetchCashboxes() 

    } catch (error) {
      console.error('Помилка дооплати:', error)
      window.dispatchEvent(
        new CustomEvent('api-error', {
          detail: { message: 'Не вдалося провести дооплату', type: 'error' },
        })
      )
    } finally {
      isSubmittingPrepay.value = false
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
    partialOrders,
    isLoading,
    isSubmittingPrepay,
    pagination,
    currentBalance,
    totalIncome,
    totalExpense,
    fetchTransactions,
    fetchPartialOrders,
    submitPrepay,
    addTransaction,
    exportCsv,
  }
})
