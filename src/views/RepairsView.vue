<script setup>
import { useRepairsStore } from '@/stores/repairs'
import BaseButton from '@/components/ui/BaseButton.vue'
import RepairCard from '@/components/repairs/RepairCard.vue'

const repairsStore = useRepairsStore()
</script>

<template>
  <div class="repairs-view">
    <header class="header">
      <h1>Сервісний центр (Ремонти)</h1>
      <BaseButton>Додати ремонт</BaseButton>
    </header>

    <main class="repairs-list">
      <RepairCard 
  v-for="item in repairsStore.jobs" 
  :key="item.id" 
  :job="item" 
/>
    </main>
  </div>
</template>

<style scoped>
.repairs-view {
  padding: 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.repair-card-mock {
  border: 1px dashed #ccc;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 8px;
  background-color: #f9f9f9;
}
</style>во