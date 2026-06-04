<template>
  <BaseModal :is-open="isOpen" @close="$emit('close')" title="Деталі ремонту">
    <div v-if="job" class="details-container">

      <div class="detail-section">
        <h4 class="section-title">Інформація про клієнта</h4>
        <div class="detail-row"><span>Ім'я:</span> <b>{{ job.customer_name }}</b></div>
        <div class="detail-row"><span>Телефон:</span> <b>{{ job.customer_phone || '—' }}</b></div>
      </div>

      <div class="detail-section">
        <h4 class="section-title">Пристрій та несправність</h4>
        <div class="detail-row"><span>Пристрій:</span> <b>{{ job.device_name }}</b></div>

        <div class="description-block">
          <span class="description-label">Опис проблеми:</span>
          <p class="description-text">{{ job.description }}</p>
        </div>

        <div class="description-block" v-if="job.comment">
          <span class="description-label">Коментар майстра:</span>
          <p class="description-text comment-bg">{{ job.comment }}</p>
        </div>
      </div>

      <div class="detail-section">
        <h4 class="section-title">Статус та локація</h4>
        <div class="detail-row align-center">
          <span>Поточний статус:</span>

          <div class="status-select-wrapper">
            <span v-if="isUpdating" class="updating-text">Оновлюємо...</span>
            <BaseSelect
              v-else
              :model-value="job.status"
              @update:model-value="changeStatus"
              :options="statusOptions"
              :disabled="isUpdating"
            />
          </div>

        </div>
        <div class="detail-row">
          <span>Комірка зберігання:</span>
          <span class="storage-badge">{{ job.storage_cell || '—' }}</span>
        </div>
      </div>

      <div class="detail-section">
        <h4 class="section-title">Хронологія</h4>
        <div class="detail-row"><span>Створено:</span> <b>{{ formatDate(job.created_at) }}</b></div>
        <div class="detail-row" v-if="job.updated_at"><span>Останнє оновлення:</span> <b>{{ formatDate(job.updated_at) }}</b></div>
      </div>

      <div class="modal-actions">
        <BaseButton variant="secondary" @click="$emit('close')">Закрити</BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRepairsStore } from '@/stores/repairs'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import { REPAIR_STATUSES, REPAIR_STATUS_LABELS } from '@/constants/repairs'
import { formatDate } from '@/utils/formatters'

const props = defineProps({
  isOpen: Boolean,
  job: Object
})

defineEmits(['close'])
const repairsStore = useRepairsStore()
const isUpdating = ref(false)

const statusOptions = computed(() => {
  return Object.values(REPAIR_STATUSES).map(status => ({
    value: status,
    label: REPAIR_STATUS_LABELS[status]
  }))
})

const changeStatus = async (newStatus) => {
  if (newStatus === props.job.status) return

  isUpdating.value = true
  await repairsStore.updateJobStatus(props.job.id, newStatus)
  isUpdating.value = false

}
</script>

<style scoped>
.details-container { display: flex; flex-direction: column; gap: 20px; }
.detail-section { display: flex; flex-direction: column; gap: 8px; background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; }
.section-title { margin: 0 0 4px 0; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 700; }
.detail-row { display: flex; justify-content: space-between; align-items: flex-start; font-size: 0.95rem; color: #334155; gap: 16px; }
.align-center { align-items: center; }

.detail-row span:first-child { color: #64748b; white-space: nowrap; }
.detail-row b { color: #0f172a; text-align: right; font-weight: 600; }

.description-block { margin-top: 8px; display: flex; flex-direction: column; gap: 6px; }
.description-label { color: #64748b; font-size: 0.85rem; }
.description-text { background-color: #ffffff; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; margin: 0; font-size: 0.95rem; color: #334155; line-height: 1.5; white-space: pre-wrap; }
.comment-bg { background-color: #fffbeb; border-color: #fde68a; }

.status-select-wrapper { width: 220px; text-align: right; }
.updating-text { font-size: 0.85rem; color: #2563eb; font-weight: 600; animation: pulse 1.5s infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

.storage-badge { background-color: #eff6ff; color: #2563eb; padding: 4px 10px; border-radius: 6px; font-size: 0.85rem; font-weight: 700; border: 1px solid #bfdbfe; }
.modal-actions { display: flex; justify-content: flex-end; align-items: center; margin-top: 8px; }
</style>
