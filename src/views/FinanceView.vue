<script setup>

import { useFinanceStore } from '@/stores/finance'
import BaseButton from '@/components/ui/BaseButton.vue'


const currentStore = useFinanceStore()
</script>

<template>
  <div class="view-wrapper">
    <header class="header">

      <h1>Фінанси</h1>
      <BaseButton>Додати запис</BaseButton>
    </header>

    <main class="content-list">
      <pre class="mock-data">{{ currentStore }}</pre>
    </main>
  </div>
</template>

<style scoped>
.view-wrapper {
  padding: 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.mock-data {
  border: 1px dashed #ccc;
  padding: 15px;
  border-radius: 8px;
  background-color: #f9f9f9;
}
</style>