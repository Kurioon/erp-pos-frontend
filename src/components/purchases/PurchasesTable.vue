<template>
  <div class="table-container">
    <table class="purchases-table">
      <thead>
        <tr>
          <th style="width: 80px;">№ ID</th>
          <th>ПОСТАЧАЛЬНИК</th>
          <th>ДАТА</th>
          <th>СТАТУС</th>
          <th>СУМА</th>
          <th class="text-right">ДІЇ</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="order in props.purchases" :key="order.id">
          <tr v-if="order" class="main-row" :class="{ 'is-expanded': expandedRowId === order.id }" @click="toggleRow(order.id)">
            <td class="text-muted font-medium">{{ order.id }}</td>
            <td class="font-bold text-dark">
              <a v-if="order.counterparty" href="#" @click.stop="openDrawer(order.counterparty)" class="text-link">
                {{ order.supplier || 'Не вказано' }}
              </a>
              <span v-else>{{ order.supplier || 'Не вказано' }}</span>
            </td>
            <td class="text-muted">{{ order.date ? formatDate(order.date) : '—' }}</td>
            <td>
              <span class="status-badge" :class="resolveStatusClass(order.status)">
                {{ resolveStatusLabel(order.status) }}
              </span>
            </td>
            <td class="font-bold text-dark text-price">
              {{ formatCurrency(getOrderTotal(order.id) || 0, 'UAH') }}
            </td>
            <td class="text-right actions-cell" @click.stop>
              <div class="actions-wrapper">
                <template v-if="['draft', 'чернетка'].includes(String(order.status).toLowerCase())">
                  <button class="action-btn edit-btn" @click="emit('edit', order)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    Редаг.
                  </button>
                  <button 
                    class="action-btn approve-btn" 
                    @click="emit('approve', order.id)"
                    :disabled="!order.items || order.items.length === 0"
                    :title="(!order.items || order.items.length === 0) ? 'Неможливо оприходувати порожню чернетку' : ''"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    Затв.
                  </button>
                </template>

                <button class="chevron-btn" @click="toggleRow(order.id)">
                  <svg :class="{ 'rotated': expandedRowId === order.id }" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="expandedRowId === order.id && order.items" class="expanded-row">
            <td colspan="6" class="expanded-cell">
              <div class="details-container">
                <p class="details-title">ПОЗИЦІЇ ЗАМОВЛЕННЯ</p>
                <table v-if="order.items && order.items.length > 0" class="details-table">
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
                      <td class="font-medium text-dark">{{ item.name || 'Невідомий товар' }}</td>
                      <td class="text-center text-muted">{{ item.qty || 0 }} шт</td>
                      <td class="text-right text-muted">{{ formatCurrency(item.price || 0, 'UAH') }}</td>
                      <td class="text-right font-bold text-dark">{{ formatCurrency(((item.qty || 0) * (item.price || 0)) || 0, 'UAH') }}</td>
                    </tr>
                    <tr class="total-row">
                      <td colspan="3" class="text-right font-medium text-muted">Разом:</td>
                      <td class="text-right font-bold text-dark total-price-val">
                        {{ formatCurrency(getOrderTotal(order.id) || 0, 'UAH') }}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div v-else class="empty-items-msg">Немає позицій у замовленні</div>
                
                <!-- Отладка: показуємо розбіжність, якщо вона існує -->
                <div v-if="getDiscrepancyInfo(order).hasDiscrepancy" class="discrepancy-warning">
                  <strong> Увага:</strong> Розбіжність у сумі замовлення!
                  <br>API передав: {{ formatCurrency(getDiscrepancyInfo(order).apiTotal, 'UAH') }}
                  <br>Вичислено з товарів: {{ formatCurrency(getDiscrepancyInfo(order).calcTotal, 'UAH') }}
                  <br>Різниця: {{ formatCurrency(getDiscrepancyInfo(order).discrepancy, 'UAH') }}
                </div>
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { PURCHASE_STATUS_LABELS } from '@/constants/purchases'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { useCounterpartiesStore } from '@/stores/counterparties'

const props = defineProps({
  purchases: {
    type: Array,
    required: true
  }
})

const counterpartiesStore = useCounterpartiesStore()
const emit = defineEmits(['edit', 'approve'])
const expandedRowId = ref(null)

const openDrawer = (id) => {
  counterpartiesStore.openGlobalDrawer(id)
}

// Кешуємо обчислену суму для кожного замовлення
const orderTotalsCache = computed(() => {
  const cache = {}
  props.purchases.forEach(order => {
    cache[order.id] = calculateOrderTotal(order.items)
  })
  return cache
})

// Функція для отримання обчисленої суми замовлення
const getOrderTotal = (orderId) => {
  return orderTotalsCache.value[orderId] || 0
}

const toggleRow = (id) => {
  expandedRowId.value = expandedRowId.value === id ? null : id
}

const resolveStatusClass = (status) => {
  const s = String(status).toLowerCase()
  if (s.includes('partial')) return 'status-waiting'
  if (s.includes('approved') || s.includes('paid')) return 'status-approved'
  return 'status-draft'
}

