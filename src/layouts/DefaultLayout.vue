<template>
  <div class="layout-wrapper">
    <AppSidebar />
    <div class="main-content">
      <AppHeader />
      <main class="page-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
</script>

<style scoped>
.layout-wrapper {
  display: flex;
  min-height: 100vh;
  background-color: #f9fafb; 
}
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.page-content {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
}
</style>