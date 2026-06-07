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

    <!-- Global Counterparty Drawer -->
    <CounterpartyDrawer
      :is-open="counterpartiesStore.isGlobalDrawerOpen"
      :counterparty="counterpartiesStore.currentCounterparty"
      @close="counterpartiesStore.closeGlobalDrawer()"
      @edit="handleGlobalDrawerEdit"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
import CounterpartyDrawer from '@/components/counterparties/CounterpartyDrawer.vue'
import { useCounterpartiesStore } from '@/stores/counterparties'

const route = useRoute()
const isMobileSidebarOpen = ref(false)
const counterpartiesStore = useCounterpartiesStore()

const handleGlobalDrawerEdit = (cp) => {
  // If we need to edit from the global drawer, we could trigger the form modal.
  // For now, it's view-only globally or you can add a global modal too.
}

watch(() => route.path, () => {
  isMobileSidebarOpen.value = false
})
</script>

<style scoped>
.app-layout-container {
  display: flex;
  height: 100vh; 
  width: 100vw;
  overflow: hidden;
  background-color: #f9fafb;
}

.main-viewport-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.page-content-render {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

@media (max-width: 1023px) {
  .main-viewport-wrapper {
    padding-left: 0;
  }

  .page-content-render {
    padding: 12px;
    overflow-x: hidden;
  }

  .sidebar-mobile-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: rgba(15, 23, 42, 0.3);
    backdrop-filter: blur(2px);
    z-index: 90;
  }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
