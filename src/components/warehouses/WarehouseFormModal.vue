<template>
  <BaseModal :is-open="isOpen" @close="emit('close')" :title="editMode ? 'Редагувати склад' : 'Додати новий склад'">
    <div class="modal-body">
      <div class="form-group">
        <label class="form-label">Назва складу *</label>
        <BaseInput
          v-model="formData.name"
          placeholder="Наприклад: Головний склад, Магазин №1..."
          @keyup.enter="handleSubmit"
        />
      </div>

      <div class="modal-footer">
        <BaseButton variant="secondary" @click="emit('close')">Скасувати</BaseButton>
        <BaseButton variant="primary" @click="handleSubmit" :disabled="!formData.name.trim()">
          {{ editMode ? 'Зберегти зміни' : 'Створити склад' }}
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, watch } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

const props = defineProps({
  isOpen: Boolean,
  editMode: Boolean,
  warehouseData: Object
})

const emit = defineEmits(['close', 'save'])

const formData = ref({
  name: ''
})

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    if (props.editMode && props.warehouseData) {
      formData.value.name = props.warehouseData.name || ''
    } else {
      formData.value.name = ''
    }
  }
}, { immediate: true })

const handleSubmit = () => {
  if (!formData.value.name.trim()) return
  emit('save', { name: formData.value.name.trim() })
}
</script>

<style scoped>
.modal-body { display: flex; flex-direction: column; gap: 20px; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-label { font-size: 0.8rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; }
.modal-footer { padding-top: 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; }
</style>
