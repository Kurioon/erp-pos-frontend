<script setup>
import { ref } from 'vue'
import { PURCHASE_STATUSES, PURCHASE_STATUS_LABELS, PURCHASE_STATUS_CLASSES } from '@/constants/purchases'
import { formatCurrency, formatDate } from '@/utils/formatters'

const props = defineProps({
  purchases: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['edit', 'approve'])

const expandedRowId = ref(null)

const toggleRow = (id) => {
  expandedRowId.value = expandedRowId.value === id ? null : id
}

const calculateOrderTotal = (items) => {
  return items.reduce((sum, item) => sum + (item.qty * item.price), 0)
}
</script>

<template>
  <div class="table-container">
    <table class="purchases-table">
      <thead>
        <tr>
          <th style="width: 80px;">№</th>
          <th>ПОСТАЧАЛЬНИК</th>
          <th>ДАТА</th>
          <th>СТАТУС</th>
          <th>СУМА</th>
          <th class="text-right">ДІЇ</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="order in props.purchases" :key="order.id">
          <tr class="main-row" :class="{ 'is-expanded': expandedRowId === order.id }" @click="toggleRow(order.id)">
            <td class="text-muted font-medium">{{ order.id }}</td>
            <td class="font-bold text-dark">{{ order.supplier }}</td>
            <!-- Твоя глобальна утиліта для дати -->
            <td class="text-muted">{{ formatDate(order.date) }}</td>
            <td>
              <span class="status-badge" :class="PURCHASE_STATUS_CLASSES[order.status]">
                {{ PURCHASE_STATUS_LABELS[order.status] }}
              </span>
            </td>
            <td class="font-bold text-dark text-price">
              <!-- Твоя глобальна утиліта для валюти -->
              {{ formatCurrency(calculateOrderTotal(order.items), 'UAH') }}
            </td>
            <td class="text-right actions-cell" @click.stop>
              <div class="actions-wrapper">
                <template v-if="order.status === PURCHASE_STATUSES.DRAFT">
                  <button class="action-btn edit-btn" @click="emit('edit', order)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    Редагувати
                  </button>
                  <button class="action-btn approve-btn" @click="emit('approve', order.id)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    Затвердити
                  </button>
                </template>
                
                <button class="chevron-btn" @click="toggleRow(order.id)">
                  <svg :class="{ 'rotated': expandedRowId === order.id }" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="expandedRowId === order.id" class="expanded-row">
            <td colspan="6" class="expanded-cell">
              <div class="details-container">
                <p class="details-title">ПОЗИЦІЇ ЗАМОВЛЕННЯ</p>
                <table class="details-table">
                  <thead>
                    <tr>
                      <th>Товар</th>
                      <th style="width: 100px;" class="text-center">К-сть</th>
                      <th style="width: 140px;" class="text-right">Ціна</th>
                      <th style="width: 140px;" class="text-right">Сума</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, idx) in order.items" :key="idx">
                      <td class="font-medium text-dark">{{ item.name }}</td>
                      <td class="text-center text-muted">{{ item.qty }} шт</td>
                      <td class="text-right text-muted">{{ formatCurrency(item.price, 'UAH') }}</td>
                      <td class="text-right font-bold text-dark">{{ formatCurrency(item.qty * item.price, 'UAH') }}</td>
                    </tr>
                    <tr class="total-row">
                      <td colspan="3" class="text-right font-medium text-muted">Разом:</td>
                      <td class="text-right font-bold text-dark total-price-val">
                        {{ formatCurrency(calculateOrderTotal(order.items), 'UAH') }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-container { border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: white; }
.purchases-table { width: 100%; border-collapse: collapse; }
.purchases-table th { background-color: #f8fafc; padding: 16px; color: #64748b; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; text-align: left; border-bottom: 1px solid #e2e8f0; letter-spacing: 0.05em; }
.purchases-table td { padding: 18px 16px; border-bottom: 1px solid #e2e8f0; font-size: 0.95rem; vertical-align: middle; }
.main-row { cursor: pointer; transition: background-color 0.2s ease; }
.main-row:hover { background-color: #f8fafc; }
.main-row.is-expanded { background-color: #f1f5f9; }
.text-muted { color: #64748b; }
.text-dark { color: #0f172a; }
.font-medium { font-weight: 500; }
.font-bold { font-weight: 600; }
.text-right { text-align: right; }
.text-center { text-align: center; }
.text-price { font-size: 1.05rem; }
.status-badge { padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; display: inline-block; }
.status-approved { background-color: #dcfce7; color: #166534; }
.status-draft { background-color: #f1f5f9; color: #475569; }
.status-received { background-color: #eff6ff; color: #1e40af; }
.actions-cell { width: 260px; }
.actions-wrapper { display: flex; justify-content: flex-end; align-items: center; gap: 12px; }
.action-btn { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.edit-btn { background: transparent; border: 1px solid #cbd5e1; color: #475569; }
.edit-btn:hover { background-color: #f1f5f9; color: #0f172a; }
.approve-btn { background-color: #2563eb; border: 1px solid #2563eb; color: white; }
.approve-btn:hover { background-color: #1d4ed8; }
.chevron-btn { background: transparent; border: none; color: #94a3b8; cursor: pointer; display: flex; align-items: center; padding: 4px; }
.chevron-btn svg { transition: transform 0.2s ease; }
.chevron-btn svg.rotated { transform: rotate(180deg); color: #0f172a; }
.expanded-row { background-color: #ffffff; }
.expanded-cell { padding: 0 !important; }
.details-container { padding: 24px 32px; background-color: #fafafa; border-bottom: 1px solid #e2e8f0; }
.details-title { font-size: 0.75rem; font-weight: 700; color: #94a3b8; letter-spacing: 0.05em; margin: 0 0 16px 0; }
.details-table { width: 100%; border-collapse: collapse; background: white; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
.details-table th { background-color: #f8fafc; padding: 12px 16px; font-size: 0.75rem; color: #64748b; border-bottom: 1px solid #e2e8f0; }
.details-table td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; }
.details-table tr:last-child td { border-bottom: none; }
.total-row { background-color: #f8fafc; }
.total-price-val { font-size: 1.1rem; color: #2563eb !important; }
</style>