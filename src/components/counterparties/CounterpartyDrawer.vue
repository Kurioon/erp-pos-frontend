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
          <button class="header-action-btn edit-btn" @click="isEditOpen = true" title="Редагувати">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            Редаг.
          </button>
          <button class="header-action-btn delete-btn" @click="isDeleteOpen = true" title="Видалити">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            Видал.
          </button>
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
            <p v-if="localNotes">{{ localNotes }}</p>
            <p v-else class="empty-text">Немає нотаток</p>
          </div>
        </div>

        <hr class="divider" />

        <!-- СЕКЦІЯ ПОКУПЦЯ -->
        <div v-if="['buyer', 'both'].includes(counterparty.role) || orders.length > 0 || serviceJobs.length > 0" class="role-section">
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
                <tr v-else v-for="order in orders" :key="order.id" @click="openOrderDetails(order)" class="clickable-row">
                  <td>{{ order.id }}</td>
                  <td>{{ formatDate(order.created_at) }}</td>
                  <td>{{ formatCurrency(order.total_amount) }}</td>
                  <td :class="{'text-danger font-medium': order.balance_due > 0}">{{ formatCurrency(order.balance_due || 0) }}</td>
                  <td><BaseStatusBadge :status="order.status === 'paid' ? 'success' : order.status === 'partial' ? 'warning' : 'default'" :text="getOrderStatusLabel(order.status)" /></td>
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
                <tr v-else v-for="job in serviceJobs" :key="job.id" @click="openRepairDetails(job)" class="clickable-row">
                  <td>{{ job.id }}</td>
                  <td>{{ job.device_name }}</td>
                  <td><BaseStatusBadge status="info" :text="getJobStatusLabel(job.status)" /></td>
                  <td>{{ formatCurrency(job.price) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <hr v-if="counterparty.role === 'both'" class="divider" />

        <!-- СЕКЦІЯ ПОСТАЧАЛЬНИКА -->
        <div v-if="['supplier', 'both'].includes(counterparty.role) || purchases.length > 0" class="role-section">
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
            <BaseButton class="btn-sm" @click="openPurchaseModal">+ Нова закупівля</BaseButton>
          </div>
          <div class="table-container">
            <table class="nested-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>ДАТА</th>
                  <th>СУМА</th>
                  <th>СТАТУС</th>
                  <th class="text-right">ДІЇ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="isLoadingPurchases">
                  <td colspan="5" class="text-center py-2">Завантаження...</td>
                </tr>
                <tr v-else-if="purchases.length === 0">
                  <td colspan="5" class="text-center py-2 empty-text">Немає закупівель</td>
                </tr>
                <tr v-else v-for="purchase in purchases" :key="purchase.id" @click="openPurchaseView(purchase)" class="clickable-row">
                  <td>{{ purchase.id }}</td>
                  <td>{{ formatDate(purchase.created_at) }}</td>
                  <td>{{ formatCurrency(purchase.total_amount) }}</td>
                  <td><BaseStatusBadge status="default" :text="getOrderStatusLabel(purchase.status)" /></td>
                  <td class="text-right actions-col" @click.stop>
                    <div class="actions-wrapper" v-if="['draft', 'чернетка'].includes(String(purchase.status).toLowerCase())">
                      <button class="action-btn edit-btn" @click="openPurchaseView(purchase)">Редаг.</button>
                      <button class="action-btn approve-btn" @click="approvePurchase(purchase)">Затв.</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  </div>

  <PurchaseFormModal
    v-if="isPurchaseModalOpen"
    :is-open="isPurchaseModalOpen"
    :fixed-supplier-id="counterparty?.id"
    @close="isPurchaseModalOpen = false"
    @save="handlePurchaseSubmit"
  />

  <PendingOrderDetailsModal
    v-if="isOrderModalOpen"
    :is-open="isOrderModalOpen"
    :order="selectedOrder"
    @close="isOrderModalOpen = false"
    @pay="handleOrderPay"
  />

  <RepairDetailsModal
    v-if="isRepairModalOpen"
    :is-open="isRepairModalOpen"
    :job="selectedRepair"
    @close="isRepairModalOpen = false"
    @pay="handleRepairPay"
    @refresh="loadData"
  />

  <PurchaseFormModal
    v-if="isPurchaseViewOpen"
    :is-open="isPurchaseViewOpen"
    :edit-mode="true"
    :order-data="selectedPurchase"
    @close="isPurchaseViewOpen = false"
    @save="handlePurchaseUpdate"
  />

  <ConfirmModal
    :is-open="isConfirmOpen"
    title="Оплатити борг"
    :message="confirmMessage"
    confirmText="Сплатити"
    @close="isConfirmOpen = false"
    @confirm="executeOrderPay"
  />

  <RepairPaymentModal
    v-if="isRepairPaymentOpen"
    :is-open="isRepairPaymentOpen"
    :job-data="selectedRepair"
    @close="isRepairPaymentOpen = false"
    @paid="handleRepairPaid"
  />

  <ReceiveOrderModal
    :is-open="isReceiveModalOpen"
    :order="orderToReceive"
    @close="isReceiveModalOpen = false; orderToReceive = null"
    @confirm="handleReceiveConfirm"
  />

  <!-- Редагування контрагента -->
  <CounterpartyFormModal
    :is-open="isEditOpen"
    :counterparty="counterparty"
    @close="isEditOpen = false"
    @saved="onEdited"
  />

  <!-- Підтвердження видалення -->
  <ConfirmModal
    :is-open="isDeleteOpen"
    :title="`Видалити контрагента ${counterparty?.name}?`"
    message="Ця дія незворотна. Чи дійсно ви хочете продовжити?"
    confirmText="Видалити"
    confirm-variant="danger"
    :is-loading="isDeleting"
    @confirm="onDeleteConfirmed"
    @close="isDeleteOpen = false"
  />
</template>

<script setup>
import { ref, watch } from 'vue'
import { useCounterpartiesStore } from '@/stores/counterparties'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { REPAIR_STATUS_LABELS } from '@/constants/repairs'
import BaseStatusBadge from '@/components/ui/BaseStatusBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import CounterpartyFormModal from '@/components/counterparties/CounterpartyFormModal.vue'
import PurchaseFormModal from '@/components/purchases/PurchaseFormModal.vue'
import PendingOrderDetailsModal from '@/components/finance/PendingOrderDetailsModal.vue'
import RepairDetailsModal from '@/components/repairs/RepairDetailsModal.vue'
import RepairPaymentModal from '@/components/repairs/RepairPaymentModal.vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'
import ReceiveOrderModal from '@/components/orders/ReceiveOrderModal.vue'
import api from '@/api/axios'
import { useFinanceStore } from '@/stores/finance'
import { useCartStore } from '@/stores/pos'

const props = defineProps({
  isOpen: Boolean,
  counterparty: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'refresh', 'deleted', 'new-purchase'])
const store = useCounterpartiesStore()
const financeStore = useFinanceStore()
const cartStore = useCartStore()

const isEditingNotes = ref(false)
const editNotes = ref('')
const localNotes = ref('')

const balanceData = ref(null)
const orders = ref([])
const serviceJobs = ref([])
const purchases = ref([])

const isLoadingOrders = ref(false)
const isLoadingJobs = ref(false)
const isLoadingPurchases = ref(false)

const isPurchaseModalOpen = ref(false)

const isOrderModalOpen = ref(false)
const selectedOrder = ref(null)

const isRepairModalOpen = ref(false)
const selectedRepair = ref(null)

const isPurchaseViewOpen = ref(false)
const selectedPurchase = ref(null)

const isConfirmOpen = ref(false)
const confirmMessage = ref('')
const orderToPay = ref(null)
const isRepairPaymentOpen = ref(false)

const isReceiveModalOpen = ref(false)
const orderToReceive = ref(null)

// Редагування / видалення контрагента
const isEditOpen = ref(false)
const isDeleteOpen = ref(false)
const isDeleting = ref(false)

const onEdited = async () => {
  isEditOpen.value = false
  // Оновлюємо дані профілю (для глобального дровера — через store.currentCounterparty)
  try {
    await store.fetchOne(props.counterparty.id)
  } catch (e) {
    console.error('Не вдалося оновити дані контрагента:', e)
  }
  emit('refresh')
}

const onDeleteConfirmed = async () => {
  if (!props.counterparty?.id) return
  isDeleting.value = true
  try {
    await store.remove(props.counterparty.id)
    isDeleteOpen.value = false
    emit('deleted', props.counterparty.id)
    close()
  } catch (e) {
    console.error('Не вдалося видалити контрагента:', e)
  } finally {
    isDeleting.value = false
  }
}

const openPurchaseModal = () => {
  isPurchaseModalOpen.value = true
}

const openOrderDetails = (order) => {
  selectedOrder.value = order
  isOrderModalOpen.value = true
}

const openRepairDetails = (job) => {
  selectedRepair.value = job
  isRepairModalOpen.value = true
}

const openPurchaseView = (purchase) => {
  selectedPurchase.value = purchase
  isPurchaseViewOpen.value = true
}

const handleOrderPay = async (order) => {
  isOrderModalOpen.value = false
  if (cartStore.availableCashboxes.length === 0) {
    await cartStore.fetchCashboxes()
  }
  const cashboxId = order.cash_register || cartStore.availableCashboxes[0]?.id
  if (!cashboxId) {
    window.dispatchEvent(new CustomEvent('api-error', { detail: { message: 'Не обрано касу для оплати', type: 'error' } }))
    return
  }
  orderToPay.value = { order, cashboxId }
  confirmMessage.value = `Ви підтверджуєте прийом оплати <strong>${formatCurrency(order.balance_due, order.currency)}</strong> за замовленням <strong>#${order.id}</strong>?`
  isConfirmOpen.value = true
}

const executeOrderPay = async () => {
  if (!orderToPay.value) return
  isConfirmOpen.value = false
  try {
    await financeStore.submitPrepay(orderToPay.value.order.id, orderToPay.value.order.balance_due, orderToPay.value.cashboxId)
    window.dispatchEvent(new CustomEvent('api-error', { detail: { message: 'Борг успішно оплачено', type: 'success' } }))
    await loadData()
  } catch (error) {
    console.error('Помилка оплати:', error)
  }
}

const handleRepairPay = (job) => {
  isRepairModalOpen.value = false
  selectedRepair.value = job
  isRepairPaymentOpen.value = true
}

const handleRepairPaid = () => {
  window.dispatchEvent(new CustomEvent('api-error', { detail: { message: 'Оплата за ремонт пройшла успішно', type: 'success' } }))
  loadData()
}

const handlePurchaseUpdate = async (payload) => {
  isPurchaseViewOpen.value = false
  loadData()
}

const approvePurchase = (purchase) => {
  orderToReceive.value = purchase
  isReceiveModalOpen.value = true
}

const handleReceiveConfirm = async ({ orderId, warehouseId }) => {
  try {
    await api.post(`/orders/${orderId}/receive/`, { warehouse: warehouseId })
    isReceiveModalOpen.value = false
    orderToReceive.value = null
    window.dispatchEvent(new CustomEvent('app-success', { detail: { message: 'Закупівлю затверджено! Товар на складі.' } }))
    await loadData()
  } catch (error) {
    console.error('Помилка затвердження', error)
  }
}

const handlePurchaseSubmit = async (payload) => {
  try {
    await api.post(`/counterparties/${props.counterparty.id}/create-order/`, payload)
    isPurchaseModalOpen.value = false
    window.dispatchEvent(new CustomEvent('api-error', { detail: { message: 'Закупівля створена', type: 'success' } }))
    
    // Refresh purchases list
    isLoadingPurchases.value = true
    store.fetchOrders(props.counterparty.id, { order_type: 'purchase' }).then(data => {
      purchases.value = data.results || []
    }).finally(() => {
      isLoadingPurchases.value = false
    })
    
    // Refresh balance
    store.fetchBalance(props.counterparty.id).then(data => balanceData.value = data)
  } catch (error) {
    console.error('Помилка при створенні закупівлі:', error)
  }
}

watch(
  () => props.isOpen,
  async (newVal) => {
    if (newVal && props.counterparty) {
      isEditingNotes.value = false
      localNotes.value = props.counterparty.notes || ''
      editNotes.value = localNotes.value
      await loadData()
    }
  }
)

const loadData = async () => {
  const id = props.counterparty.id

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

  isLoadingPurchases.value = true
  store.fetchOrders(id, { order_type: 'purchase' }).then(data => {
    purchases.value = data.results || []
    isLoadingPurchases.value = false
  })
}

const handleBackdropClick = () => {
  close()
}

const close = () => {
  emit('close')
}

const cancelNotesEdit = () => {
  isEditingNotes.value = false
  editNotes.value = localNotes.value
}

const saveNotes = async () => {
  try {
    await store.update(props.counterparty.id, { notes: editNotes.value })
    localNotes.value = editNotes.value
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
    case 'both': return 'Універсальний'
    default: return role
  }
}

const getOrderStatusLabel = (status) => {
  const map = {
    draft: 'Чернетка',
    partial: 'Частково оплачено',
    paid: 'Оплачено',
    returned: 'Повернено',
    cancelled: 'Скасовано'
  }
  return map[status] || status
}

const getJobStatusLabel = (status) => {
  return REPAIR_STATUS_LABELS[status] || status
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
  z-index: 10000;
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

.header-action-btn { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
.header-action-btn.edit-btn { background: transparent; border: 1px solid #cbd5e1; color: #475569; }
.header-action-btn.edit-btn:hover { background-color: #f1f5f9; color: #0f172a; }
.header-action-btn.delete-btn { background: transparent; border: 1px solid #fca5a5; color: #ef4444; }
.header-action-btn.delete-btn:hover { background-color: #fee2e2; }

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background 0.2s;
  color: #64748b;
  font-size: 1.5rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover { background: #f1f5f9; }

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

.data-table th, .data-table tr:last-child td {
  border-bottom: none;
}

.clickable-row {
  cursor: pointer;
  transition: background-color 0.2s;
}
.clickable-row:hover {
  background-color: #f1f5f9;
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

.actions-col { width: 140px; padding-right: 12px; }
.actions-wrapper { display: flex; justify-content: flex-end; align-items: center; gap: 6px; }
.action-btn { flex-shrink: 0; display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
.edit-btn { background: transparent; border: 1px solid #cbd5e1; color: #475569; }
.edit-btn:hover { background-color: #f1f5f9; color: #0f172a; }
.approve-btn { background-color: #2563eb; border: 1px solid #2563eb; color: white; }
.approve-btn:hover:not(:disabled) { background-color: #1d4ed8; }

</style>
