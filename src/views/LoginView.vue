<template>
  <div class="login-layout">
    <main class="login-card">
      <div class="login-header">
        <div class="logo-box">
          <img src="/favicon.png" alt="SA2 Logo" class="logo-image" />
        </div>
        <h1>SA2</h1>
        <p>Увійдіть у свій обліковий запис</p>
      </div>

      <form @submit.prevent="handleSubmit" class="login-form">
        <BaseInput
          label="Логін"
          v-model="username"
          type="text"
          placeholder="Логін"
          required
        />

        <BaseInput
          label="Пароль"
          v-model="password"
          type="password"
          placeholder="********"
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
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
// Видалили імпорт IconBox, бо він більше не потрібен

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

/* Новий клас для картинки замість .logo-icon */
.logo-image {
  width: 84px;
  height: 84px;
  object-fit: contain; /* Щоб картинка не обрізалась і не розтягувалась пропорційно */
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
</style>