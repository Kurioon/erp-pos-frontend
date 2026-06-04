import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axios'

export const useRepairsStore = defineStore('repairs', () => {
  const jobs = ref([])
  const isLoading = ref(false)
  const pagination = ref({ count: 0, next: null, previous: null })

  const fetchJobs = async (page = 1, filters = {}) => {
    isLoading.value = true
    try {
      const params = new URLSearchParams()
      params.append('page', page)

      if (filters.search) params.append('search', filters.search)
      if (filters.status) params.append('status', filters.status)
      if (filters.storage_cell) params.append('storage_cell', filters.storage_cell)
      if (filters.ordering) params.append('ordering', filters.ordering)

      const response = await api.get(`/service-jobs/?${params.toString()}`)
      jobs.value = response.data.results || []

      pagination.value = {
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
      }
    } catch (error) {
      console.error('Помилка завантаження ремонтів:', error)
      window.dispatchEvent(
        new CustomEvent('api-error', {
          detail: { message: 'Не вдалося завантажити список ремонтів', type: 'error' },
        }),
      )
    } finally {
      isLoading.value = false
    }
  }

  const createJob = async (jobData, photoFile = null) => {
    isLoading.value = true
    try {
      const formData = new FormData()
      formData.append('customer_name', jobData.customer_name)
      formData.append('customer_phone', jobData.customer_phone)
      formData.append('device_name', jobData.device_name)
      formData.append('description', jobData.description)

      if (jobData.comment) formData.append('comment', jobData.comment)
      if (jobData.storage_cell) formData.append('storage_cell', jobData.storage_cell)
      if (photoFile) formData.append('photo', photoFile)

      const response = await api.post('/service-jobs/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      await fetchJobs()

      window.dispatchEvent(
        new CustomEvent('app-success', {
          detail: { message: 'Техніку успішно прийнято в ремонт!', type: 'success' },
        }),
      )

      return response.data
    } catch (error) {
      console.error('Помилка створення ремонту:', error)

      if (error.response?.status === 409) {
        window.dispatchEvent(
          new CustomEvent('api-error', {
            detail: { message: 'Ця комірка на складі вже зайнята! Оберіть іншу.', type: 'warning' },
          }),
        )
      } else {
        window.dispatchEvent(
          new CustomEvent('api-error', {
            detail: { message: 'Не вдалося створити запис про ремонт.', type: 'error' },
          }),
        )
      }
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const updateJob = async (id, jobData, photoFile = null) => {
    isLoading.value = true
    try {
      const formData = new FormData()

      if (jobData.customer_name) formData.append('customer_name', jobData.customer_name)
      if (jobData.customer_phone) formData.append('customer_phone', jobData.customer_phone)
      if (jobData.device_name) formData.append('device_name', jobData.device_name)
      if (jobData.description) formData.append('description', jobData.description)
      if (jobData.storage_cell) formData.append('storage_cell', jobData.storage_cell)

      if (jobData.comment) formData.append('comment', jobData.comment)
      if (photoFile) formData.append('photo', photoFile)

      await api.patch(`/service-jobs/${id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      await fetchJobs()

      window.dispatchEvent(
        new CustomEvent('app-success', {
          detail: { message: 'Ремонт успішно оновлено!', type: 'success' },
        }),
      )
    } catch (error) {
      console.error('Помилка оновлення ремонту:', error)

      if (error.response?.status === 409) {
        window.dispatchEvent(
          new CustomEvent('api-error', {
            detail: { message: 'Ця комірка на складі вже зайнята! Оберіть іншу.', type: 'warning' },
          }),
        )
      } else {
        window.dispatchEvent(
          new CustomEvent('api-error', {
            detail: { message: 'Не вдалося оновити запис про ремонт.', type: 'error' },
          }),
        )
      }
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const updateJobStatus = async (id, newStatus) => {
    try {
      const response = await api.patch(`/service-jobs/${id}/`, { status: newStatus })

      const index = jobs.value.findIndex((job) => job.id === id)
      if (index !== -1) {
        jobs.value[index].status = newStatus
        jobs.value[index].updated_at = response.data.updated_at
      }

      window.dispatchEvent(
        new CustomEvent('app-success', {
          detail: { message: 'Статус ремонту оновлено', type: 'success' },
        }),
      )
    } catch (error) {
      console.error('Помилка оновлення статусу:', error)
      window.dispatchEvent(
        new CustomEvent('api-error', {
          detail: { message: 'Не вдалося оновити статус ремонту', type: 'error' },
        }),
      )
    }
  }

  const deleteJob = async (id) => {
    try {
      await api.delete(`/service-jobs/${id}/`)
      jobs.value = jobs.value.filter((job) => job.id !== id)

      window.dispatchEvent(
        new CustomEvent('app-success', {
          detail: { message: 'Запис про ремонт видалено', type: 'success' },
        }),
      )
    } catch (error) {
      console.error('Помилка видалення ремонту:', error)
      window.dispatchEvent(
        new CustomEvent('api-error', {
          detail: { message: 'Не вдалося видалити запис', type: 'error' },
        }),
      )
    }
  }

  const downloadReceiptPdf = async (id) => {
    isLoading.value = true
    try {
      const response = await api.get(`/service-jobs/${id}/export/pdf/`, {
        responseType: 'blob',
      })

      const fileURL = window.URL.createObjectURL(
        new Blob([response.data], { type: 'application/pdf' }),
      )
      const fileLink = document.createElement('a')
      fileLink.href = fileURL
      fileLink.setAttribute('download', `repair_receipt_${id}.pdf`)
      document.body.appendChild(fileLink)
      fileLink.click()
      fileLink.remove()
      setTimeout(() => window.URL.revokeObjectURL(fileURL), 1000)
    } catch (error) {
      console.error('Помилка завантаження PDF:', error)
      window.dispatchEvent(
        new CustomEvent('api-error', {
          detail: { message: 'Не вдалося згенерувати квитанцію', type: 'error' },
        }),
      )
    } finally {
      isLoading.value = false
    }
  }

  return {
    jobs,
    isLoading,
    pagination,
    fetchJobs,
    createJob,
    updateJob,
    updateJobStatus,
    deleteJob,
    downloadReceiptPdf,
  }
})
