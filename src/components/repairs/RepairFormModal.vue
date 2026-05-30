<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['close', 'submit'])

const formData = ref({
  device_name: '',
  customer_name: '',
  customer_phone: '',
  description: '',
  storage_cell: '',
  price: ''
})

const errors = ref({
  customer_name: '',
  customer_phone: ''
})

const currentDate = new Date().toLocaleString('uk-UA', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})

const validateName = () => {
  if (/[0-9]/.test(formData.value.customer_name)) {
    errors.value.customer_name = 'Ім\'я не може містити цифри'
  } else {
    errors.value.customer_name = ''
  }
}

const validatePhone = () => {
  const phone = formData.value.customer_phone
  if (/[^\d\s+\-()]/.test(phone) && phone !== '') {
    errors.value.customer_phone = 'Лише цифри та символи +, -, ()'
  } else {
    errors.value.customer_phone = ''
  }
}

const hasErrors = computed(() => {
  return errors.value.customer_name !== '' || errors.value.customer_phone !== ''
})

const handleSubmit = () => {
  if (hasErrors.value) return
  emit('submit', { ...formData.value })
}
</script>

<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Новий ремонт</h2>
        <button class="close-btn" @click="$emit('close')">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="repair-form">
        <div class="form-group">
          <label>Пристрій <span>*</span></label>
          <input v-model="formData.device_name" type="text" placeholder="iPhone 15, MacBook Pro..." required />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Клієнт <span>*</span></label>
            <input 
              v-model="formData.customer_name" 
              @input="validateName"
              type="text" 
              placeholder="ПІБ клієнта" 
              :class="{ 'invalid-input': errors.customer_name }"
              required 
            />
            <span class="error-text" v-if="errors.customer_name">{{ errors.customer_name }}</span>
          </div>
          
          <div class="form-group">
            <label>Телефон</label>
            <input 
              v-model="formData.customer_phone" 
              @input="validatePhone"
              type="text" 
              placeholder="+380..." 
              :class="{ 'invalid-input': errors.customer_phone }"
            />
            <span class="error-text" v-if="errors.customer_phone">{{ errors.customer_phone }}</span>
          </div>
        </div>

        <div class="form-group">
          <label>Несправність</label>
          <input v-model="formData.description" type="text" placeholder="Опис проблеми" />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Комірка зберігання <span>*</span></label>
            <input v-model="formData.storage_cell" type="text" placeholder="A1, B3, R5..." required />
          </div>
          <div class="form-group">
            <label>Попередня вартість (₴)</label>
            <input v-model="formData.price" type="number" placeholder="0" />
          </div>
        </div>

        <div class="form-group">
          <label>Дата та час прийняття</label>
          <input 
            type="text" 
            :value="currentDate" 
            disabled 
            class="readonly-input"
          />
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="$emit('close')">Скасувати</button>
          <button type="submit" class="btn-submit" :disabled="hasErrors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
            Прийняти
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Анімації появи */
@keyframes fadeIn {
  from { opacity: 0; backdrop-filter: blur(0px); }
  to { opacity: 1; backdrop-filter: blur(2px); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.5); /* Трохи темніший фон */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
  animation: fadeIn 0.3s ease-out forwards;
}

.modal-content {
  background: white;
  width: 100%;
  max-width: 460px;
  border-radius: 16px; /* Більш м'які кути */
  padding: 28px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05); /* Глибока красива тінь */
  animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
  letter-spacing: -0.025em; /* Більш сучасний типографічний вигляд */
}

.close-btn {
  background: #f1f5f9;
  border: none;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
  transform: rotate(90deg); /* Крутий мікроефект при наведенні */
}

.repair-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: start;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #334155;
  margin-left: 2px;
}

.form-group label span {
  color: #ef4444; /* Зірочка тепер червона, як акцент */
}

.form-group input {
  padding: 12px 14px;
  background-color: #f8fafc; /* Легкий сірий фон замість білого */
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.95rem;
  color: #0f172a;
  outline: none;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.form-group input::placeholder {
  color: #94a3b8;
}

.form-group input:hover:not(:disabled) {
  border-color: #cbd5e1;
}

.form-group input:focus {
  background-color: #ffffff;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15); /* М'яке синє світіння */
}

.readonly-input {
  background-color: #f1f5f9 !important;
  color: #64748b !important;
  cursor: not-allowed;
  border-color: transparent !important;
}

/* --- СТИЛІ ДЛЯ ПОМИЛОК --- */
.invalid-input {
  background-color: #fef2f2 !important;
  border-color: #ef4444 !important;
  animation: shake 0.4s ease-in-out;
}

.invalid-input:focus {
  background-color: #ffffff !important;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.15) !important;
}

.error-text {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 2px;
  margin-left: 4px;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.btn-cancel, .btn-submit {
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-cancel {
  background: white;
  border: 1px solid #cbd5e1;
  color: #475569;
}

.btn-cancel:hover {
  background: #f8fafc;
  color: #0f172a;
  border-color: #94a3b8;
}

.btn-submit {
  background: #3b82f6; 
  border: 1px solid transparent;
  color: white;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
}

.btn-submit:hover:not(:disabled) {
  background: #2563eb;
  box-shadow: 0 6px 8px -1px rgba(59, 130, 246, 0.3);
  transform: translateY(-1px);
}

/* Ефект реального фізичного натискання */
.btn-cancel:active, .btn-submit:active:not(:disabled) {
  transform: scale(0.97);
}

.btn-submit:disabled {
  background: #94a3b8;
  box-shadow: none;
  cursor: not-allowed;
  opacity: 0.7;
}
</style>