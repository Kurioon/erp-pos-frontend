<template>
  <BaseModal
    :is-open="isOpen"
    @close="$emit('close')"
    :title="title"
  >
    <div class="confirm-modal-content">
      <p class="description" v-html="message"></p>
    </div>
    <template #footer>
      <BaseButton variant="secondary" @click="$emit('close')">
        {{ cancelText }}
      </BaseButton>
      <BaseButton
        :variant="confirmVariant"
        @click="handleConfirm"
        :disabled="isLoading"
      >
        <span v-if="isLoading">Обробка...</span>
        <span v-else>{{ confirmText }}</span>
      </BaseButton>
    </template>
  </BaseModal>
</template>

<script setup>
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Підтвердження'
  },
  message: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
    default: 'Підтвердити'
  },
  cancelText: {
    type: String,
    default: 'Скасувати'
  },
  confirmVariant: {
    type: String,
    default: 'primary' // 'primary', 'danger'
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'confirm'])

const handleConfirm = () => {
  emit('confirm')
}
</script>

<style scoped>
.confirm-modal-content {
  display: flex;
  flex-direction: column;
  min-width: 300px;
}

.description {
  font-size: 0.95rem;
  color: #334155;
  margin: 0;
  line-height: 1.5;
}
</style>
