<template>
  <aside class="sidebar">
    <div class="logo">ERP / POS</div>
    <nav class="nav-menu">
      <router-link
        v-for="item in filteredMenuItems"
        :key="item.path"
        :to="item.path"
        class="nav-link"
        active-class="active-link"
      >
        <component :is="item.icon" class="icon" />
        {{ item.name }}
      </router-link>
    </nav>
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

const authStore = useAuthStore()
const router = useRouter()

const menuItems = [
  { name: 'Дашборд', path: '/dashboard', icon: IconDashboard },
  { name: 'POS-термінал', path: '/pos', icon: IconCard },
  { name: 'Склади', path: '/warehouses', icon: IconBox },
  { name: 'Закупівлі', path: '/procurement', icon: IconProcurement },
  { name: 'Ремонти', path: '/repairs', icon: IconRepair },
  { name: 'Фінанси', path: '/finance', icon: IconFinance }
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
}

.logo {
  height: 72px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.25rem;
  font-weight: 600;
  border-bottom: 1px solid #334155;
}

.nav-menu {
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-link {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: #cbd5e1;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-weight: 500;
}

.nav-link:hover {
  background-color: #334155;
  color: #ffffff;
}

.active-link {
  background-color: #3b82f6;
  color: #ffffff;
}

.icon {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
