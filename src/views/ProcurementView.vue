<script setup>
import { ref, computed } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { PURCHASE_STATUSES, PURCHASE_STATUS_LABELS, PURCHASE_STATUS_CLASSES } from '@/constants/purchases'

// Мокові дані закупівель
const purchases = ref([
  {
    id: 'PO-001',
    supplier: 'Apple Distribution Ukraine',
    date: '2026-05-25',
    status: PURCHASE_STATUSES.APPROVED,
    items: [
      { name: 'iPhone 15 Pro Max 256GB', qty: 5, price: 38000 },
      { name: 'MacBook Air M3 13"', qty: 4, price: 54000 },
      { name: 'Зарядний пристрій Apple 140W', qty: 20, price: 2500 }
    ]
  },
  {
    id: 'PO-002',
    supplier: 'Samsung Electronics Ukraine',
    date: '2026-05-26',
    status: PURCHASE_STATUSES.DRAFT,
    items: [
      { name: 'Samsung Galaxy S24 Ultra', qty: 6, price: 32000 },
      { name: 'Samsung 55" QLED 4K', qty: 3, price: 32000 }
    ]
  },
  {
    id: 'PO-003',
    supplier: 'Lenovo Ukraine',
    date: '2026-05-27',
    status: PURCHASE_STATUSES.DRAFT,
    items: [
      { name: 'Lenovo ThinkPad X1 Carbon', qty: 3, price: 52000 }
    ]
  },
  {
    id: 'PO-004',
    supplier: 'Apple Distribution Ukraine',
    date: '2026-05-20',
    status: PURCHASE_STATUSES.RECEIVED,
    items: [
      { name: 'AirPods Pro 2nd Gen', qty: 10, price: 6000 },
      { name: 'Apple Watch Ultra 2', qty: 5, price: 18000 },
      { name: 'Зарядний пристрій Apple 140W', qty: 12, price: 2500 }
    ]
  }
])

// ТЕПЕР СПИСОК РЕАКТИВНИЙ (щоб можна було динамічно додавати нових)
const suppliersList = ref(['Apple Distribution Ukraine', 'Samsung Electronics Ukraine', 'Lenovo Ukraine', 'Xiaomi Official'])

const expandedRowId = ref(null)
const isModalOpen = ref(false)
const isEditMode = ref(false)
const editingOrderId = ref(null)

// Стан для створення нового постачальника в модалці
const isAddingNewSupplier = ref(false)
const newSupplierName = ref('')

const newOrder = ref({
  supplier: '',
  date: new Date().toISOString().split('T')[0],
  items: [{ name: '', qty: 1, price: 0 }]
})

const toggleRow = (id) => {
  expandedRowId.value = expandedRowId.value === id ? null : id
}

const calculateOrderTotal = (items) => {
  return items.reduce((sum, item) => sum + (item.qty * item.price), 0)
}

const approveOrder = (id) => {
  const order = purchases.value.find(p => p.id === id)
  if (order) order.status = PURCHASE_STATUSES.APPROVED
}

// Керування модалкою
const openCreateModal = () => {
  isEditMode.value = false
  editingOrderId.value = null
  isAddingNewSupplier.value = false
  newSupplierName.value = ''
  newOrder.value = {
    supplier: '',
    date: new Date().toISOString().split('T')[0],
    items: [{ name: '', qty: 1, price: 0 }]
  }
  isModalOpen.value = true
}

const openEditModal = (order) => {
  isEditMode.value = true
  editingOrderId.value = order.id
  isAddingNewSupplier.value = false
  newSupplierName.value = ''
  newOrder.value = {
    supplier: order.supplier,
    date: order.date,
    items: order.items.map(item => ({ ...item }))
  }
  isModalOpen.value = true
}

// ЛОГІКА ДОДАВАННЯ НОВОГО ПОСТАЧАЛЬНИКА НА ЛЬОТУ
const handleAddNewSupplier = () => {
  const cleanName = newSupplierName.value.trim()
  if (!cleanName) return
  
  // Якщо такого постачальника ще немає в списку — додаємо
  if (!suppliersList.value.includes(cleanName)) {
    suppliersList.value.push(cleanName)
  }
  
  // Автоматично вибираємо його у формі
  newOrder.value.supplier = cleanName
  
  // Скидаємо інпут та повертаємо селект
  newSupplierName.value = ''
  isAddingNewSupplier.value = false
}

const addFormItem = () => {
  newOrder.value.items.push({ name: '', qty: 1, price: 0 })
}

const removeFormItem = (index) => {
  if (newOrder.value.items.length > 1) {
    newOrder.value.items.splice(index, 1)
  }
}

const formTotalSum = computed(() => {
  return calculateOrderTotal(newOrder.value.items)
})

