<script setup>
import { ref, computed } from 'vue'
import { useRepairsStore } from '@/stores/repairs'
import BaseButton from '@/components/ui/BaseButton.vue'
import RepairCard from '@/components/repairs/RepairCard.vue'
import RepairFormModal from '@/components/repairs/RepairFormModal.vue'
import BaseStatusBadge from '@/components/ui/BaseStatusBadge.vue'

const repairsStore = useRepairsStore()
const viewMode = ref('kanban')
const isModalOpen = ref(false) // Керує видимістю модалки

// Функція, яка приймає дані з форми і створює ремонт
const handleAddRepair = (formData) => {
  const newId = repairsStore.jobs.length ? Math.max(...repairsStore.jobs.map(j => j.id)) + 1 : 1
  const newRepair = {
    id: newId,
    ...formData,
    status: 'прийнято', // Всі нові ремонти падають у першу колонку
    created_at: new Date().toISOString()
  }
  repairsStore.jobs.push(newRepair) // Додаємо в стор
  isModalOpen.value = false // Закриваємо модалку
}

// Дані для Канбан-дошки
const pendingJobs = computed(() => repairsStore.jobs.filter(j => j.status === 'прийнято'))
const waitingJobs = computed(() => repairsStore.jobs.filter(j => j.status.includes('очікує')))
const completedJobs = computed(() => repairsStore.jobs.filter(j => j.status === 'відремонтовано'))
const deliveredJobs = computed(() => repairsStore.jobs.filter(j => j.status === 'видано'))

const totalJobs = computed(() => repairsStore.jobs.length)
const activeJobs = computed(() => pendingJobs.value.length + waitingJobs.value.length)

// Робить першу літеру великою (прийнято -> Прийнято)
const formatStatus = (status) => {
  if (!status) return ''
  return status.charAt(0).toUpperCase() + status.slice(1)
}

// Повертає правильний CSS клас для статусу
const getTableStatusClass = (status) => {
  const s = status.toLowerCase()
  if (s.includes('прийнято')) return 'status-pending'
  if (s.includes('очікує')) return 'status-waiting'
  if (s.includes('відремонтовано')) return 'status-completed'
  return 'status-pending'
}
// Функція для красивого виводу дати і часу
const formatDateTime = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toLocaleString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
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
          <button 
            class="toggle-btn" 
            :class="{ active: viewMode === 'kanban' }"
            @click="viewMode = 'kanban'"
          >
            Канбан
          </button>
          <button 
            class="toggle-btn" 
            :class="{ active: viewMode === 'table' }"
            @click="viewMode = 'table'"
          >
            Таблиця
          </button>
        </div>
        <BaseButton @click="isModalOpen = true">+ Новий ремонт</BaseButton>
        <RepairFormModal 
      v-if="isModalOpen" 
      @close="isModalOpen = false" 
      @submit="handleAddRepair" 
    />
      </div>
    </header>

    <main v-if="viewMode === 'kanban'" class="kanban-board">
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

    <main v-else class="table-container">
      <table class="repairs-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>ПРИСТРІЙ</th>
            <th>КЛІЄНТ</th>
            <th>НЕСПРАВНІСТЬ</th>
            <th>КОМІРКА</th>
            <th>СТАТУС</th>
            <th>ОЦІНКА</th> <th>ДАТА</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="job in repairsStore.jobs" :key="job.id">
            <td class="text-muted">R00{{ job.id }}</td>
            <td class="font-medium">{{ job.device_name }}</td>
            <td>{{ job.customer_name }}</td>
            <td class="text-truncate" :title="job.description">{{ job.description }}</td>
            <td>
              <span class="storage-pill">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                {{ job.storage_cell }}
              </span>
            </td>
            
            <td>
              <span class="table-status" :class="getTableStatusClass(job.status)">
                {{ formatStatus(job.status) }}
              </span>
            </td>
            <td class="font-medium">
              {{ job.price ? job.price + ' ₴' : '3 500 ₴' }}
            </td>
            <td class="text-muted">{{ formatDateTime(job.created_at) }}</td>
          </tr>
        </tbody>
      </table>
    </main>
  </div>
</template>

<style scoped>
.repairs-view {
  padding: 32px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
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

/* Стилі перемикача */
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

/* Стилі Канбан-дошки */
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

.col-pending { border-top-color: #334155; }
.col-waiting { border-top-color: #f59e0b; }
.col-completed { border-top-color: #3b82f6; }
.col-delivered { border-top-color: #10b981; }

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

/* Стилі Таблиці */
.table-container {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  flex: 1;
}

.repairs-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.repairs-table th {
  text-align: left;
  padding: 16px;
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.repairs-table td {
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
  color: #334155;
  vertical-align: middle;
}

.repairs-table tr:last-child td {
  border-bottom: none;
}

.repairs-table tr:hover {
  background-color: #f8fafc;
}

.text-muted { color: #94a3b8; }
.font-medium { font-weight: 500; color: #1e293b; }

.text-truncate {
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Ідеальна комірка */
.storage-pill {
  background-color: #eff6ff; 
  color: #2563eb;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.table-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid transparent;
  display: inline-block;
}

.status-pending { 
  background: #f8fafc; 
  color: #64748b; 
  border-color: #e2e8f0; 
}

.status-waiting { 
  background: #fffbeb; 
  color: #d97706; 
  border-color: #fde68a; 
}

.status-completed { 
  background: #eff6ff; 
  color: #2563eb; 
  border-color: #bfdbfe; 
}
</style>