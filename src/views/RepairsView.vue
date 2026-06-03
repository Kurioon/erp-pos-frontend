<template>
  <div class="repairs-view">
    <header class="header">
      <div class="header-titles">
        <h1>Ремонти — Service Desk</h1>
        <p class="subtitle">Всього: {{ totalJobs }} · Активних: {{ activeJobs }}</p>
      </div>

      <div class="header-actions">
        <div class="view-toggle">
          <button class="toggle-btn" :class="{ active: viewMode === 'kanban' }" @click="viewMode = 'kanban'">
            Канбан
          </button>
          <button class="toggle-btn" :class="{ active: viewMode === 'table' }" @click="viewMode = 'table'">
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

    <div v-if="repairsStore.isLoading && repairsStore.jobs.length === 0" class="loading-state">
      Завантаження ремонтів...
    </div>

    <transition v-else name="fade-slide" mode="out-in">
      <component :is="currentViewComponent" />
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRepairsStore } from '@/stores/repairs'
import { REPAIR_STATUSES } from '@/constants/repairs'
import BaseButton from '@/components/ui/BaseButton.vue'
import RepairFormModal from '@/components/repairs/RepairFormModal.vue'
import RepairsBoard from '@/components/repairs/RepairsBoard.vue'
import RepairsTable from '@/components/repairs/RepairsTable.vue'

const repairsStore = useRepairsStore()
const viewMode = ref('kanban')
const isModalOpen = ref(false)

onMounted(() => {
  repairsStore.fetchJobs()
})

const totalJobs = computed(() => repairsStore.jobs.length)
const activeJobs = computed(() => {
  return repairsStore.jobs.filter(j =>
    j.status === REPAIR_STATUSES.PENDING || j.status === REPAIR_STATUSES.WAITING_PARTS
  ).length
})

const handleAddRepair = async (formData) => {
  try {
    await repairsStore.createJob(formData)
    isModalOpen.value = false
  } catch (error) {
    console.error('Помилка при створенні:', error)
  }
}

const currentViewComponent = computed(() => {
  return viewMode.value === 'kanban' ? RepairsBoard : RepairsTable
})
</script>

<style scoped>
.repairs-view {
  padding: 32px;
  min-height: 100vh;
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

.loading-state {
  text-align: center;
  padding: 40px;
  color: #94a3b8;
  font-size: 1.1rem;
}

.fade-slide-enter-active, .fade-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-slide-enter-from { opacity: 0; transform: translateX(10px); }
.fade-slide-leave-to { opacity: 0; transform: translateX(-10px); }
</style>
