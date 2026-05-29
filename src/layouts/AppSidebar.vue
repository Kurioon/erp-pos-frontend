<template>
  <aside class="sidebar">
    <div class="logo">ERP / POS</div>
    <nav class="nav-menu">
      <router-link
        v-for="item in menuItems"
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
import IconCard from '@/components/icons/IconCard.vue'
import IconBox from '@/components/icons/IconBox.vue'
import IconRepair from '@/components/icons/IconRepair.vue'

const menuItems = [
  { name: 'Каса (POS)', path: '/pos', icon: IconCard },
  { name: 'Склади', path: '/warehouses', icon: IconBox },
  { name: 'Ремонти', path: '/repairs', icon: IconRepair }
]
</script>

<style scoped>
.sidebar {
  width: 250px;
  height: 100vh;
  background-color: #ffffff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}
.logo {
  padding: 24px;
  font-size: 1.25rem;
  font-weight: bold;
  color: #111827;
  border-bottom: 1px solid #e5e7eb;
}
.nav-menu {
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.nav-link {
  padding: 12px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: #4b5563;
  transition: background-color 0.2s ease;
}
.icon {
  display: flex;
  align-items: center;
  justify-content: center;
}
.nav-link:hover {
  background-color: #f3f4f6;
}
.active-link {
  background-color: #eff6ff;
  color: #2563eb;
  border-right: 3px solid #2563eb;
  font-weight: 500;
}
</style>