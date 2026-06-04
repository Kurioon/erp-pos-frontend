<template>
  <div class="table-container shadow-premium mobile-table-wrapper">
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
          <th class="text-right" style="min-width: 100px;">ДІЇ</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="job in repairsStore.jobs"
          :key="job.id"
          class="table-row-hover cursor-pointer"
          @click="openDetails(job)"
        >
          <td class="text-muted font-medium">R00{{ job.id }}</td>
          <td class="font-bold text-dark">{{ job.device_name }}</td>
          <td>{{ job.customer_name }}</td>
          <td class="text-truncate" :title="job.description">{{ job.description }}</td>
          <td>
            <span class="storage-pill">
              <IconLocation />
              {{ job.storage_cell || '—' }}
            </span>
          </td>
          <td>
            <BaseStatusBadge :class="REPAIR_STATUS_CLASSES[job.status] || 'type-neutral'">
              {{ REPAIR_STATUS_LABELS[job.status] || job.status }}
            </BaseStatusBadge>
          </td>
          <td class="font-medium">
            {{ formatCurrency(job.price || 0, 'UAH') }}
          </td>
          <td class="text-muted">{{ formatDate(job.created_at || new Date()) }}</td>

          <td class="text-right actions-cell" @click.stop>
            <div class="actions-wrapper">
              <button class="icon-btn edit" @click.stop="emit('edit', job)" title="Редагувати">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
              </button>
              <button class="icon-btn delete" @click.stop="handleDelete(job.id)" title="Видалити">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <RepairDetailsModal
      v-if="isDetailsOpen"
      :is-open="isDetailsOpen"
      :job="selectedJob"
      @close="isDetailsOpen = false"
      @edit="handleEditFromModal"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRepairsStore } from '@/stores/repairs'
import { REPAIR_STATUS_LABELS, REPAIR_STATUS_CLASSES } from '@/constants/repairs'
import { formatCurrency, formatDate } from '@/utils/formatters'
import IconLocation from '@/components/icons/IconLocation.vue'
import BaseStatusBadge from '@/components/ui/BaseStatusBadge.vue'
import RepairDetailsModal from '@/components/repairs/RepairDetailsModal.vue'

const repairsStore = useRepairsStore()
const emit = defineEmits(['edit'])
const selectedJob = ref(null)
const isDetailsOpen = ref(false)

const openDetails = (job) => {
  selectedJob.value = job
  isDetailsOpen.value = true
}

const handleDelete = async (id) => {
  if (confirm('Видалити цей ремонт?')) {
    await repairsStore.deleteJob(id)
  }
}

const handleEditFromModal = (job) => {
  isDetailsOpen.value = false
  emit('edit', job)
}
</script>

<style scoped>
.mobile-table-wrapper {
  width: 100%;
  display: block !important;
  overflow-x: auto !important;
  -webkit-overflow-scrolling: touch;
}

.table-container { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; flex: 1; }
.shadow-premium { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 20px 25px -5px rgba(0, 0, 0, 0.03); }

.repairs-table { width: 100%; border-collapse: collapse; font-size: 0.95rem; min-width: 1050px; }

.repairs-table th { text-align: left; padding: 16px; color: #64748b; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; background: #f8fafc; letter-spacing: 0.05em; }
.repairs-table td { padding: 16px; border-bottom: 1px solid #e2e8f0; color: #334155; vertical-align: middle; }
.table-row-hover { transition: all 0.2s ease; }
.table-row-hover:hover { background-color: #f8fafc; }
.table-row-hover:hover td { color: #2563eb; }
.table-row-hover:hover .text-muted, .table-row-hover:hover .text-dark { color: #2563eb; }
.table-row-hover:active { background-color: #eff6ff; }

.repairs-table tr:last-child td { border-bottom: none; }

.cursor-pointer { cursor: pointer; }
.text-muted { color: #94a3b8; }
.text-dark { color: #0f172a; }
.font-medium { font-weight: 500; }
.font-bold { font-weight: 600; }
.text-truncate { max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.storage-pill { background-color: #eff6ff; color: #2563eb; padding: 4px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; }

.actions-cell { width: 100px; padding-right: 20px !important; }
.actions-wrapper { display: flex; justify-content: flex-end; gap: 8px; }
.icon-btn { background: transparent; border: 1px solid #cbd5e1; width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; color: #64748b; }
.icon-btn.edit:hover { background: #eff6ff; border-color: #2563eb; color: #2563eb; }
.icon-btn.delete:hover { background: #fef2f2; border-color: #ef4444; color: #ef4444; }

.status-pending { background: #f1f5f9; color: #475569; border-color: #e2e8f0; }
.status-waiting { background: #fffbeb; color: #d97706; border-color: #fde68a; }
.status-completed { background: #eff6ff; color: #2563eb; border-color: #bfdbfe; }
.status-delivered { background: #dcfce7; color: #166534; border-color: #bbf7d0; }
</style>
