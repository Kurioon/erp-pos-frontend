<template>
  <div class="login-layout">
    <main class="login-card">
      <div class="login-header">
        <div class="logo-box">
          <IconBox class="logo-icon" /> </div>
        <h1>ERP System</h1>
        <p>Увійдіть у свій обліковий запис</p>
      </div>

      <form @submit.prevent="handleSubmit" class="login-form">
        <BaseInput
          label="Логін"
          v-model="username"
          type="text"
          placeholder="admin або seller"
          required
        />

        <BaseInput
          label="Пароль"
          v-model="password"
          type="password"
          placeholder="1234"
          required
        />

        <div v-if="authStore.errorMessage" class="error-msg">
          {{ authStore.errorMessage }}
        </div>

        <BaseButton
          type="submit"
          variant="primary"
          class="submit-btn"
          :disabled="authStore.isLoading"
        >
          {{ authStore.isLoading ? 'Перевірка...' : 'Увійти' }}
        </BaseButton>
      </form>

      <div class="test-hints">
        <small><strong>Тестові доступи:</strong><br>
        Адмін: admin / 1234<br>
        Продавець: seller / 1234</small>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import IconBox from '@/components/icons/IconBox.vue'

const authStore = useAuthStore()
const username = ref('')
const password = ref('')

const handleSubmit = () => {
  if (!username.value || !password.value) return
  authStore.login(username.value, password.value)
}
</script>

<style scoped>
.login-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  padding: 40px 32px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-icon {
  width: 84px;
  height: 84px;
  color: #0f172a;
  stroke-width: 1.5px;
}

.logo-box {
  display: flex;
  justify-content: center;
  margin-bottom: 4px; 
}

.login-header h1 {
  font-size: 1.5rem;
  color: #0f172a;
  margin: 0 0 8px 0;
  font-weight: 700;
}

.login-header p {
  color: #64748b;
  margin: 0;
  font-size: 0.95rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.submit-btn {
  width: 100%;
  margin-top: 8px;
  padding: 12px;
  font-size: 1.05rem;
}

.error-msg {
  color: #ef4444;
  font-size: 0.9rem;
  text-align: center;
  background: #fef2f2;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #fecaca;
}

.test-hints {
  margin-top: 24px;
  text-align: center;
  color: #94a3b8;
  font-size: 0.85rem;
  border-top: 1px dashed #e2e8f0;
  padding-top: 16px;
}
</style>
