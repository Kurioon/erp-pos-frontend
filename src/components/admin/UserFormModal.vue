<template>
  <BaseModal title="Додати користувача" :isOpen="true" @close="$emit('close')">
    <form @submit.prevent="submitForm" class="user-form">
      <div class="form-group">
        <BaseInput 
          label="Email" 
          v-model="formData.email" 
          type="email" 
          placeholder="employee@sa2.com" 
          required 
        />
      </div>

      <div class="form-group">
        <BaseInput 
          label="ПІБ (Ім'я)" 
          v-model="formData.name" 
          placeholder="Іван Іванов" 
          required 
        />
      </div>

      <div class="form-group">
        <BaseSelect 
          label="Роль" 
          v-model="formData.role" 
          :options="roleOptions" 
        />
      </div>

      <div class="form-group">
        <BaseInput 
          label="Пароль" 
          v-model="formData.password" 
          type="password" 
          placeholder="Мінімум 6 символів" 
          required 
        />
      </div>

      <div v-if="errorMsg" class="error-msg">
        {{ errorMsg }}
      </div>

      <div class="modal-actions">
        <BaseButton variant="secondary" type="button" @click="$emit('close')">
          Скасувати
        </BaseButton>
        <BaseButton variant="primary" type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Збереження...' : 'Створити' }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/api/axios'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const emit = defineEmits(['close', 'created'])

const formData = ref({
  email: '',
  name: '',
  role: 'seller',
  password: ''
})

const roleOptions = [
  { value: 'seller', label: 'Продавець' },
  { value: 'admin', label: 'Адміністратор' }
]

const isSubmitting = ref(false)
const errorMsg = ref('')

const submitForm = async () => {
  if (formData.value.password.length < 6) {
    errorMsg.value = 'Пароль повинен бути не менше 6 символів'
    return
  }

  isSubmitting.value = true
  errorMsg.value = ''

  try {
    await api.post('/users/', formData.value)
    emit('created')
    emit('close')
  } catch (error) {
    console.error('Failed to create user:', error)
    if (error.response?.data?.email) {
      errorMsg.value = 'Користувач з таким email вже існує'
    } else {
      errorMsg.value = error.response?.data?.detail || 'Сталася помилка при створенні користувача'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.user-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 400px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.error-msg {
  color: #ef4444;
  font-size: 0.85rem;
  padding: 8px;
  background: #fef2f2;
  border-radius: 6px;
  border: 1px solid #fecaca;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}
</style>