const handleSaveOrder = () => {
  if (!newOrder.value.supplier) return alert('Оберіть або додайте постачальника')
  
  if (isEditMode.value) {
    const order = purchases.value.find(p => p.id === editingOrderId.value)
    if (order) {
      order.supplier = newOrder.value.supplier
      order.date = newOrder.value.date
      order.items = [...newOrder.value.items]
    }
  } else {
    const nextIdNumber = purchases.value.length + 1
    const formattedId = `PO-${String(nextIdNumber).padStart(3, '0')}`
    purchases.value.unshift({
      id: formattedId,
      supplier: newOrder.value.supplier,
      date: newOrder.value.date,
      status: PURCHASE_STATUSES.DRAFT,
      items: [...newOrder.value.items]
    })
  }
  isModalOpen.value = false
}
</script>

<template>
  <div class="purchases-view">
    <header class="page-header">
      <div class="header-info">
        <h1>Закупівлі</h1>
        <p class="subtitle">Замовлення постачальникам</p>
      </div>
      <BaseButton @click="openCreateModal" class="btn-primary">+ Нове замовлення</BaseButton>
    </header>

    <main class="table-container">
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
          <template v-for="order in purchases" :key="order.id">
            <tr class="main-row" :class="{ 'is-expanded': expandedRowId === order.id }" @click="toggleRow(order.id)">
              <td class="text-muted font-medium">{{ order.id }}</td>
              <td class="font-bold text-dark">{{ order.supplier }}</td>
              <td class="text-muted">{{ order.date }}</td>
              <td>
                <span class="status-badge" :class="PURCHASE_STATUS_CLASSES[order.status]">
                  {{ PURCHASE_STATUS_LABELS[order.status] }}
                </span>
              </td>
              <td class="font-bold text-dark text-price">
                {{ calculateOrderTotal(order.items).toLocaleString('uk-UA') }} ₴
              </td>
              <td class="text-right actions-cell" @click.stop>
                <div class="actions-wrapper">
                  <template v-if="order.status === PURCHASE_STATUSES.DRAFT">
                    <button class="action-btn edit-btn" @click="openEditModal(order)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      Редагувати
                    </button>
                    <button class="action-btn approve-btn" @click="approveOrder(order.id)">
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
                        <td class="text-right text-muted">{{ item.price.toLocaleString('uk-UA') }} ₴</td>
                        <td class="text-right font-bold text-dark">{{ (item.qty * item.price).toLocaleString('uk-UA') }} ₴</td>
                      </tr>
                      <tr class="total-row">
                        <td colspan="3" class="text-right font-medium text-muted">Разом:</td>
                        <td class="text-right font-bold text-dark total-price-val">
                          {{ calculateOrderTotal(order.items).toLocaleString('uk-UA') }} ₴
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
    </main>

    <transition name="modal">
      <div v-if="isModalOpen" class="modal-overlay" @click.self="isModalOpen = false">
        <div class="modal-window">
          <div class="modal-header">
            <div>
              <h2>{{ isEditMode ? `Редагувати замовлення ${editingOrderId}` : 'Нове замовлення постачальнику' }}</h2>
              <p class="modal-header-sub">Заповніть дані та перелік товарів для постачання</p>
            </div>
            <button class="close-modal-btn" @click="isModalOpen = false">✕</button>
          </div>

          <div class="modal-body">
            <div class="form-row-top">
              
              <div class="form-group">
                <div class="supplier-label-container">
                  <label>Постачальник</label>
                  <button 
                    type="button" 
                    class="inline-add-btn" 
                    @click="isAddingNewSupplier = !isAddingNewSupplier"
                  >
                    {{ isAddingNewSupplier ? '← До списку' : '+ Новий постачальник' }}
                  </button>
                </div>

                <div v-if="!isAddingNewSupplier" class="select-wrapper">
                  <select v-model="newOrder.supplier" class="form-select">
                    <option value="" disabled>Оберіть постачальника з переліку...</option>
                    <option v-for="s in suppliersList" :key="s" :value="s">{{ s }}</option>
                  </select>
                </div>

                <div v-else class="inline-supplier-input-block">
                  <input 
                    type="text" 
                    v-model="newSupplierName" 
                    placeholder="Введіть назву компанії..." 
                    class="form-input"
                    @keyup.enter="handleAddNewSupplier"
                  />
                  <button type="button" class="btn-confirm-supplier" @click="handleAddNewSupplier">
                    Додати
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label>Дата замовлення</label>
                <input type="date" v-model="newOrder.date" class="form-input date-input" />
              </div>
            </div>

            <div class="items-section">
              <p class="section-subtitle">СПИСОК ТОВАРІВ ДЛЯ ЗАКУПІВЛІ</p>
              
              <div class="items-table-header">
                <span class="th-name">Назва товару / Артикул</span>
                <span class="th-qty text-center">К-сть</span>
                <span class="th-price class-right">Ціна закупівлі</span>
                <span class="th-total class-right">Загалом</span>
                <span class="th-action"></span>
              </div>

              <div class="items-blank-list">
                <div v-for="(item, index) in newOrder.items" :key="index" class="form-item-row">
                  <div class="fg-name">
                    <input type="text" v-model="item.name" placeholder="Наприклад, iPhone 15 Pro Max..." class="form-table-input" />
                  </div>
                  <div class="fg-qty">
                    <input type="number" v-model.number="item.qty" min="1" class="form-table-input text-center" />
                  </div>
                  <div class="fg-price">
                    <div class="price-input-wrapper">
                      <input type="number" v-model.number="item.price" min="0" class="form-table-input text-right" />
                      <span class="currency-inside">₴</span>
                    </div>
                  </div>
                  <div class="fg-total text-right font-bold">
                    {{ (item.qty * item.price || 0).toLocaleString('uk-UA') }} ₴
                  </div>
                  <div class="fg-action">
                    <button class="remove-item-btn" @click="removeFormItem(index)" :disabled="newOrder.items.length === 1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                </div>
              </div>

              <button class="add-row-btn" @click="addFormItem">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Додати товарну позицію
              </button>
            </div>
          </div>

          <div class="modal-footer">
            <div class="form-grand-total">
              <span class="total-label">РАЗОМ ДО ОПЛАТИ</span>
              <span class="total-sum-value">{{ formTotalSum.toLocaleString('uk-UA') }} ₴</span>
            </div>
            <div class="footer-actions">
              <button class="btn-secondary" @click="isModalOpen = false">Скасувати</button>
              <button class="btn-submit-order" @click="handleSaveOrder">
                {{ isEditMode ? 'Зберегти зміни' : 'Створити чернетку' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.purchases-view {
  padding: 32px;
  background-color: #ffffff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.header-info h1 {
  font-size: 1.6rem;
  color: #0f172a;
  margin: 0 0 4px 0;
  font-weight: 700;
}

.subtitle {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
}

.btn-primary {
  background-color: #2563eb;
  color: white;
  font-weight: 600;
  padding: 10px 20px;
  border-radius: 8px;
}

.table-container {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  background: white;
}

.purchases-table {
  width: 100%;
  border-collapse: collapse;
}

.purchases-table th {
  background-color: #f8fafc;
  padding: 16px;
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
  letter-spacing: 0.05em;
}

.purchases-table td {
  padding: 18px 16px;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.95rem;
  vertical-align: middle;
}

.main-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.main-row:hover {
  background-color: #f8fafc;
}

.main-row.is-expanded {
  background-color: #f1f5f9;
}

.text-muted { color: #64748b; }
.text-dark { color: #0f172a; }
.font-medium { font-weight: 500; }
.font-bold { font-weight: 600; }
.text-right { text-align: right; }
.text-center { text-align: center; }
.text-price { font-size: 1.05rem; }

.status-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-block;
}
.status-approved { background-color: #dcfce7; color: #166534; }
.status-draft { background-color: #f1f5f9; color: #475569; }
.status-received { background-color: #eff6ff; color: #1e40af; }

.actions-cell { width: 260px; }
.actions-wrapper {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-btn {
  background: transparent;
  border: 1px solid #cbd5e1;
  color: #475569;
}
.edit-btn:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

.approve-btn {
  background-color: #2563eb;
  border: 1px solid #2563eb;
  color: white;
}
.approve-btn:hover {
  background-color: #1d4ed8;
}

.chevron-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 4px;
}

.chevron-btn svg { transition: transform 0.2s ease; }
.chevron-btn svg.rotated {
  transform: rotate(180deg);
  color: #0f172a;
}

.expanded-row { background-color: #ffffff; }
.expanded-cell { padding: 0 !important; }

.details-container {
  padding: 24px 32px;
  background-color: #fafafa;
  border-bottom: 1px solid #e2e8f0;
}

.details-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: 0.05em;
  margin: 0 0 16px 0;
}

.details-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.details-table th {
  background-color: #f8fafc;
  padding: 12px 16px;
  font-size: 0.75rem;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
}

.details-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.9rem;
}

.details-table tr:last-child td { border-bottom: none; }
.total-row { background-color: #f8fafc; }
.total-price-val { font-size: 1.1rem; color: #2563eb !important; }

/* --- МОДАЛКА З ПРЕМИУМ ЕФЕКТАМИ --- */
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: rgba(15, 23, 42, 0.3);
  backdrop-filter: blur(4px);
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-window {
  background: white;
  border-radius: 16px;
  width: 840px;
  max-width: 95%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  border: 1px solid #e2e8f0;
}

.modal-header {
  padding: 24px 32px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  font-size: 1.35rem;
  margin: 0 0 4px 0;
  color: #0f172a;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.modal-header-sub { margin: 0; font-size: 0.85rem; color: #64748b; }

.close-modal-btn {
  background: #f1f5f9;
  border: none;
  font-size: 0.9rem;
  color: #64748b;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.close-modal-btn:hover { background: #e2e8f0; color: #0f172a; }

.modal-body { padding: 32px; overflow-y: auto; flex: 1; }
.form-row-top { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-bottom: 32px; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-group label { font-size: 0.8rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; }

/* Стилізація верхнього рядка блоку постачальника */
.supplier-label-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.inline-add-btn {
  background: transparent;
  border: none;
  color: #2563eb;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  transition: color 0.15s ease;
}

.inline-add-btn:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

/* Блок інпуту нового постачальника */
.inline-supplier-input-block {
  display: flex;
  gap: 8px;
  width: 100%;
}

.inline-supplier-input-block .form-input {
  flex: 1;
}

.btn-confirm-supplier {
  background-color: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #1e293b;
  padding: 0 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-confirm-supplier:hover {
  background-color: #e2e8f0;
  color: #0f172a;
}

.form-input, .form-select {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #1e293b;
  outline: none;
  background-color: #ffffff;
  transition: all 0.2s;
}
.form-input:focus, .form-select:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
.date-input { color: #334155; font-weight: 500; }

.items-section { display: flex; flex-direction: column; }
.section-subtitle { font-size: 0.75rem; font-weight: 700; color: #94a3b8; letter-spacing: 0.08em; margin-bottom: 16px; }

.items-table-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 12px 8px 12px;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.th-name { flex: 1; }
.th-qty { width: 80px; }
.th-price { width: 140px; text-align: right; }
.th-total { width: 120px; text-align: right; }
.th-action { width: 32px; }

.items-blank-list { display: flex; flex-direction: column; gap: 10px; margin-top: 10px; max-height: 240px; overflow-y: auto; }
.form-item-row { display: flex; align-items: center; gap: 16px; padding: 6px 12px; background: #ffffff; border-bottom: 1px solid #f1f5f9; }

.fg-name { flex: 1; }
.fg-qty { width: 80px; }
.fg-price { width: 140px; }
.fg-total { width: 120px; font-size: 0.95rem; color: #0f172a; }
.fg-action { width: 32px; display: flex; justify-content: center; }

.form-table-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.9rem;
  outline: none;
  color: #0f172a;
  background-color: #f8fafc;
  transition: all 0.15s;
}
.form-table-input:focus { background-color: #ffffff; border-color: #2563eb; box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.08); }

.price-input-wrapper { position: relative; display: flex; align-items: center; }
.price-input-wrapper .form-table-input { padding-right: 24px; }
.currency-inside { position: absolute; right: 12px; font-size: 0.85rem; color: #94a3b8; font-weight: 500; pointer-events: none; }

.remove-item-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.remove-item-btn:hover:not(:disabled) { background: #fef2f2; color: #ef4444; }
.remove-item-btn:disabled { opacity: 0.3; cursor: not-allowed; }

.add-row-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #ffffff;
  border: 1px dashed #cbd5e1;
  color: #2563eb;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 14px;
}
.add-row-btn:hover { background-color: #eff6ff; border-color: #2563eb; }

.modal-footer {
  padding: 24px 32px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
}

.form-grand-total { display: flex; flex-direction: column; }
.total-label { font-size: 0.7rem; color: #64748b; font-weight: 700; letter-spacing: 0.05em; }
.total-sum-value { font-size: 1.4rem; font-weight: 700; color: #2563eb; margin-top: 2px; }

.footer-actions { display: flex; gap: 12px; }
.btn-secondary { background: white; border: 1px solid #cbd5e1; color: #475569; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: background 0.15s; }
.btn-secondary:hover { background: #f1f5f9; }

.btn-submit-order { background-color: #2563eb; color: white; border: none; padding: 10px 24px; border-radius: 8px; font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: background 0.15s; }
.btn-submit-order:hover { background-color: #1d4ed8; }

/* АНІМАЦІЯ З МІКРО-ПРУЖИНОЮ */
.modal-enter-active, .modal-leave-active { transition: opacity 0.3s ease, backdrop-filter 0.3s ease; }
.modal-enter-active .modal-window, .modal-leave-active .modal-window { transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; backdrop-filter: blur(0px); }
.modal-enter-from .modal-window, .modal-leave-to .modal-window { opacity: 0; transform: scale(0.96) translateY(16px); }
</style>