<template>
  <div class="app-layout-container">
    <AppSidebar :isMobileOpen="isMobileSidebarOpen" />

    <transition name="fade">
      <div 
        v-if="isMobileSidebarOpen" 
        class="sidebar-mobile-overlay" 
        @click="isMobileSidebarOpen = false"
      ></div>
    </transition>

    <div class="main-viewport-wrapper">
      <AppHeader @toggle-menu="isMobileSidebarOpen = !isMobileSidebarOpen" />
      
      <main class="page-content-render">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '@/layouts/AppSidebar.vue'
import AppHeader from '@/layouts/AppHeader.vue'

const route = useRoute()
const isMobileSidebarOpen = ref(false)

watch(() => route.path, () => {
  isMobileSidebarOpen.value = false
})
</script>

<style scoped>
.app-layout-container {
  display: flex;
  min-height: 100vh;
  width: 100vw;
  background-color: #ffffff;
}

.main-viewport-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.page-content-render {
  flex: 1;
  background-color: #ffffff;
}

@media (min-width: 1024px) {
  .main-viewport-wrapper {
    padding-left: 260px; 
  }
}

@media (max-width: 1023px) {
  .main-viewport-wrapper {
    padding-left: 0; 
  }

  .sidebar-mobile-overlay {
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    background: rgba(15, 23, 42, 0.3);
    backdrop-filter: blur(2px); 
    z-index: 90;
  }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>