<template>
  <BaseModal :is-open="isOpen" @close="closeModal" title="Повернення товару">
    <div class="return-container">
      <p class="description">
        Введіть номер чека (ID замовлення) для скасування продажу та повернення коштів клієнту.
      </p>

      <BaseInput
        v-model="orderIdToReturn"
        label="Номер замовлення"
        placeholder="Наприклад: 142"
        inputmode="numeric"
        @keydown.enter="processReturn"
        class="mb-compact"
      />

      <div class="modal-actions">
        <BaseButton variant="secondary" @click="closeModal">
          Скасувати
        </BaseButton>
        <BaseButton
          variant="primary"
          @click="processReturn"
          :disabled="!orderIdToReturn || isLoading"
        >
          <span v-if="isLoading">Обробка...</span>
          <span v-else>Підтвердити повернення</span>
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
// import api from '@/api/axios' 

defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close'])

const orderIdToReturn = ref('')
const isLoading = ref(false)

const closeModal = () => {
  orderIdToReturn.value = ''
  emit('close')
}

const processReturn = async () => {
  if (!orderIdToReturn.value) return

  isLoading.value = true
  try {
    // ТУТ БУДЕ РЕАЛЬНИЙ ЗАПИТ НА БЕКЕНД
    console.log('Готуємо запит на повернення для замовлення ID:', orderIdToReturn.value)

    await new Promise(resolve => setTimeout(resolve, 800))

    window.dispatchEvent(new CustomEvent('app-success', {
      detail: { message: `Повернення по чеку #${orderIdToReturn.value} успішно проведено!`, type: 'success' }
    }))

    closeModal()
  } catch (error) {
    console.error(error)
    window.dispatchEvent(new CustomEvent('api-error', {
      detail: { message: 'Не вдалося оформити повернення. Перевірте номер.', type: 'error' }
    }))
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.return-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 300px;
}

.description {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
}

.mb-compact {
  margin-bottom: 8px;
}
</style>
