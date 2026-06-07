<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div
        v-if="isOpen"
        class="modal-backdrop"
        @click.self="close"
        @keydown.esc="close"
        tabindex="-1"
      >
        <div
          class="modal-content"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
        >

          <header class="modal-header">
            <h3 :id="titleId" class="modal-title">{{ title }}</h3>
            <button class="modal-close-btn" @click="close" aria-label="Закрити модальне вікно">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </header>

          <main class="modal-body">
            <slot></slot>
          </main>

          <footer class="modal-footer" v-if="$slots.footer">
            <slot name="footer"></slot>
          </footer>

        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { computed, watch, nextTick } from 'vue'

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  title: { type: String, default: 'Модальне вікно' }
})

const emit = defineEmits(['close'])
const titleId = computed(() => `modal-title-${Math.random().toString(36).substr(2, 9)}`)

const close = () => { emit('close') }

watch(() => props.isOpen, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden'
    nextTick(() => {
      const modal = document.querySelector('.modal-content')
      if (modal) modal.focus()
    })
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease, backdrop-filter 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; backdrop-filter: blur(0px); }
.modal-fade-enter-active .modal-content { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

.modal-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(15, 23, 42, 0.5); backdrop-filter: blur(2px); display: flex; justify-content: center; align-items: center; z-index: 9999; }
.modal-content { background: white; border-radius: 16px; width: 90%; max-width: 460px; max-height: 90vh; overflow-y: auto; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05); display: flex; flex-direction: column; outline: none; }
.modal-header { padding: 24px 28px 16px; display: flex; justify-content: space-between; align-items: center; }
.modal-title { margin: 0; font-size: 1.25rem; font-weight: 600; color: #0f172a; letter-spacing: -0.025em; }
.modal-close-btn { background: #f1f5f9; border: none; color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 6px; border-radius: 50%; transition: all 0.2s ease; }
.modal-close-btn:hover, .modal-close-btn:focus-visible { background: #e2e8f0; color: #0f172a; outline: 2px solid #2563eb; }
.modal-body { padding: 0 28px 28px; }
.modal-footer { padding: 16px 28px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 12px; }

@media (max-width: 480px) {
  .modal-content { width: 94%; max-height: 92vh; border-radius: 12px; }
  .modal-header { padding: 16px 16px 12px; }
  .modal-title { font-size: 1.1rem; }
  .modal-body { padding: 0 16px 16px; }
  .modal-footer { padding: 12px 16px; }
}
</style>
