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

        <BaseButton @click="openCreateModal">+ Новий ремонт</BaseButton>

        <RepairFormModal
          v-if="isModalOpen"
          :edit-mode="isEditMode"
          :job-data="selectedJob"
          @close="isModalOpen = false"
          @submit="handleSaveRepair"
        />
      </div>
    </header>

    <transition name="fade">
      <div v-if="viewMode === 'table'" class="filters-section">
        <BaseInput
          v-model="filters.search"
          placeholder="Пошук (телефон, пристрій)..."
          @keyup.enter="applyFilters"
          class="filter-item filter-search"
        />
        <BaseSelect
          v-model="filters.status"
          :options="statusOptions"
          placeholder="Всі статуси"
          @update:modelValue="applyFilters"
          class="filter-item filter-select"
        />
        <BaseInput
          v-model="filters.storage_cell"
          placeholder="Комірка (напр. R1)"
          @keyup.enter="applyFilters"
          class="filter-item filter-cell"
        />
        <BaseSelect
          v-model="filters.ordering"
          :options="orderingOptions"
          @update:modelValue="applyFilters"
          class="filter-item filter-select"
        />
        <BaseButton variant="secondary" @click="resetFilters" class="reset-btn">
          Скинути
        </BaseButton>
      </div>
    </transition>

    <div v-if="repairsStore.isLoading && repairsStore.jobs.length === 0" class="loading-state">
      Завантаження ремонтів...
    </div>

    <transition v-else name="fade-slide" mode="out-in">
      <component :is="currentViewComponent" @edit="openEditModal" />
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRepairsStore } from '@/stores/repairs'
import { REPAIR_STATUSES, REPAIR_STATUS_LABELS } from '@/constants/repairs'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import RepairFormModal from '@/components/repairs/RepairFormModal.vue'
import RepairsBoard from '@/components/repairs/RepairsBoard.vue'
import RepairsTable from '@/components/repairs/RepairsTable.vue'

const repairsStore = useRepairsStore()
const viewMode = ref('kanban')

const isModalOpen = ref(false)
const isEditMode = ref(false)
const selectedJob = ref(null)

const filters = ref({
  search: '',
  status: '',
  storage_cell: '',
  ordering: '-created_at'
})

const statusOptions = [
  { value: '', label: 'Всі статуси' },
  ...Object.entries(REPAIR_STATUS_LABELS).map(([value, label]) => ({
    value,
    label
  }))
]

const orderingOptions = [
  { value: '-created_at', label: 'Спочатку нові' },
  { value: 'created_at', label: 'Спочатку старі' }
]

const applyFilters = () => {
  repairsStore.fetchJobs(1, filters.value)
}

const resetFilters = () => {
  filters.value = { search: '', status: '', storage_cell: '', ordering: '-created_at' }
  applyFilters()
}

onMounted(() => {
  applyFilters()
})

const totalJobs = computed(() => repairsStore.jobs.length)
const activeJobs = computed(() => {
  return repairsStore.jobs.filter(j =>
    j.status === REPAIR_STATUSES.PENDING ||
    j.status === REPAIR_STATUSES.WAITING_PARTS ||
    j.status === REPAIR_STATUSES.REPAIRED
  ).length
})

const openCreateModal = () => {
  isEditMode.value = false
  selectedJob.value = null
  isModalOpen.value = true
}

const openEditModal = (job) => {
  isEditMode.value = true
  selectedJob.value = job
  isModalOpen.value = true
}

const handleSaveRepair = async (formData) => {
  try {
    if (isEditMode.value) {
      await repairsStore.updateJob(selectedJob.value.id, formData)
    } else {
      await repairsStore.createJob(formData)
    }
    isModalOpen.value = false
    applyFilters()
  } catch (error) {
    console.error('Помилка при збереженні:', error)
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
  max-width: 100vw;
  overflow-x: hidden;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
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
  flex-wrap: wrap;
}

.filters-section {
  display: flex;
  gap: 12px;
  align-items: center;
  background: #f8fafc;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  margin-bottom: 32px;
  flex-wrap: nowrap;

  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.filter-item :deep(div) { margin-bottom: 0 !important; }
.filter-item { margin-bottom: 0 !important; }

.filter-search { flex: 0 0 220px; }
.filter-select { flex: 0 0 160px; }
.filter-cell { flex: 0 0 120px; }

.reset-btn {
  flex-shrink: 0;
  height: 42px;
  display: flex;
  align-items: center;
  white-space: nowrap;
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

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-5px); }
.fade-slide-enter-active, .fade-slide-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-slide-enter-from { opacity: 0; transform: translateX(10px); }
.fade-slide-leave-to { opacity: 0; transform: translateX(-10px); }

@media (max-width: 768px) {
  .repairs-view { padding: 16px; }
}
</style>
