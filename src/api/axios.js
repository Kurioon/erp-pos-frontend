import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
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
  (error) => {
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          localStorage.removeItem('token')
          console.error('Помилка 401: Авторизація застаріла')

          window.dispatchEvent(
            new CustomEvent('api-error', {
              detail: {
                message: 'Час сесії вичерпано. Будь ласка, увійдіть знову.',
                type: 'error',
              },
            }),
          )
          // window.location.href = '/login'
          break

        case 422:
          console.error('Помилка 422: Помилка валідації даних з сервера', data)
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
          console.error('Помилка 500: Внутрішня помилка сервера')
          window.dispatchEvent(
            new CustomEvent('api-error', {
              detail: {
                message: 'Помилка сервера. Спробуйте пізніше або зверніться до адміністратора.',
                type: 'error',
              },
            }),
          )
          break

        default:
          console.error(`Помилка сервісу [Статус ${status}]:`, data)
      }
    } else {
      console.error('Мережева помилка або сервер недоступний')
      window.dispatchEvent(
        new CustomEvent('api-error', {
          detail: {
            message: "Немає зв'язку з сервером. Перевірте підключення до інтернету.",
            type: 'error',
          },
        }),
      )
    }

    return Promise.reject(error)
  },
)

export default api