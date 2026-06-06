import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axios'

export const useExchangeRatesStore = defineStore('exchangeRates', () => {
  const rates = ref([])
  const isLoading = ref(false)

  const fetchRates = async () => {
    isLoading.value = true
    try {
      const response = await api.get('/exchange-rates/')
      // Якщо бекенд повертає пагінацію, беремо results, інакше сам data
      rates.value = response.data.results ? response.data.results : (response.data || [])
    } catch (error) {
      console.error('Помилка завантаження курсів валют:', error)
      window.dispatchEvent(
        new CustomEvent('api-error', {
          detail: { message: 'Не вдалося завантажити курси валют', type: 'error' },
        })
      )
    } finally {
      isLoading.value = false
    }
  }

  const getRate = (currency) => {
    if (currency === 'UAH') return 1.0
    const rateObj = rates.value.find(r => r.currency === currency)
    return rateObj ? Number(rateObj.rate_to_uah) : 1.0
  }

  return {
    rates,
    isLoading,
    fetchRates,
    getRate
  }
})
