import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/axios'

export const useRepairsStore = defineStore('repairs', () => {
  const jobs = ref([])
  const isLoading = ref(false)

  const jobsByStatus = computed(() => {
    return {
      прийнято: jobs.value.filter((job) => job.status === 'pending'),
      'очікує компонентів': jobs.value.filter((job) => job.status === 'waiting_parts'),
      відремонтовано: jobs.value.filter((job) => job.status === 'done'),
      видано: jobs.value.filter((job) => job.status === 'returned'),
    }
  })

  const fetchJobs = async () => {
    isLoading.value = true
    try {
      const response = await api.get('/service-jobs/')
      jobs.value = response.data.results || []
    } catch (error) {
      console.error('Помилка завантаження ремонтів:', error)
      window.dispatchEvent(
        new CustomEvent('api-error', {
          detail: { message: 'Не вдалося завантажити список заявок на ремонт', type: 'error' },
        }),
      )
    } finally {
      isLoading.value = false
    }
  }

  const updateJobStatus = async (jobId, newStatusUa) => {
    const statusMap = {
      прийнято: 'pending',
      'очікує компонентів': 'waiting_parts',
      відремонтовано: 'done',
      видано: 'returned',
    }

    const englishStatus = statusMap[newStatusUa] || 'pending'

    try {
      await api.patch(`/service-jobs/${jobId}/`, { status: englishStatus })

      const job = jobs.value.find((j) => j.id === jobId)
      if (job) {
        job.status = englishStatus
      }
    } catch (error) {
      console.error('Помилка оновлення статусу:', error)
      window.dispatchEvent(
        new CustomEvent('api-error', {
          detail: { message: 'Не вдалося оновити статус ремонту', type: 'error' },
        }),
      )
      await fetchJobs()
    }
  }

  return {
    jobs,
    isLoading,
    jobsByStatus,
    fetchJobs,
    updateJobStatus,
  }
})
