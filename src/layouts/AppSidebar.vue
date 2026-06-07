<template>
  <aside class="sidebar" :class="{ 'mobile-open': isMobileOpen }">

    <div class="logo-section">
      <img src="/favicon.png" alt="SA2 Logo" class="sidebar-logo" />
      <span class="logo-brand-text">SA2</span>
    </div>

    <nav class="nav-menu">
      <router-link
        v-for="item in filteredMenuItems"
        :key="item.path"
        :to="item.path"
        class="nav-link"
        active-class="active-link"
      >
        <div class="icon-wrapper">
          <component :is="item.icon" class="icon" />
        </div>
        <span class="nav-text">{{ item.name }}</span>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <span class="version-text">v1.0.0 · 2026</span>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import IconDashboard from '@/components/icons/IconDashboard.vue'
import IconCard from '@/components/icons/IconCard.vue'
import IconBox from '@/components/icons/IconBox.vue'
import IconProcurement from '@/components/icons/IconProcurement.vue'
import IconRepair from '@/components/icons/IconRepair.vue'
import IconFinance from '@/components/icons/IconFinance.vue'
import IconUsers from '@/components/icons/IconUsers.vue'
import IconLock from '@/components/icons/IconLock.vue' // Reusing a lock icon or similar for admin

defineProps({
  isMobileOpen: {
    type: Boolean,
    default: false
  }
})

const authStore = useAuthStore()
const router = useRouter()

const menuItems = [
  { name: 'Дашборд', path: '/dashboard', icon: IconDashboard },
  { name: 'POS-Термінал', path: '/pos', icon: IconCard },
  { name: 'Склад', path: '/warehouses', icon: IconBox },
  { name: 'Закупівлі', path: '/procurement', icon: IconProcurement },
  { name: 'Ремонти', path: '/repairs', icon: IconRepair },
  { name: 'Фінанси', path: '/finance', icon: IconFinance },
  { name: 'Контрагенти', path: '/counterparties', icon: IconUsers },
  { name: 'Адміністрування', path: '/admin', icon: IconLock }
]

const filteredMenuItems = computed(() => {
  const currentRole = authStore.user?.role

  if (!currentRole) return []

  return menuItems.filter(item => {
    const route = router.getRoutes().find(r => r.path === item.path)
    return route?.meta?.allowedRoles?.includes(currentRole)
  })
})
</script>

<style scoped>
.sidebar {
  width: 260px;
  height: 100vh;
  background-color: #1e293b;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  border-right: 1px solid #334155;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.logo-section {
  height: 72px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #334155;
  user-select: none;
}

.sidebar-logo {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  object-fit: cover;
}

.logo-brand-text {
  font-size: 1.15rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.01em;
}

.nav-menu {
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  text-decoration: none;
  color: #94a3b8;
  border-radius: 8px;
  transition: all 0.15s ease;
  font-weight: 600;
  font-size: 0.95rem;
}

.nav-link:hover {
  background-color: #334155;
  color: #f1f5f9;
}

.active-link {
  background-color: #2563eb !important;
  color: #ffffff !important;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
}

.icon {
  width: 18px;
  height: 18px;
}

.sidebar-footer {
  padding: 20px 24px;
  border-top: 1px solid #334155;
}

.version-text {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

@media (max-width: 1023px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 100;
    transform: translateX(-100%);
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }
}
</style>
