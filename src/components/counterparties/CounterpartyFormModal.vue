<template>
  <div v-if="isOpen" class="modal-overlay" @mousedown="handleBackdropClick">
    <div class="modal-content" @mousedown.stop>
      <div class="modal-header">
        <h2>{{ isEdit ? 'Редагувати контрагента' : 'Новий контрагент' }}</h2>
        <button class="close-btn" @click="close">×</button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="form-body">
        <BaseInput
          label="Ім'я / Назва компанії *"
          v-model="form.name"
          placeholder="Введіть ім'я"
          required
        />
        
        <BaseInput
          label="Телефон *"
          v-model="form.phone"
          placeholder="+380..."
          required
        />
        
        <BaseSelect
          label="Роль *"
          v-model="form.role"
          :options="roleOptions"
          required
        />
        
        <BaseInput
          label="Email"
          type="email"
          v-model="form.email"
          placeholder="email@example.com"
        />
        
        <div class="input-group">
          <label class="input-label">Нотатки</label>
          <textarea
            v-model="form.notes"
            class="textarea-input"
            placeholder="Додаткова інформація..."
            rows="3"
          ></textarea>
        </div>

        <div class="modal-actions">
          <BaseButton type="button" class="cancel-btn" @click="close">Скасувати</BaseButton>
          <BaseButton type="submit" class="submit-btn" :disabled="isSubmitting">
            {{ isSubmitting ? 'Збереження...' : 'Зберегти' }}
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useCounterpartiesStore } from '@/stores/counterparties'

const props = defineProps({
  isOpen: Boolean,
  counterparty: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'saved'])

const store = useCounterpartiesStore()
const isSubmitting = ref(false)

const roleOptions = [
  { value: 'buyer', label: 'Покупець' },
  { value: 'supplier', label: 'Постачальник' },
  { value: 'both', label: 'Обидва' }
]

const form = ref({
  name: '',
  phone: '',
  role: 'buyer',
  email: '',
  notes: ''
})

const isEdit = computed(() => !!props.counterparty)

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      if (props.counterparty) {
        form.value = {
          name: props.counterparty.name || '',
          phone: props.counterparty.phone || '',
          role: props.counterparty.role || 'buyer',
          email: props.counterparty.email || '',
          notes: props.counterparty.notes || ''
        }
      } else {
        form.value = {
          name: '',
          phone: '',
          role: 'buyer',
          email: '',
          notes: ''
        }
      }
    }
  }
)

const handleBackdropClick = () => {
  close()
}

const close = () => {
  emit('close')
}

const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    const payload = { ...form.value }
    let result
    if (isEdit.value) {
      result = await store.update(props.counterparty.id, payload)
    } else {
      result = await store.create(payload)
    }
    emit('saved', result)
    close()
  } catch (error) {
    console.error('Submit error:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #64748b;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.form-body {
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #334155;
}

.textarea-input {
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  transition: border-color 0.2s;
}

.textarea-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.cancel-btn {
  background: white;
  color: #64748b;
  border: 1px solid #cbd5e1;
}

.cancel-btn:hover {
  background: #f8fafc;
  color: #0f172a;
}

.submit-btn {
  min-width: 120px;
}
</style>
