<template>
  <div v-if="isOpen" class="drawer-overlay" @mousedown="handleBackdropClick">
    <div class="drawer-content" :class="{ 'drawer-open': isOpen }" @mousedown.stop>
      <!-- Шапка -->
      <div class="drawer-header">
        <div class="header-main">
          <h2>{{ counterparty?.name }}</h2>
          <BaseStatusBadge
            v-if="counterparty"
            :status="getRoleStatus(counterparty.role)"
            :text="getRoleLabel(counterparty.role)"
          />
        </div>
        <div class="header-actions">
          <button class="icon-btn edit-btn" @click="emit('edit')" title="Редагувати">✏️</button>
          <button class="icon-btn delete-btn" @click="emit('delete')" title="Видалити">🗑️</button>
          <button class="close-btn" @click="close">×</button>
        </div>
      </div>

      <div class="drawer-body" v-if="counterparty">
        <!-- Контакти -->
        <div class="contact-info">
          <div class="info-item" v-if="counterparty.phone">
            <span class="icon">📞</span> {{ counterparty.phone }}
          </div>
          <div class="info-item" v-if="counterparty.email">
            <span class="icon">✉️</span> {{ counterparty.email }}
          </div>
        </div>

        <!-- Нотатки (inline edit) -->
        <div class="notes-section">
          <div class="notes-header">
            <h3>Нотатки</h3>
            <button v-if="!isEditingNotes" class="text-btn" @click="isEditingNotes = true">Редагувати</button>
          </div>
          <div v-if="isEditingNotes" class="notes-edit">
            <textarea v-model="editNotes" rows="3" class="notes-textarea"></textarea>
            <div class="notes-actions">
              <BaseButton type="button" class="cancel-btn btn-sm" @click="cancelNotesEdit">Скасувати</BaseButton>
              <BaseButton type="button" class="save-btn btn-sm" @click="saveNotes">Зберегти</BaseButton>
            </div>
          </div>
          <div v-else class="notes-display">
            <p v-if="counterparty.notes">{{ counterparty.notes }}</p>
            <p v-else class="empty-text">Немає нотаток</p>
          </div>
        </div>

        <hr class="divider" />

        <!-- СЕКЦІЯ ПОКУПЦЯ -->
        <div v-if="['buyer', 'both'].includes(counterparty.role)" class="role-section">
          <h3>Фінансовий баланс (Покупець)</h3>
          <div class="balance-cards">
            <div class="stat-card">
              <div class="stat-label">Оплачено</div>
              <div class="stat-value text-success">{{ formatCurrency(balanceData?.buyer?.total_paid || 0) }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Залишок боргу</div>
              <div class="stat-value text-danger">{{ formatCurrency(balanceData?.buyer?.total_balance_due || 0) }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">В роботі: ремонти</div>
              <div class="stat-value">{{ balanceData?.buyer?.repairs_unpaid || 0 }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">В роботі: замовлення</div>
              <div class="stat-value">{{ balanceData?.buyer?.orders_partial || 0 }}</div>
            </div>
          </div>

          <div class="section-header mt-6">
            <h3>Замовлення</h3>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Дата</th>
                  <th>Сума</th>
                  <th>Борг</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="isLoadingOrders">
                  <td colspan="5" class="text-center py-2">Завантаження...</td>
                </tr>
                <tr v-else-if="orders.length === 0">
                  <td colspan="5" class="text-center py-2 empty-text">Немає замовлень</td>
                </tr>
                <tr v-else v-for="order in orders" :key="order.id">
                  <td>{{ order.id }}</td>
                  <td>{{ formatDate(order.created_at) }}</td>
                  <td>{{ formatCurrency(order.total_amount) }}</td>
                  <td :class="{'text-danger font-medium': order.balance_due > 0}">{{ formatCurrency(order.balance_due || 0) }}</td>
                  <td><BaseStatusBadge :status="order.status === 'paid' ? 'success' : order.status === 'partial' ? 'warning' : 'default'" :text="order.status" /></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="section-header mt-6">
            <h3>Ремонти</h3>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Пристрій</th>
                  <th>Статус</th>
                  <th>Вартість</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="isLoadingJobs">
                  <td colspan="4" class="text-center py-2">Завантаження...</td>
                </tr>
                <tr v-else-if="serviceJobs.length === 0">
                  <td colspan="4" class="text-center py-2 empty-text">Немає ремонтів</td>
                </tr>
                <tr v-else v-for="job in serviceJobs" :key="job.id">
                  <td>{{ job.id }}</td>
                  <td>{{ job.device_name }}</td>
                  <td><BaseStatusBadge status="info" :text="job.status" /></td>
                  <td>{{ formatCurrency(job.price) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <hr v-if="counterparty.role === 'both'" class="divider" />

        <!-- СЕКЦІЯ ПОСТАЧАЛЬНИКА -->
        <div v-if="['supplier', 'both'].includes(counterparty.role)" class="role-section">
          <h3>Фінансовий стан (Постачальник)</h3>
          <div class="balance-cards">
            <div class="stat-card">
              <div class="stat-label">Сума закупівель</div>
              <div class="stat-value text-primary">{{ formatCurrency(balanceData?.supplier?.total_purchases || 0) }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Кількість закупівель</div>
              <div class="stat-value">{{ balanceData?.supplier?.purchases_count || 0 }}</div>
            </div>
          </div>

          <div class="section-header mt-6">
            <h3>Закупівлі (Постачальник)</h3>
            <BaseButton class="btn-sm" @click="emit('new-purchase')">+ Нова закупівля</BaseButton>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Дата</th>
                  <th>Сума</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="isLoadingPurchases">
                  <td colspan="4" class="text-center py-2">Завантаження...</td>
                </tr>
                <tr v-else-if="purchases.length === 0">
                  <td colspan="4" class="text-center py-2 empty-text">Немає закупівель</td>
                </tr>
                <tr v-else v-for="purchase in purchases" :key="purchase.id">
                  <td>{{ purchase.id }}</td>
                  <td>{{ formatDate(purchase.created_at) }}</td>
                  <td>{{ formatCurrency(purchase.total_amount) }}</td>
                  <td><BaseStatusBadge status="default" :text="purchase.status" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useCounterpartiesStore } from '@/stores/counterparties'
import { formatCurrency, formatDate } from '@/utils/formatters'
import BaseStatusBadge from '@/components/ui/BaseStatusBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({
  isOpen: Boolean,
  counterparty: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'edit', 'delete', 'new-purchase'])
const store = useCounterpartiesStore()

const isEditingNotes = ref(false)
const editNotes = ref('')

const balanceData = ref(null)
const orders = ref([])
const serviceJobs = ref([])
const purchases = ref([])

const isLoadingOrders = ref(false)
const isLoadingJobs = ref(false)
const isLoadingPurchases = ref(false)

watch(
  () => props.isOpen,
  async (newVal) => {
    if (newVal && props.counterparty) {
      isEditingNotes.value = false
      editNotes.value = props.counterparty.notes || ''
      await loadData()
    }
  }
)

const loadData = async () => {
  const id = props.counterparty.id
  const role = props.counterparty.role

  if (['buyer', 'both'].includes(role)) {
    store.fetchBalance(id).then(data => balanceData.value = data)
    isLoadingOrders.value = true
    store.fetchOrders(id, { order_type: 'retail' }).then(data => {
      orders.value = data.results || []
      isLoadingOrders.value = false
    })
    isLoadingJobs.value = true
    store.fetchServiceJobs(id).then(data => {
      serviceJobs.value = data.results || []
      isLoadingJobs.value = false
    })
  }

  if (['supplier', 'both'].includes(role)) {
    isLoadingPurchases.value = true
    store.fetchOrders(id, { order_type: 'purchase' }).then(data => {
      purchases.value = data.results || []
      isLoadingPurchases.value = false
    })
  }
}

const handleBackdropClick = () => {
  close()
}

const close = () => {
  emit('close')
}

const cancelNotesEdit = () => {
  isEditingNotes.value = false
  editNotes.value = props.counterparty.notes || ''
}

const saveNotes = async () => {
  try {
    await store.update(props.counterparty.id, { notes: editNotes.value })
    isEditingNotes.value = false
  } catch (error) {
    console.error(error)
  }
}

const getRoleStatus = (role) => {
  switch (role) {
    case 'buyer': return 'success'
    case 'supplier': return 'warning'
    case 'both': return 'info'
    default: return 'default'
  }
}

const getRoleLabel = (role) => {
  switch (role) {
    case 'buyer': return 'Покупець'
    case 'supplier': return 'Постачальник'
    case 'both': return 'Обидва'
    default: return 'Невідомо'
  }
}
</script>

<style scoped>
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(2px);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}

.drawer-content {
  width: 100%;
  max-width: 600px;
  background: #f8fafc;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease forwards;
}

@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.drawer-header {
  padding: 24px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-main h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #0f172a;
  font-weight: 700;
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.icon-btn, .close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background 0.2s;
  color: #64748b;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover { background: #f1f5f9; }
.delete-btn:hover { background: #fee2e2; color: #ef4444; }

.drawer-body {
  padding: 24px;
  overflow-y: auto;
  flex-grow: 1;
}

.contact-info {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #475569;
  font-size: 0.95rem;
}

.notes-section {
  background: white;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.notes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.notes-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #0f172a;
}

.text-btn {
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 0.85rem;
  cursor: pointer;
}

.text-btn:hover { text-decoration: underline; }

.notes-textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-family: inherit;
  resize: vertical;
}

.notes-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.empty-text {
  color: #94a3b8;
  font-style: italic;
  margin: 0;
}

.divider {
  border: none;
  border-top: 1px solid #e2e8f0;
  margin: 24px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #0f172a;
}

.mt-6 { margin-top: 24px; }

.balance-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.stat-label {
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
}

.text-success { color: #10b981; }
.text-danger { color: #ef4444; }
.text-primary { color: #3b82f6; }

.table-container {
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table th, .data-table td {
  padding: 10px 16px;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.9rem;
}

.data-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #475569;
}

.btn-sm {
  padding: 4px 10px;
  font-size: 0.85rem;
}
</style>
