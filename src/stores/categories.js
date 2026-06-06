import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axios'

export const useCategoriesStore = defineStore('categories', () => {
  const categories = ref([])
  const isLoading = ref(false)
  const errorMessage = ref('')

  const fetchList = async () => {
    isLoading.value = true
    errorMessage.value = ''
    try {
      const response = await api.get('/categories/')
      // Враховуємо можливу пагінацію (results) або прямий масив
      categories.value = response.data.results || response.data
    } catch (error) {
      errorMessage.value = error.response?.data?.message || 'Помилка завантаження категорій.'
      console.error('Помилка завантаження категорій:', error)
    } finally {
      isLoading.value = false
    }
  }

  const create = async (name, parent = null) => {
    isLoading.value = true
    errorMessage.value = ''
    try {
      const response = await api.post('/categories/', { name, parent })
      categories.value.push(response.data)
      return response.data
    } catch (error) {
      if (error.response?.status === 400) {
        errorMessage.value = error.response?.data?.name?.[0] || 'Категорія з такою назвою вже існує.'
        // Також можна закинути глобальну подію для сповіщення, якщо потрібно
        window.dispatchEvent(
          new CustomEvent('api-error', {
            detail: { message: errorMessage.value, type: 'warning' },
          })
        )
      } else {
        errorMessage.value = error.response?.data?.message || 'Помилка створення категорії.'
      }
      throw error // Прокидаємо далі для обробки у компоненті (щоб не закривати модалку тощо)
    } finally {
      isLoading.value = false
    }
  }

  return { categories, isLoading, errorMessage, fetchList, create }
})
