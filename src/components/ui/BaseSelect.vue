<template>
  <div class="base-select-group" :class="{ 'is-disabled': disabled }">
    <label v-if="label" :id="`${uuid}-label`" class="base-select-label">{{ label }}</label>

    <div
      ref="wrapperRef"
      class="custom-select-wrapper"
      :class="{ 'is-invalid': error, 'is-open': isOpen }"
      :tabindex="disabled ? -1 : 0"
      :aria-labelledby="label ? `${uuid}-label` : null"
      :aria-expanded="isOpen"
      :aria-invalid="!!error"
      role="combobox"
      @click="toggleDropdown"
      @keydown.enter.prevent="toggleDropdown"
      @keydown.space.prevent="toggleDropdown"
      @keydown.esc.prevent="closeDropdown"
      @keydown.down.prevent="navigateOptions(1)"
      @keydown.up.prevent="navigateOptions(-1)"
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
        <div v-if="isOpen" class="dropdown-menu" role="listbox">
          
          <div class="base-select-header" @click.stop v-if="$slots.header">
            <slot name="header"></slot>
          </div>

          <div v-if="searchable" class="search-container">
            <input 
              ref="searchInput"
              v-model="searchQuery"
              @input="emitSearch"
              class="select-search-input"
              placeholder="Пошук..."
              @click.stop
              @keydown.enter.prevent
            />
          </div>
          <button
            v-for="(option, index) in options"
            :key="option.value"
            class="option-btn"
            :class="{ 'is-active': modelValue === option.value, 'is-focused': focusedIndex === index }"
            role="option"
            :aria-selected="modelValue === option.value"
            @click.stop="selectOption(option)"
            @mousemove="focusedIndex = index"
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

          <div v-if="options.length === 0" class="no-options">
            Нічого не знайдено
          </div>

          <slot name="append"></slot>
        </div>
      </transition>
    </div>

    <span v-if="error" class="base-select-error" role="alert">{{ error }}</span>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: 'Оберіть...' },
  options: { type: Array, required: true, default: () => [] },
  disabled: { type: Boolean, default: false },
  error: { type: String, default: '' },
  showDot: { type: Boolean, default: false },
  searchable: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'search', 'change'])

const uuid = computed(() => `select-${Math.random().toString(36).substr(2, 9)}`)
const isOpen = ref(false)
const focusedIndex = ref(-1)
const searchQuery = ref('')
const searchInput = ref(null)
const wrapperRef = ref(null)

let searchTimeout = null
const emitSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    emit('search', searchQuery.value)
  }, 300)
}

const selectedOption = computed(() => props.options.find(opt => opt.value === props.modelValue))
const displayLabel = computed(() => selectedOption.value ? selectedOption.value.label : props.placeholder)

const toggleDropdown = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
    if (isOpen.value) {
      focusedIndex.value = props.options.findIndex(opt => opt.value === props.modelValue)
      if (props.searchable) {
        setTimeout(() => { searchInput.value?.focus() }, 50)
      }
    } else {
      searchQuery.value = ''
      emit('search', '')
    }
  }
}

const handleClickOutside = (e) => {
  if (isOpen.value && wrapperRef.value && !wrapperRef.value.contains(e.target)) {
    isOpen.value = false
    searchQuery.value = ''
    emit('search', '')
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

const closeDropdown = () => {
  isOpen.value = false
}

const selectOption = (option) => {
  emit('update:modelValue', option.value)
  emit('change', option.value)
  isOpen.value = false
  searchQuery.value = ''
  emit('search', '')
}

const navigateOptions = (direction) => {
  if (!isOpen.value) {
    isOpen.value = true
    return
  }
  const max = props.options.length - 1
  let newIndex = focusedIndex.value + direction
  if (newIndex < 0) newIndex = 0
  if (newIndex > max) newIndex = max
  focusedIndex.value = newIndex

}
</script>

<style scoped>
.base-select-group { display: flex; flex-direction: column; gap: 6px; width: 100%; font-family: inherit; position: relative; }
.base-select-label { font-size: 0.85rem; font-weight: 600; color: #64748b; }
.custom-select-wrapper { position: relative; width: 100%; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; outline: none; user-select: none; transition: all 0.2s ease; }
.custom-select-wrapper:hover:not(.is-invalid) { border-color: #cbd5e1; background: #f1f5f9; }
.custom-select-wrapper:focus-visible { outline: 3px solid rgba(37, 99, 235, 0.3); border-color: #2563eb; }
.custom-select-wrapper.is-open { border-color: #cbd5e1; background: #ffffff; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
.custom-select-wrapper.is-invalid { border-color: #ef4444; background-color: #fef2f2; }
.is-disabled .custom-select-wrapper { background-color: #f3f4f6; border-color: #e5e7eb; cursor: not-allowed; opacity: 0.8; }
.select-trigger { display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; min-height: 42px; }
.trigger-left { display: flex; align-items: center; gap: 8px; overflow: hidden; }
.status-dot { width: 8px; height: 8px; background-color: #10b981; border-radius: 50%; flex-shrink: 0; }
.selected-label { font-size: 0.9rem; font-weight: 600; color: #334155; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.placeholder-text { color: #94a3b8; font-weight: 400; }
.dropdown-arrow { font-size: 0.65rem; color: #94a3b8; transition: transform 0.2s ease; flex-shrink: 0; margin-left: 8px; }
.dropdown-arrow.rotated { transform: rotate(180deg); }
.dropdown-menu { position: absolute; top: calc(100% + 6px); left: 0; width: 100%; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08); overflow: hidden; display: flex; flex-direction: column; padding: 4px; z-index: 100; max-height: 250px; overflow-y: auto; }
.option-btn { width: 100%; text-align: left; padding: 10px 12px; background: transparent; border: none; font-size: 0.9rem; font-weight: 500; color: #4b5563; cursor: pointer; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; transition: all 0.15s ease; }
.option-btn:focus, .option-btn.is-focused { background-color: #f3f4f6; outline: none; }
.option-btn.is-active { background-color: #eff6ff; color: #2563eb; font-weight: 600; }
.check-icon { color: #2563eb; flex-shrink: 0; }
.base-select-error { font-size: 0.75rem; color: #ef4444; margin-top: 2px; }

.search-container { padding: 8px; border-bottom: 1px solid #f1f5f9; }
.select-search-input { width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; font-size: 0.85rem; transition: border-color 0.2s; }
.select-search-input:focus { border-color: #2563eb; }
.no-options { padding: 12px; text-align: center; color: #94a3b8; font-size: 0.85rem; font-style: italic; }
</style>