const resolveStatusLabel = (status) => {
  return PURCHASE_STATUS_LABELS[status] || status || 'Невідомо'
}

// Функция для вычисления суммы из items
const calculateOrderTotal = (items) => {
  return (items || []).reduce((sum, item) => {
    return sum + (Number(item.qty || 0) * Number(item.price || 0))
  }, 0)
}

// Функция для обнаружения расхождений между API и вычисленной суммой
const getDiscrepancyInfo = (order) => {
  const apiTotal = Number(order.total_amount || 0)
  const calcTotal = calculateOrderTotal(order.items)
  const discrepancy = Math.abs(apiTotal - calcTotal)
  
  if (discrepancy > 0.01) { // Допуск на погрешность ±0,01
    console.warn(` Розбіжність у замовленні #${order.id}: API=${apiTotal}, вичислено=${calcTotal}, різниця=${discrepancy}`)
    return { hasDiscrepancy: true, discrepancy, apiTotal, calcTotal }
  }
  
  return { hasDiscrepancy: false, discrepancy: 0, apiTotal, calcTotal }
}
</script>


<style scoped>
.table-container { border: 1px solid #e2e8f0; border-radius: 12px; background: white; width: 100%; max-width: 100%; display: block; overflow-x: auto; -webkit-overflow-scrolling: touch; }
.purchases-table { width: 100%; border-collapse: collapse; min-width: 700px; }
.purchases-table th { background-color: #f8fafc; padding: 16px; color: #64748b; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; text-align: left; border-bottom: 1px solid #e2e8f0; letter-spacing: 0.05em; }
.purchases-table td { padding: 18px 16px; border-bottom: 1px solid #e2e8f0; font-size: 0.95rem; vertical-align: middle; }
.main-row { cursor: pointer; transition: background-color 0.2s ease, border-left 0.2s ease; border-left: 4px solid transparent; }
.main-row:hover { background-color: #f8fafc; }
.main-row.is-expanded { background-color: #eff6ff; border-left: 4px solid #3b82f6; }

.text-muted { color: #64748b; }
.text-dark { color: #0f172a; }
.font-medium { font-weight: 500; }
.font-bold { font-weight: 600; }
.text-right { text-align: right; }
.text-center { text-align: center; }
.text-price { font-size: 1.05rem; }
.actions-cell { width: 220px; padding-right: 16px !important; }
.actions-wrapper { display: flex; justify-content: flex-end; align-items: center; gap: 8px; flex-wrap: nowrap; }

.action-btn { flex-shrink: 0; display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
.edit-btn { background: transparent; border: 1px solid #cbd5e1; color: #475569; }
.edit-btn:hover { background-color: #f1f5f9; color: #0f172a; }
.approve-btn { background-color: #2563eb; border: 1px solid #2563eb; color: white; }
.approve-btn:hover:not(:disabled) { background-color: #1d4ed8; }
.approve-btn:disabled { background-color: #93c5fd; border-color: #93c5fd; cursor: not-allowed; }
.chevron-btn { flex-shrink: 0; background: transparent; border: none; color: #94a3b8; cursor: pointer; display: flex; align-items: center; padding: 4px; }
.chevron-btn svg { transition: transform 0.2s ease; }
.chevron-btn svg.rotated { transform: rotate(180deg); color: #2563eb; }

.expanded-row { background-color: #f8fafc; }
.expanded-cell { padding: 0 !important; border-left: 4px solid #3b82f6; }
.details-container { padding: 24px 32px; border-bottom: 1px solid #e2e8f0; overflow-x: auto; }
.details-title { font-size: 0.75rem; font-weight: 700; color: #94a3b8; letter-spacing: 0.05em; margin: 0 0 16px 0; }
.details-table { width: 100%; border-collapse: collapse; background: white; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05); min-width: 500px; }
.details-table th { background-color: #f8fafc; padding: 12px 16px; font-size: 0.75rem; color: #64748b; border-bottom: 1px solid #e2e8f0; }
.details-table td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; }
.details-table tr:last-child td { border-bottom: none; }
.total-row { background-color: #f8fafc; }
.total-price-val { font-size: 1.1rem; color: #2563eb !important; }

.status-badge { padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; display: inline-block; white-space: nowrap; }
.status-draft { background-color: #f1f5f9; color: #475569; border: 1px solid #e2e8f0;}
.status-waiting { background-color: #fef3c7; color: #b45309; border: 1px solid #fde68a;}
.status-approved { background-color: #dcfce7; color: #166534; border: 1px solid #bbf7d0;}
.empty-items-msg { padding: 32px; text-align: center; color: #94a3b8; font-size: 0.95rem; background: white; border-radius: 8px; }
.discrepancy-warning { 
  margin-top: 16px; 
  padding: 12px 16px; 
  background-color: #fef3c7; 
  border-left: 4px solid #f59e0b; 
  border-radius: 6px; 
  font-size: 0.9rem; 
  color: #92400e; 
  line-height: 1.6;
}
</style>
