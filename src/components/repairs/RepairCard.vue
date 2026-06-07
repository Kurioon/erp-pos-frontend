<template>
  <div
    class="repair-card"
    tabindex="0"
    role="button"
    aria-label="Картка ремонту"
    @keydown.enter.prevent="$emit('click')"
    @keydown.space.prevent="$emit('click')"
    @click="$emit('click')"
  >
    <div class="card-header">
      <span class="job-id">R00{{ job.id }}</span>
      <span class="storage-pill">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        {{ job.storage_cell }}
      </span>
    </div>

    <div class="card-body">
      <h3 class="device-name">{{ job.device_name }}</h3>
      <p class="description">{{ job.description }}</p>

      <div class="customer-info">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        <a v-if="job.counterparty" href="#" @click.stop="openDrawer(job.counterparty)" class="text-link">{{ job.customer_name }}</a>
        <span v-else>{{ job.customer_name }}</span>
      </div>
      <div class="date-info">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        <span>{{ formatDate(job.created_at) }}</span>
      </div>
      
      <div class="payment-info" v-if="job.price > 0">
        <span class="payment-pill" :class="getPaymentClass(job.payment_status)">
          {{ getPaymentLabel(job.payment_status) }} 
          <span v-if="job.payment_status === 'partial'">({{ job.paid_amount }} / {{ job.price }})</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatDate } from '@/utils/formatters'
import { useCounterpartiesStore } from '@/stores/counterparties'

defineProps({
  job: {
    type: Object,
    required: true
  }
})

const counterpartiesStore = useCounterpartiesStore()
const openDrawer = (id) => counterpartiesStore.openGlobalDrawer(id)

const getPaymentLabel = (status) => {
  switch (status) {
    case 'paid': return 'Оплачено'
    case 'partial': return 'Частково'
    default: return 'Не оплачено'
  }
}

const getPaymentClass = (status) => {
  switch (status) {
    case 'paid': return 'payment-paid'
    case 'partial': return 'payment-partial'
    default: return 'payment-unpaid'
  }
}
</script>

<style scoped>
.repair-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); transition: transform 0.2s ease, box-shadow 0.2s ease; cursor: pointer; }
.repair-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.job-id { font-size: 0.8rem; color: #94a3b8; font-weight: 500; }
.storage-pill { color: #3b82f6; border: 1px solid #bfdbfe; padding: 2px 8px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; }
.device-name { font-weight: 600; font-size: 1rem; color: #1e293b; margin: 0 0 4px 0; }
.description { color: #64748b; font-size: 0.85rem; margin: 0 0 12px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.customer-info, .date-info { display: flex; align-items: center; gap: 6px; color: #64748b; font-size: 0.8rem; margin-bottom: 4px; }
.repair-card:focus-visible { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1); transform: translateY(-2px); }

.payment-info { margin-top: 8px; padding-top: 8px; border-top: 1px dashed #e2e8f0; display: flex; align-items: center; justify-content: space-between; }
.payment-pill { font-size: 0.75rem; padding: 2px 8px; border-radius: 999px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; }
.payment-paid { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
.payment-partial { background: #fef9c3; color: #854d0e; border: 1px solid #fef08a; }
.payment-unpaid { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
</style>
