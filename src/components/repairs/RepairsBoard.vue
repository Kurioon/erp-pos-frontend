<script setup>
import { ref, computed } from 'vue'
import { useRepairsStore } from '@/stores/repairs'
import { REPAIR_STATUSES } from '@/constants/repairs'
import RepairCard from '@/components/repairs/RepairCard.vue'

const repairsStore = useRepairsStore()
const showFullArchive = ref(false)

const handleDragStart = (event, jobId) => {
  event.dataTransfer.setData('text/plain', jobId)
  event.dataTransfer.effectAllowed = 'move'
}

const handleDrop = async (event, newStatus) => {
  const jobId = parseInt(event.dataTransfer.getData('text/plain'), 10)
  await repairsStore.updateJobStatus(jobId, newStatus)
}


const pendingJobs = computed(() => repairsStore.jobs.filter(j => j.status === REPAIR_STATUSES.PENDING))
const waitingJobs = computed(() => repairsStore.jobs.filter(j => j.status === REPAIR_STATUSES.WAITING_PARTS))
const completedJobs = computed(() => repairsStore.jobs.filter(j => j.status === REPAIR_STATUSES.REPAIRED))

const deliveredJobs = computed(() => {
  const allDelivered = repairsStore.jobs.filter(j => j.status === REPAIR_STATUSES.DELIVERED)
  return showFullArchive.value ? allDelivered : allDelivered.slice(0, 5)
})

const archivedCount = computed(() => {
  const totalDelivered = repairsStore.jobs.filter(j => j.status === REPAIR_STATUSES.DELIVERED).length
  return totalDelivered > 5 ? totalDelivered - 5 : 0
})
</script>

<template>
  <div class="kanban-board">
    <div class="kanban-column col-pending" @dragover.prevent @drop="handleDrop($event, REPAIR_STATUSES.PENDING)">
      <div class="column-header">
        <h2 class="column-title">Прийнято</h2>
        <span class="counter">{{ pendingJobs.length }}</span>
      </div>
      <div class="kanban-cards">
        <div v-for="item in pendingJobs" :key="item.id" class="draggable-card-wrapper" draggable="true" @dragstart="handleDragStart($event, item.id)">
          <RepairCard :job="item" />
        </div>
      </div>
    </div>

    <div class="kanban-column col-waiting" @dragover.prevent @drop="handleDrop($event, REPAIR_STATUSES.WAITING_PARTS)">
      <div class="column-header">
        <h2 class="column-title">Очікування запчастин</h2>
        <span class="counter">{{ waitingJobs.length }}</span>
      </div>
      <div class="kanban-cards">
        <div v-for="item in waitingJobs" :key="item.id" class="draggable-card-wrapper" draggable="true" @dragstart="handleDragStart($event, item.id)">
          <RepairCard :job="item" />
        </div>
      </div>
    </div>

    <div class="kanban-column col-completed" @dragover.prevent @drop="handleDrop($event, REPAIR_STATUSES.REPAIRED)">
      <div class="column-header">
        <h2 class="column-title">Відремонтовано</h2>
        <span class="counter">{{ completedJobs.length }}</span>
      </div>
      <div class="kanban-cards">
        <div v-for="item in completedJobs" :key="item.id" class="draggable-card-wrapper" draggable="true" @dragstart="handleDragStart($event, item.id)">
          <RepairCard :job="item" />
        </div>
      </div>
    </div>

    <div class="kanban-column col-delivered" @dragover.prevent @drop="handleDrop($event, REPAIR_STATUSES.DELIVERED)">
      <div class="column-header">
        <h2 class="column-title">Видано</h2>
        <span class="counter">{{ repairsStore.jobs.filter(j => j.status === REPAIR_STATUSES.DELIVERED).length }}</span>
      </div>
      <div class="kanban-cards">
        <div v-for="item in deliveredJobs" :key="item.id" class="draggable-card-wrapper" draggable="true" @dragstart="handleDragStart($event, item.id)">
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
  </div>
</template>

<style scoped>
.kanban-board { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; align-items: start; flex: 1; overflow-x: auto; padding-bottom: 20px; }
.kanban-column { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; border-top: 4px solid transparent; min-width: 260px; min-height: 550px; }
.col-pending { border-top-color: #475569; }
.col-waiting { border-top-color: #f59e0b; }
.col-completed { border-top-color: #3b82f6; }
.col-delivered { border-top-color: #10b981; }
.column-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 12px; }
.column-title { font-size: 0.95rem; font-weight: 700; color: #0f172a; margin: 0; }
.counter { background-color: #e2e8f0; color: #475569; padding: 2px 8px; border-radius: 999px; font-size: 0.8rem; font-weight: 600; }
.kanban-cards { display: flex; flex-direction: column; gap: 12px; flex: 1; }
.draggable-card-wrapper { cursor: grab; transition: transform 0.15s ease; }
.draggable-card-wrapper:active { cursor: grabbing; transform: scale(0.98); }
.archive-zone { display: flex; justify-content: center; padding-top: 8px; }
.archive-toggle-btn { background: transparent; border: none; color: #64748b; font-size: 0.85rem; font-weight: 600; cursor: pointer; padding: 8px 16px; border-radius: 8px; transition: all 0.2s ease; width: 100%; text-align: center; border: 1px dashed #cbd5e1; }
.archive-toggle-btn:hover { background-color: #f1f5f9; color: #0f172a; border-color: #94a3b8; }
</style>