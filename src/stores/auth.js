import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { USER_ROLES } from '@/constants/roles'
import api from '@/api/axios'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()

  const token = ref(localStorage.getItem('token') || null)
  const refreshToken = ref(localStorage.getItem('refreshToken') || null) 
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)
  const isLoading = ref(false)
  const errorMessage = ref('')

  const login = async (email, password) => {
    isLoading.value = true
    errorMessage.value = ''

    try {
      const response = await api.post('/auth/login/', { email, password })

      token.value = response.data.access_token
      refreshToken.value = response.data.refresh_token
      user.value = response.data.user

      localStorage.setItem('token', token.value)
      localStorage.setItem('refreshToken', refreshToken.value)
      localStorage.setItem('user', JSON.stringify(user.value))

      if (user.value.role === USER_ROLES.ADMIN) {
        router.push('/dashboard')
      } else {
        router.push('/pos')
      }
    } catch (error) {
      errorMessage.value =
        error.response?.data?.message || 'Помилка авторизації. Перевірте логін та пароль.'
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    token.value = null
    refreshToken.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const isAdmin = computed(() => {
    return user.value?.role === USER_ROLES.ADMIN
  })

  return { token, refreshToken, user, isLoading, errorMessage, isAdmin, login, logout }
})
