<script setup>
import { useRepairsStore } from '@/stores/repairs'
import { REPAIR_STATUS_LABELS, REPAIR_STATUS_CLASSES } from '@/constants/repairs'
import { formatCurrency, formatDate } from '@/utils/formatters' // Твої утиліти
import IconLocation from '@/components/icons/IconLocation.vue'

const repairsStore = useRepairsStore()
</script>

<template>
  <div class="table-container">
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
              <IconLocation />
              {{ job.storage_cell || '—' }}
            </span>
          </td>
          <td>
            <span class="table-status" :class="REPAIR_STATUS_CLASSES[job.status] || 'status-pending'">
              {{ REPAIR_STATUS_LABELS[job.status] || job.status }}
            </span>
          </td>
          <td class="font-medium">
            {{ formatCurrency(job.price || 3500, 'UAH') }}
          </td>
          <td class="text-muted">{{ formatDate(job.created_at) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-container { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; flex: 1; }
.repairs-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
.repairs-table th { text-align: left; padding: 16px; color: #64748b; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; background: #f8fafc; }
.repairs-table td { padding: 16px; border-bottom: 1px solid #e2e8f0; color: #334155; vertical-align: middle; }
.repairs-table tr:last-child td { border-bottom: none; }
.repairs-table tr:hover { background-color: #f8fafc; }
.text-muted { color: #94a3b8; }
.font-medium { font-weight: 500; color: #1e293b; }
.text-truncate { max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.storage-pill { background-color: #eff6ff; color: #2563eb; padding: 4px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; }
.table-status { padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 500; border: 1px solid transparent; display: inline-block; }
.status-pending { background: #f1f5f9; color: #475569; border-color: #e2e8f0; }
.status-waiting { background: #fffbeb; color: #d97706; border-color: #fde68a; }
.status-completed { background: #eff6ff; color: #2563eb; border-color: #bfdbfe; }
.status-delivered { background: #dcfce7; color: #166534; border-color: #bbf7d0; }
</style>