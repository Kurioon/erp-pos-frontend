<template>
  <GlobalNotifications />

  <DefaultLayout v-if="showLayout" />
  
  <router-view v-else />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import GlobalNotifications from '@/components/ui/GlobalNotifications.vue'

const route = useRoute()
const showLayout = computed(() => route.meta.requiresAuth)
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

body, html {
  font-family: 'Inter', sans-serif;
  margin: 0;
  padding: 0;
  background-color: #ffffff;
  color: #0f172a;
  min-height: 100vh;
  width: 100vw;
  overflow-x: hidden;
}

* {
  box-sizing: border-box;
}
</style>