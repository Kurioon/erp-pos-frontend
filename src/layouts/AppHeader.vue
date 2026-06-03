<template>
  <header class="header">
    <div class="header-content">
      
      <div class="left-side-header">
        <h2 class="page-title">Робочий простір</h2>
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

const authStore = useAuthStore()

const isMenuOpen = ref(false)
const toggleMenu = () => { isMenuOpen.value = !isMenuOpen.value }
const closeMenu = () => { setTimeout(() => { isMenuOpen.value = false }, 150) }

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