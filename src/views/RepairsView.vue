<script setup>
import { ref, computed } from 'vue'
import { useRepairsStore } from '@/stores/repairs'
import BaseButton from '@/components/ui/BaseButton.vue'
import RepairCard from '@/components/repairs/RepairCard.vue'
import RepairFormModal from '@/components/repairs/RepairFormModal.vue'

// ІМПОРТ КОНСТАНТ (Архітектурна база від Брили)
import { REPAIR_STATUSES, REPAIR_STATUS_LABELS, REPAIR_STATUS_CLASSES } from '@/constants/repairs'

const repairsStore = useRepairsStore()
const viewMode = ref('kanban')
const isModalOpen = ref(false) 

// Стан відображення архіву в колонці "Видано"
const showFullArchive = ref(false)

const handleAddRepair = (formData) => {
  console.log('Сабміт форми пішов! Дані:', formData)
  const newId = repairsStore.jobs.length ? Math.max(...repairsStore.jobs.map(j => j.id)) + 1 : 1
  
  const newRepair = {
    id: newId,
    ...formData,
    status: REPAIR_STATUSES.PENDING,
    created_at: new Date().toISOString()
  }
  repairsStore.jobs = [newRepair, ...repairsStore.jobs] 
  isModalOpen.value = false
}

// --- ЛОГІКА HTML5 DRAG AND DROP ---
const handleDragStart = (event, jobId) => {
  event.dataTransfer.setData('text/plain', jobId)
  event.dataTransfer.effectAllowed = 'move'
}

const handleDrop = (event, newStatus) => {
  const jobId = parseInt(event.dataTransfer.getData('text/plain'), 10)
  const job = repairsStore.jobs.find(j => j.id === jobId)
  if (job) {
    job.status = newStatus
  }
}

// Фільтрація карток для Канбану за константами
const pendingJobs = computed(() => repairsStore.jobs.filter(j => j.status === REPAIR_STATUSES.PENDING))
const waitingJobs = computed(() => repairsStore.jobs.filter(j => j.status === REPAIR_STATUSES.WAITING_PARTS))
const completedJobs = computed(() => repairsStore.jobs.filter(j => j.status === REPAIR_STATUSES.REPAIRED))

// Розумне обмеження колонки "Видано" (Показуємо максимум 5 свіжих, або все, якщо відкритий архів)
const deliveredJobs = computed(() => {
  const allDelivered = repairsStore.jobs.filter(j => j.status === REPAIR_STATUSES.DELIVERED)
  if (showFullArchive.value) {
    return allDelivered
  }
  return allDelivered.slice(0, 5)
})

// Лічильник схованих в архів карток
const archivedCount = computed(() => {
  const totalDelivered = repairsStore.jobs.filter(j => j.status === REPAIR_STATUSES.DELIVERED).length
  return totalDelivered > 5 ? totalDelivered - 5 : 0
})

const totalJobs = computed(() => repairsStore.jobs.length)
const activeJobs = computed(() => pendingJobs.value.length + waitingJobs.value.length)

// Форматування через об'єкти констант
const formatStatus = (status) => {
  return REPAIR_STATUS_LABELS[status] || status
}

const getTableStatusClass = (status) => {
  return REPAIR_STATUS_CLASSES[status] || 'status-pending'
}

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
      
      <div 
        class="kanban-column col-pending"
        @dragover.prevent
        @drop="handleDrop($event, REPAIR_STATUSES.PENDING)"
      >
        <div class="column-header">
          <h2 class="column-title">Прийнято</h2>
          <span class="counter">{{ pendingJobs.length }}</span>
        </div>
        <div class="kanban-cards">
          <div 
            v-for="item in pendingJobs" 
            :key="item.id"
            class="draggable-card-wrapper"
            draggable="true"
            @dragstart="handleDragStart($event, item.id)"
          >
            <RepairCard :job="item" />
          </div>
        </div>
      </div>

      <div 
        class="kanban-column col-waiting"
        @dragover.prevent
        @drop="handleDrop($event, REPAIR_STATUSES.WAITING_PARTS)"
      >
        <div class="column-header">
          <h2 class="column-title">Очікування запчастин</h2>
          <span class="counter">{{ waitingJobs.length }}</span>
        </div>
        <div class="kanban-cards">
          <div 
            v-for="item in waitingJobs" 
            :key="item.id"
            class="draggable-card-wrapper"
            draggable="true"
            @dragstart="handleDragStart($event, item.id)"
          >
            <RepairCard :job="item" />
          </div>
        </div>
      </div>

      <div 
        class="kanban-column col-completed"
        @dragover.prevent
        @drop="handleDrop($event, REPAIR_STATUSES.REPAIRED)"
      >
        <div class="column-header">
          <h2 class="column-title">Відремонтовано</h2>
          <span class="counter">{{ completedJobs.length }}</span>
        </div>
        <div class="kanban-cards">
          <div 
            v-for="item in completedJobs" 
            :key="item.id"
            class="draggable-card-wrapper"
            draggable="true"
            @dragstart="handleDragStart($event, item.id)"
          >
            <RepairCard :job="item" />
          </div>
        </div>
      </div>

      <div 
        class="kanban-column col-delivered"
        @dragover.prevent
        @drop="handleDrop($event, REPAIR_STATUSES.DELIVERED)"
      >
        <div class="column-header">
          <h2 class="column-title">Видано</h2>
          <span class="counter">{{ repairsStore.jobs.filter(j => j.status === REPAIR_STATUSES.DELIVERED).length }}</span>
        </div>
        <div class="kanban-cards">
          <div 
            v-for="item in deliveredJobs" 
            :key="item.id"
            class="draggable-card-wrapper"
            draggable="true"
            @dragstart="handleDragStart($event, item.id)"
          >
            <RepairCard :job="item" />
          </div>

          <div v-if="archivedCount > 0 || showFullArchive" class="archive-zone">
            <button class="archive-toggle-btn" @click="showFullArchive = !showFullArchive">
              <span v-if="!showFullArchive">▼ Показати архів (+{{ archivedCount }})</span>
              <span v-else>▲ Сховати архівні</span>
            </button>
          </div>
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
            <th>ОЦІНКА</th> 
            <th>ДАТА</th>
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
  font-weight: 700;
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

/* --- КАНБАН СІТКА --- */
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
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  border-top: 4px solid transparent; 
  min-width: 260px;
  min-height: 550px; /* Велика область для зручного Drop */
}

.col-pending { border-top-color: #475569; }
.col-waiting { border-top-color: #f59e0b; }
.col-completed { border-top-color: #3b82f6; }
.col-delivered { border-top-color: #10b981; }

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
}

.column-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.counter {
  background-color: #e2e8f0;
  color: #475569;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
}

.kanban-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.draggable-card-wrapper {
  cursor: grab;
  transition: transform 0.15s ease;
}

.draggable-card-wrapper:active {
  cursor: grabbing;
  transform: scale(0.98);
}

/* --- ЗОНА АРХІВУВАННЯ --- */
.archive-zone {
  display: flex;
  justify-content: center;
  padding-top: 8px;
}

.archive-toggle-btn {
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
  width: 100%;
  text-align: center;
  border: 1px dashed #cbd5e1;
}

.archive-toggle-btn:hover {
  background-color: #f1f5f9;
  color: #0f172a;
  border-color: #94a3b8;
}

/* --- ТАБЛИЦЯ --- */
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
  background: #f1f5f9; 
  color: #475569; 
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

.status-delivered {
  background: #dcfce7;
  color: #166534;
  border-color: #bbf7d0;
}
</style>