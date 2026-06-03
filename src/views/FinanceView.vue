<script setup>
import { ref, computed } from 'vue'
import { useRepairsStore } from '@/stores/repairs'
import TransactionJournal from '@/components/finance/TransactionJournal.vue'
import CashManagement from '@/components/finance/CashManagement.vue'

const repairsStore = useRepairsStore()
const currentRegister = computed(() => repairsStore.selectedCashRegister || 'Загальне')


const isStoreMenuOpen = ref(false)
const stores = [
  { value: 'all', label: 'Загальне' },
  { value: '1', label: 'Каса 1' },
  { value: '2', label: 'Каса 2' },
  { value: '3', label: 'Каса 3' }
]

const toggleStoreMenu = () => {
  isStoreMenuOpen.value = !isStoreMenuOpen.value
}

const closeStoreMenu = () => {
  setTimeout(() => { isStoreMenuOpen.value = false }, 150)
}

const selectStore = (store) => {
  repairsStore.selectedCashRegister = store.label
  isStoreMenuOpen.value = false
}

// Управління вкладками фінансів
const activeTabId = ref('journal')
const tabs = [
  { id: 'journal', label: 'Журнал транзакцій', component: TransactionJournal },
  { id: 'management', label: 'Управління касами', component: CashManagement }
]

const activeComponent = computed(() => {
  const found = tabs.find(t => t.id === activeTabId.value)
  return found ? found.component : TransactionJournal
})
</script>

<template>
  <div class="finance-view">
    <header class="page-header">
      <div class="header-title-row">
        <div class="header-info">
          <h1>Фінанси</h1>
          <p class="subtitle">Касова дисципліна та управління касами</p>
        </div>

        <div 
          class="global-store-selector" 
          @click="toggleStoreMenu" 
          @blur="closeStoreMenu" 
          tabindex="0"
        >
          <span class="status-dot"></span>
          <span class="selected-store-label">{{ currentRegister }}</span>
          <span class="dropdown-icon-arrow" :class="{ 'rotated': isStoreMenuOpen }">▼</span>
          
          <transition name="dropdown">
            <div v-if="isStoreMenuOpen" class="store-dropdown-menu">
              <button 
                v-for="store in stores" 
                :key="store.value" 
                class="store-option-btn"
                :class="{ 'is-active': currentRegister === store.label }"
                @click.stop="selectStore(store)"
              >
                <span class="option-txt">{{ store.label }}</span>
                <svg v-if="currentRegister === store.label" class="check-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </button>
            </div>
          </transition>
        </div>
      </div>
    </header>

    <div class="tabs-navigation">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        class="tab-link" 
        :class="{ 'is-active': activeTabId === tab.id }"
        @click="activeTabId = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="tab-content-wrapper">
      <transition name="fade-slide" mode="out-in">
        <component :is="activeComponent" :key="activeTabId" />
      </transition>
    </div>
  </div>
</template>

<style scoped>
.finance-view {
  padding: 32px;
  background-color: #ffffff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  margin-bottom: 8px;
}

.header-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-info h1 {
  font-size: 1.6rem;
  color: #0f172a;
  margin: 0 0 4px 0;
  font-weight: 700;
}

.subtitle {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
}

/* Навігація вкладок */
.tabs-navigation {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 4px;
}

.tab-link {
  padding: 10px 20px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 0.95rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-link:hover {
  color: #0f172a;
}

.tab-link.is-active {
  color: #2563eb;
  border-bottom-color: #2563eb;
}

.tab-content-wrapper {
  flex: 1;
}

.global-store-selector {
  display: inline-flex;
  align-items: center;
  background: #f8fafc;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  position: relative;
  outline: none;
  user-select: none;
  transition: all 0.2s ease;
}

.global-store-selector:hover, .global-store-selector:focus-within {
  border-color: #cbd5e1;
  background: #f1f5f9;
}

.selected-store-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #334155;
  margin-right: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  background-color: #10b981;
  border-radius: 50%;
  margin-right: 8px;
}

.dropdown-icon-arrow {
  font-size: 0.6rem;
  color: #9ca3af;
  transition: transform 0.2s ease;
}

.dropdown-icon-arrow.rotated {
  transform: rotate(180deg);
}

.store-dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  width: 180px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 4px;
  z-index: 150;
}

.store-option-btn {
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

.store-option-btn:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.store-option-btn.is-active {
  background-color: #eff6ff;
  color: #2563eb;
  font-weight: 600;
}

.check-icon {
  color: #2563eb;
}

.fade-slide-enter-active, .fade-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-slide-enter-from { opacity: 0; transform: translateY(8px); }
.fade-slide-leave-to { opacity: 0; transform: translateY(-8px); }

.dropdown-enter-active, .dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>