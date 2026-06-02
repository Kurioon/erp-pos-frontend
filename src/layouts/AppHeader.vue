<template>
  <header class="header">
    <div class="header-content">
      
      <div class="left-side-header">
        <h2 class="page-title">Робочий простір</h2>
        
        <div 
          class="global-store-selector" 
          @click="toggleStoreMenu" 
          @blur="closeStoreMenu" 
          tabindex="0"
        >
          <span class="status-dot"></span>
          <span class="selected-store-label">{{ selectedStore.label }}</span>
          <span class="dropdown-icon-arrow" :class="{ 'rotated': isStoreMenuOpen }">▼</span>
          
          <transition name="dropdown">
            <div v-if="isStoreMenuOpen" class="store-dropdown-menu">
              <button 
                v-for="store in stores" 
                :key="store.value" 
                class="store-option-btn"
                :class="{ 'is-active': selectedStore.value === store.value }"
                @click.stop="selectStore(store)"
              >
                <span class="option-txt">{{ store.label }}</span>
                <svg v-if="selectedStore.value === store.value" class="check-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </button>
            </div>
          </transition>
        </div>
      </div>

      <div
        class="profile-wrapper"
        @click="toggleMenu"
        @blur="closeMenu"
        tabindex="0"
      >
        <div class="user-profile">
          <div class="avatar">{{ userInitial }}</div>
          <span class="user-name">{{ userName }}</span>
          <span class="dropdown-icon" :class="{ 'rotated': isMenuOpen }">▼</span>
        </div>

        <transition name="dropdown">
          <div v-if="isMenuOpen" class="dropdown-menu">
            <div class="menu-info">
              <span class="info-role">{{ userRoleLabel }}</span>
            </div>
            <div class="menu-divider"></div>
            <button class="logout-btn" @click.stop="handleLogout">
              Вийти з системи
            </button>
          </div>
        </transition>
      </div>

    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRepairsStore } from '@/stores/repairs' 

const authStore = useAuthStore()
const repairsStore = useRepairsStore()


const isMenuOpen = ref(false)
const toggleMenu = () => { isMenuOpen.value = !isMenuOpen.value }
const closeMenu = () => { setTimeout(() => { isMenuOpen.value = false }, 150) }


const isStoreMenuOpen = ref(false)
const stores = [
  { value: 'all', label: 'Загальне' },
  { value: '1', label: 'Каса 1' },
  { value: '2', label: 'Каса 2' },
  { value: '3', label: 'Каса 3' }
]


const selectedStore = computed(() => {
  const currentLabel = repairsStore.selectedCashRegister || 'Загальне'
  return stores.find(s => s.label === currentLabel) || stores[0]
})

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

const handleLogout = () => {
  isMenuOpen.value = false
  authStore.logout()
}


const userName = computed(() => authStore.user?.name || 'Гість')
const userInitial = computed(() => userName.value.charAt(0).toUpperCase())
const userRoleLabel = computed(() => {
  if (authStore.user?.role === 'admin') return 'Адміністратор (Повний доступ)'
  if (authStore.user?.role === 'seller') return 'Продавець (Каса)'
  return 'Адміністратор (Повний доступ)'
})
</script>

<style scoped>
.header {
  height: 72px;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  position: relative;
  z-index: 20;
}

.header-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left-side-header {
  display: flex;
  align-items: center;
  gap: 20px;
}

.page-title {
  font-size: 1.125rem;
  color: #111827;
  margin: 0;
  font-weight: 600;
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
  left: 0;
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


.profile-wrapper {
  position: relative;
  cursor: pointer;
  outline: none;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #374151;
  padding: 6px 12px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.user-profile:hover {
  background-color: #f3f4f6;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #2563eb;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
}

.user-name {
  font-weight: 500;
  font-size: 0.95rem;
}

.dropdown-icon {
  font-size: 0.6rem;
  color: #9ca3af;
  transition: transform 0.2s ease;
}
.dropdown-icon.rotated {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  width: 220px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.menu-info {
  padding: 12px 16px;
  background-color: #f9fafb;
}

.info-role {
  display: block;
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.menu-divider {
  height: 1px;
  background-color: #e5e7eb;
}

.logout-btn {
  width: 100%;
  text-align: left;
  padding: 12px 16px;
  background: transparent;
  border: none;
  color: #ef4444;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.logout-btn:hover {
  background-color: #fef2f2;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>