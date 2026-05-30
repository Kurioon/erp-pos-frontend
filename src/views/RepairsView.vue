ї<script setup>
import { computed } from 'vue'
import { useRepairsStore } from '@/stores/repairs'
import BaseButton from '@/components/ui/BaseButton.vue'
import RepairCard from '@/components/repairs/RepairCard.vue'

const repairsStore = useRepairsStore()

const pendingJobs = computed(() => repairsStore.jobs.filter(j => j.status === 'прийнято'))
const waitingJobs = computed(() => repairsStore.jobs.filter(j => j.status.includes('очікує')))
const completedJobs = computed(() => repairsStore.jobs.filter(j => j.status === 'відремонтовано'))
const deliveredJobs = computed(() => repairsStore.jobs.filter(j => j.status === 'видано'))

const totalJobs = computed(() => repairsStore.jobs.length)
const activeJobs = computed(() => pendingJobs.value.length + waitingJobs.value.length)
</script>

<template>
  <div class="repairs-view">
    <header class="header">
      <div class="header-titles">
        <h1>Ремонти — Service Desk</h1>
        <p class="subtitle">Всього: {{ totalJobs }} · Активних: {{ activeJobs }}</p>
      </div>
      
      <div class="header-actions">
        <div class="view-toggle">
          <button class="toggle-btn active">Канбан</button>
          <button class="toggle-btn">Таблиця</button>
        </div>
        <BaseButton>+ Новий ремонт</BaseButton>
      </div>
    </header>

    <main class="kanban-board">
      <div class="kanban-column col-pending">
        <div class="column-header">
          <h2 class="column-title">Прийнято</h2>
          <span class="counter">{{ pendingJobs.length }}</span>
        </div>
        <div class="kanban-cards">
          <RepairCard v-for="item in pendingJobs" :key="item.id" :job="item" />
        </div>
      </div>

      <div class="kanban-column col-waiting">
        <div class="column-header">
          <h2 class="column-title">Очікування запчастин</h2>
          <span class="counter">{{ waitingJobs.length }}</span>
        </div>
        <div class="kanban-cards">
          <RepairCard v-for="item in waitingJobs" :key="item.id" :job="item" />
        </div>
      </div>

      <div class="kanban-column col-completed">
        <div class="column-header">
          <h2 class="column-title">Відремонтовано</h2>
          <span class="counter">{{ completedJobs.length }}</span>
        </div>
        <div class="kanban-cards">
          <RepairCard v-for="item in completedJobs" :key="item.id" :job="item" />
        </div>
      </div>

      <div class="kanban-column col-delivered">
        <div class="column-header">
          <h2 class="column-title">Видано</h2>
          <span class="counter">{{ deliveredJobs.length }}</span>
        </div>
        <div class="kanban-cards">
          <RepairCard v-for="item in deliveredJobs" :key="item.id" :job="item" />
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.repairs-view {
  padding: 32px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #ffffff; /* Білий фон самої сторінки */
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.header-titles h1 {
  font-size: 1.5rem;
  color: #0f172a;
  margin: 0 0 4px 0;
}

.subtitle {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.view-toggle {
  display: flex;
  border: 1px solid #cbd5e1; 
  border-radius: 6px;
  overflow: hidden;
  background-color: white;
}

.toggle-btn {
  padding: 8px 24px; 
  background: transparent;
  border: none;
  font-size: 0.95rem;
  font-weight: 500;
  color: #334155; 
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-btn.active {
  background: #2563eb; 
  color: white;
}
.kanban-board {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  align-items: start;
  flex: 1;
  overflow-x: auto;
  padding-bottom: 20px;
}

.kanban-column {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  border-top: 4px solid transparent; 
}

.col-pending { border-top-color: #334155; }   /* Темно-сірий */
.col-waiting { border-top-color: #f59e0b; }   /* Жовтий */
.col-completed { border-top-color: #3b82f6; } /* Синій */
.col-delivered { border-top-color: #10b981; } /* Зелений */

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 12px;
}

.column-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.counter {
  color: #94a3b8;
  font-size: 0.85rem;
  font-weight: 500;
}

.kanban-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>