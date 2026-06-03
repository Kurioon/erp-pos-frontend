<template>
  <div class="base-select-group" :class="{ 'is-disabled': disabled }">
    <label v-if="label" class="base-select-label">{{ label }}</label>

    <div
      class="custom-select-wrapper"
      :class="{ 'is-invalid': error, 'is-open': isOpen }"
      @click="toggleDropdown"
      @blur="closeDropdown"
      tabindex="0"
    >
      <div class="select-trigger">
        <div class="trigger-left">
          <span v-if="showDot" class="status-dot"></span>

          <span class="selected-label" :class="{ 'placeholder-text': !selectedOption }">
            {{ displayLabel }}
          </span>
        </div>

        <span class="dropdown-arrow" :class="{ 'rotated': isOpen }">▼</span>
      </div>

      <transition name="dropdown">
        <div v-if="isOpen" class="dropdown-menu">
          <button
            v-for="option in options"
            :key="option.value"
            class="option-btn"
            :class="{ 'is-active': modelValue === option.value }"
            @click.stop="selectOption(option)"
          >
            <span class="option-txt">{{ option.label }}</span>
            <svg
              v-if="modelValue === option.value"
              class="check-icon"
              xmlns="http://www.w3.org/2000/svg"
              width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="3"
              stroke-linecap="round" stroke-linejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </button>
        </div>
      </transition>
    </div>

    <span v-if="error" class="base-select-error">{{ error }}</span>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Оберіть...'
  },
  options: {
    type: Array,
    required: true,
    default: () => []
  },
  disabled: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  showDot: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)

const selectedOption = computed(() => {
  return props.options.find(opt => opt.value === props.modelValue)
})

const displayLabel = computed(() => {
  return selectedOption.value ? selectedOption.value.label : props.placeholder
})

const toggleDropdown = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
  }
}

const closeDropdown = () => {
  setTimeout(() => {
    isOpen.value = false
  }, 150)
}

const selectOption = (option) => {
  emit('update:modelValue', option.value)
  isOpen.value = false
}
</script>

<style scoped>
.base-select-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  font-family: inherit;
  position: relative;
}

.base-select-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
}

.custom-select-wrapper {
  position: relative;
  width: 100%;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  outline: none;
  user-select: none;
  transition: all 0.2s ease;
}

.custom-select-wrapper:hover:not(.is-invalid),
.custom-select-wrapper:focus-within:not(.is-invalid) {
  border-color: #cbd5e1;
  background: #f1f5f9;
}

.custom-select-wrapper.is-open {
  border-color: #cbd5e1;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.custom-select-wrapper.is-invalid {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.is-disabled .custom-select-wrapper {
  background-color: #f3f4f6;
  border-color: #e5e7eb;
  cursor: not-allowed;
  opacity: 0.8;
}

.select-trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  min-height: 42px;
}

.trigger-left {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
}

.status-dot {
  width: 8px;
  height: 8px;
  background-color: #10b981;
  border-radius: 50%;
  flex-shrink: 0;
}

.selected-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #334155;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.placeholder-text {
  color: #94a3b8;
  font-weight: 400;
}

.dropdown-arrow {
  font-size: 0.65rem;
  color: #94a3b8;
  transition: transform 0.2s ease;
  flex-shrink: 0;
  margin-left: 8px;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  width: 100%;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 4px;
  z-index: 100;
  max-height: 250px;
  overflow-y: auto;
}

.option-btn {
  width: 100%;
  text-align: left;
  padding: 10px 12px;
  background: transparent;
  border: none;
  font-size: 0.9rem;
  font-weight: 500;
  color: #4b5563;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.15s ease;
}

.option-btn:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.option-btn.is-active {
  background-color: #eff6ff;
  color: #2563eb;
  font-weight: 600;
}

.check-icon {
  color: #2563eb;
  flex-shrink: 0;
}

.base-select-error {
  font-size: 0.75rem;
  color: #ef4444;
  margin-top: 2px;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
