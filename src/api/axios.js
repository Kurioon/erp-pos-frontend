import axios from 'axios'

const api = axios.create({
  baseURL: 'https://erp-pos-system-2vll.onrender.com/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Timezone': 'Europe/Kyiv',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response) {
      const { status, data } = error.response

      if (status === 401 && !originalRequest._retry && !originalRequest.url.includes('login')) {
        originalRequest._retry = true
        const refreshToken = localStorage.getItem('refreshToken')

        if (refreshToken) {
          try {
            const response = await axios.post(
              'https://erp-pos-system-2vll.onrender.com/api/auth/token/refresh/',
              {
                refresh: refreshToken,
              },
            )

            const newAccessToken = response.data.access || response.data.access_token

            localStorage.setItem('token', newAccessToken)

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
            return api(originalRequest)
          } catch (refreshError) {
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')
            window.location.href = '/login'
            return Promise.reject(refreshError)
          }
        } else {
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
          window.location.href = '/login'
          return Promise.reject(error)
        }
      }

      switch (status) {
        case 422:
          console.error('Помилка валідації:', data)
          window.dispatchEvent(
            new CustomEvent('api-error', {
              detail: {
                message: data?.message || 'Перевірте правильність введення даних.',
                type: 'warning',
              },
            }),
          )
          break

        case 500:
          console.error('Помилка сервера')
          window.dispatchEvent(
            new CustomEvent('api-error', {
              detail: { message: 'Помилка сервера. Спробуйте пізніше.', type: 'error' },
            }),
          )
          break

      }
    } else {
      window.dispatchEvent(
        new CustomEvent('api-error', {
          detail: { message: "Немає зв'язку з сервером.", type: 'error' },
        }),
      )
    }

    return Promise.reject(error)
  },
)

export default api
