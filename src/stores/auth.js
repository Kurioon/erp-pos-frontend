import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { USER_ROLES } from '@/constants/roles' 

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()

  const token = ref(localStorage.getItem('token') || null)
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)
  const isLoading = ref(false)
  const errorMessage = ref('')

  const login = async (username, password) => {
    isLoading.value = true
    errorMessage.value = ''

    // ІМІТАЦІЯ ЗАПИТУ НА БЕКЕНД (Заглушка для тестування ролей)
    await new Promise((resolve) => setTimeout(resolve, 800))

    try {
      if (username === 'admin' && password === '1234') {
        token.value = 'mock-jwt-token-admin'
        user.value = { id: 1, name: 'Керівник', role: USER_ROLES.ADMIN }
      } else if (username === 'seller' && password === '1234') {
        token.value = 'mock-jwt-token-seller'
        user.value = { id: 2, name: 'Касир', role: USER_ROLES.SELLER }
      } else {
        throw new Error('Невірний логін або пароль')
      }

      localStorage.setItem('token', token.value)
      localStorage.setItem('user', JSON.stringify(user.value))

      if (user.value.role === USER_ROLES.ADMIN) {
        router.push('/dashboard')
      } else {
        router.push('/pos')
      }
    } catch (error) {
      errorMessage.value = error.message
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  return { token, user, isLoading, errorMessage, login, logout }
})
