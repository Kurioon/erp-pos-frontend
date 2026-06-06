<template>
  <div class="drawer-wrapper">
    <div class="panel-overlay" :class="{ 'is-open': props.product }" @click="emit('close')"></div>

    <aside class="side-panel" :class="{ 'is-open': props.product }">
      <template v-if="localProduct">
        <div class="panel-header">
          <div>
            <p class="panel-sku font-mono">{{ localProduct.code || localProduct.id }}</p>
            <h2 class="panel-title">{{ localProduct.name }}</h2>
          </div>
          <button class="close-btn" @click="emit('close')">✕</button>
        </div>

        <div class="panel-tabs">
          <button class="tab-btn" :class="{ active: activePanelTab === 'edit' }" @click="activePanelTab = 'edit'">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
            Загальне
          </button>
          <button class="tab-btn" :class="{ active: activePanelTab === 'move' }" @click="activePanelTab = 'move'">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 9l4-4 4 4"></path><path d="M9 5v14"></path><path d="M19 15l-4 4-4-4"></path><path d="M15 19V5"></path></svg>
            Перемістити
          </button>
          <button class="tab-btn" :class="{ active: activePanelTab === 'history' }" @click="activePanelTab = 'history'">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path></svg>
            Рух
          </button>
        </div>

        <div class="panel-content">
          <div v-if="activePanelTab === 'edit'" class="edit-tab">
            <div class="info-card">
              <p class="section-label">ЗАЛИШКИ НА СКЛАДАХ</p>
              <div class="stock-list">
                <template v-if="activeStocks.length > 0">
                  <div v-for="(stock, idx) in activeStocks" :key="idx" class="stock-item">
                    <span class="stock-name">{{ getWarehouseName(stock.warehouse) }}</span>
                    <span class="stock-qty">{{ stock.quantity }} шт</span>
                  </div>
                </template>
                <div v-else class="empty-stock">
                  Немає в наявності на жодному складі
                </div>
              </div>
            </div>

            <div class="info-card">
              <p class="section-label">ПОТОЧНІ ЦІНИ</p>
              <div class="prices-grid">
                <div>
                  <p class="price-label">Закуп.</p>
                  <p class="price-val">{{ formatCurrency(Math.abs(props.product.purchase_price || 0), 'UAH') }}</p>
                </div>
                <div>
                  <p class="price-label">Опт.</p>
                  <p class="price-val">{{ formatCurrency(Math.abs(props.product.wholesale_price || 0), 'UAH') }}</p>
                </div>
                <div>
                  <p class="price-label">Роздр.</p>
                  <p class="price-val">{{ formatCurrency(Math.abs(props.product.retail_price || 0), 'UAH') }}</p>
                </div>
              </div>
            </div>

            <div class="edit-form">
              <p class="section-label">БАЗОВА ЦІНА</p>
              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Ціна *</label>
                  <BaseInput v-model.number="localProduct.base_price" type="number" step="0.01" min="0" />
                </div>
                <div class="form-group">
                  <label class="form-label">Валюта</label>
                  <select v-model="localProduct.base_currency" class="custom-select">
                    <option value="UAH">₴ (Гривня)</option>
                    <option value="USD">$ (Долар США)</option>
                    <option value="EUR">€ (Євро)</option>
                  </select>
                </div>
              </div>
              
              <div class="price-preview-card" v-if="localProduct.base_price > 0">
                <p class="preview-label">Прев'ю ціни:</p>
                <p class="preview-values">
                   <span class="main-price">{{ previewUah }} ₴</span>
                   <span class="other-prices">/ {{ previewUsd }} $ / {{ previewEur }} €</span>
                </p>
              </div>
            </div>

            <div class="panel-actions">
              <BaseButton variant="primary" class="w-full" @click="handleSave">Зберегти ціни</BaseButton>
            </div>
          </div>

          <div v-else-if="activePanelTab === 'move'" class="move-tab">
            <p class="section-label">ВНУТРІШНЄ ПЕРЕМІЩЕННЯ</p>

            <div class="info-card mb-4">
              <p class="section-label">ДОСТУПНО ДЛЯ ПЕРЕМІЩЕННЯ</p>
              <div class="stock-list">
                <div v-for="(stock, idx) in activeStocks" :key="idx" class="stock-item">
                  <span class="stock-name">{{ getWarehouseName(stock.warehouse) }}</span>
                  <span class="stock-qty">{{ stock.quantity }} шт</span>
                </div>
              </div>
            </div>

            <div class="edit-form">
              <div class="form-group">
                <label class="form-label">Зі складу</label>
                <select v-model="moveForm.from_warehouse" class="custom-select">
                  <option disabled value="">Оберіть склад-відправник</option>
                  <option v-for="stock in activeStocks" :key="stock.warehouse" :value="stock.warehouse">
                    {{ getWarehouseName(stock.warehouse) }} ({{ stock.quantity }} шт)
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">На склад</label>
                <select v-model="moveForm.to_warehouse" class="custom-select">
                  <option disabled value="">Оберіть склад-отримувач</option>
                  <option v-for="w in availableDestinations" :key="w.id" :value="w.id">
                    {{ w.name }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Кількість (шт)</label>
                <BaseInput v-model.number="moveForm.quantity" type="number" min="1" :max="maxMoveQuantity" />
              </div>
            </div>

            <div class="panel-actions">
              <BaseButton variant="primary" class="w-full" :disabled="!isMoveValid" @click="submitMove">
                Перемістити товар
              </BaseButton>
            </div>
          </div>

          <div v-else class="history-tab">
            <p class="section-label">ІСТОРІЯ РУХУ ТОВАРУ</p>
            <div class="history-list">
              <template v-if="props.movementHistory.length > 0">
                <div v-for="record in props.movementHistory" :key="record.id" class="history-item">
                  <div class="history-main">
                    <span class="history-type" :class="getHistoryTypeClass(record.type)">
                      {{ record.type || 'Переміщення' }}
                    </span>
                    <span class="history-qty" :class="getHistoryQtyClass(record.quantity)">
                      {{ record.quantity > 0 ? '+' : '' }}{{ record.quantity }} шт
                    </span>
                  </div>
                  <div class="history-meta">
                    <span class="text-muted">{{ formatDate(record.created_at) }}</span>
                    <span class="text-muted">•</span>
                    <span class="text-muted font-medium text-dark">{{ getWarehouseName(record.warehouse) }}</span>
                  </div>
                </div>
              </template>
              <div v-else class="empty-stock text-center mt-4">
                Історія рухів порожня
              </div>
            </div>
          </div>

        </div>
      </template>
    </aside>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { formatCurrency } from '@/utils/formatters'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import { useExchangeRatesStore } from '@/stores/exchangeRates'

const props = defineProps({
  product: { type: Object, default: null },
  movementHistory: { type: Array, required: true },
  warehouses: { type: Array, default: () => [] }
})

const emit = defineEmits(['close', 'save', 'move-stock'])

const exchangeRatesStore = useExchangeRatesStore()

const activePanelTab = ref('edit')
const localProduct = ref(null)

const moveForm = ref({
  from_warehouse: '',
  to_warehouse: '',
  quantity: 1
})

const syncLocalData = () => {
  if (props.product) {
    localProduct.value = { 
      ...props.product,
      base_price: Number(props.product.base_price || 0),
      base_currency: props.product.base_currency || 'USD'
    }
    moveForm.value = { from_warehouse: '', to_warehouse: '', quantity: 1 }
    activePanelTab.value = 'edit'
  } else {
    localProduct.value = null
  }
}

onMounted(() => {
  syncLocalData()
  if (exchangeRatesStore.rates.length === 0) {
    exchangeRatesStore.fetchRates()
  }
})
watch(() => props.product, syncLocalData, { deep: true })

const previewUah = computed(() => {
  if (!localProduct.value || !localProduct.value.base_price) return '0.00'
  const rate = exchangeRatesStore.getRate(localProduct.value.base_currency)
  return (localProduct.value.base_price * rate).toFixed(2)
})

const previewUsd = computed(() => {
  if (!localProduct.value || !localProduct.value.base_price) return '0.00'
  const uah = Number(previewUah.value)
  const rate = exchangeRatesStore.getRate('USD')
  return rate ? (uah / rate).toFixed(2) : '0.00'
})

const previewEur = computed(() => {
  if (!localProduct.value || !localProduct.value.base_price) return '0.00'
  const uah = Number(previewUah.value)
  const rate = exchangeRatesStore.getRate('EUR')
  return rate ? (uah / rate).toFixed(2) : '0.00'
})

const activeStocks = computed(() => {
  if (!props.product || !props.product.stock_details) return []
  return props.product.stock_details.filter(s => Number(s.quantity) > 0)
})

const getWarehouseName = (id) => {
  const w = props.warehouses.find(w => w.id === id)
  return w ? w.name : `Склад #${id}`
}

const availableDestinations = computed(() => {
  if (!moveForm.value.from_warehouse) return props.warehouses
  return props.warehouses.filter(w => w.id !== moveForm.value.from_warehouse)
})

const maxMoveQuantity = computed(() => {
  if (!moveForm.value.from_warehouse) return 0
  const stock = activeStocks.value.find(s => s.warehouse === moveForm.value.from_warehouse)
  return stock ? Number(stock.quantity) : 0
})

const isMoveValid = computed(() => {
  return moveForm.value.from_warehouse !== '' &&
         moveForm.value.to_warehouse !== '' &&
         moveForm.value.quantity > 0 &&
         moveForm.value.quantity <= maxMoveQuantity.value
})

const submitMove = () => {
  emit('move-stock', {
    product_id: localProduct.value.id,
    from_warehouse: moveForm.value.from_warehouse,
    to_warehouse: moveForm.value.to_warehouse,
    quantity: moveForm.value.quantity
  })
  moveForm.value = { from_warehouse: '', to_warehouse: '', quantity: 1 }
  activePanelTab.value = 'history'
}

const handleSave = () => {
  emit('save', localProduct.value)
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const getHistoryTypeClass = (type) => {
  if (type === 'Надходження' || type === 'IN') return 'type-in'
  if (type === 'Списання' || type === 'OUT') return 'type-out'
  return 'type-neutral'
}

const getHistoryQtyClass = (qty) => {
  return Number(qty) > 0 ? 'text-green' : 'text-red'
}
</script>

<style scoped>
.panel-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.3); backdrop-filter: blur(2px); z-index: 900; opacity: 0; visibility: hidden; transition: all 0.25s ease; }
.panel-overlay.is-open { opacity: 1; visibility: visible; }
.side-panel { position: fixed; top: 0; right: 0; width: 440px; height: 100vh; background: white; box-shadow: -10px 0 25px rgba(0,0,0,0.08); z-index: 1000; transform: translateX(100%); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; border-left: 1px solid #e2e8f0; }
.side-panel.is-open { transform: translateX(0); }
.panel-header { padding: 24px; display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #f1f5f9; }
.panel-sku { color: #64748b; font-size: 0.85rem; margin: 0 0 4px 0; }
.panel-title { margin: 0; font-size: 1.15rem; color: #0f172a; font-weight: 700; }
.close-btn { background: #f1f5f9; border: none; font-size: 0.85rem; color: #64748b; cursor: pointer; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.close-btn:hover { background: #e2e8f0; color: #0f172a; }

.panel-tabs { display: flex; border-bottom: 1px solid #e2e8f0; padding: 0 24px; background-color: #f8fafc; }
.tab-btn { flex: 1; padding: 14px 0; background: transparent; border: none; border-bottom: 2px solid transparent; font-size: 0.85rem; font-weight: 600; color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s; }
.tab-btn.active { color: #2563eb; border-bottom-color: #2563eb; }

.panel-content { padding: 24px; flex: 1; overflow-y: auto; }
.section-label { font-size: 0.75rem; font-weight: 700; color: #94a3b8; letter-spacing: 0.05em; margin-bottom: 14px; }

.info-card { background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 24px; border: 1px solid #e2e8f0; }
.mb-4 { margin-bottom: 16px !important; }
.stock-list { display: flex; flex-direction: column; gap: 10px; }
.stock-item { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #cbd5e1; padding-bottom: 8px; }
.stock-item:last-child { border-bottom: none; padding-bottom: 0; }
.stock-name { font-size: 0.9rem; color: #334155; font-weight: 600; }
.stock-qty { font-size: 0.85rem; color: #2563eb; font-weight: 700; background: #eff6ff; padding: 4px 10px; border-radius: 6px; }
.empty-stock { font-size: 0.85rem; color: #94a3b8; font-style: italic; }

.edit-form { display: flex; flex-direction: column; gap: 16px; margin-bottom: 32px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 0.8rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; display: block; }
.w-full { width: 100%; }

.custom-select { width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid #cbd5e1; background-color: #ffffff; color: #0f172a; font-size: 0.95rem; outline: none; transition: border-color 0.2s; }
.custom-select:focus { border-color: #2563eb; }

.history-list { display: flex; flex-direction: column; gap: 12px; }
.history-item { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; }
.history-main { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.history-type { font-size: 0.8rem; font-weight: 700; padding: 4px 8px; border-radius: 6px; }
.type-in { background: #dcfce7; color: #166534; }
.type-out { background: #fee2e2; color: #991b1b; }
.type-neutral { background: #f1f5f9; color: #475569; }
.history-qty { font-size: 1.05rem; font-weight: 700; }
.text-green { color: #10b981; }
.text-red { color: #ef4444; }
.history-meta { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; }
.text-dark { color: #1e293b; }
.history-balance { margin-left: auto; font-weight: 600; color: #475569; }
.font-mono { font-family: monospace; }
.prices-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.price-label { font-size: 0.75rem; color: #64748b; margin: 0 0 2px 0; font-weight: 500; }
.price-val { font-size: 0.85rem; font-weight: 700; color: #1e293b; margin: 0; word-wrap: break-word; line-height: 1.2; }

.form-row-2 { display: flex; gap: 16px; margin-bottom: 12px; }
.form-row-2 .form-group { flex: 1; }
.price-preview-card { background: #f8fafc; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; align-items: center; justify-content: center; margin-top: 8px; }
.preview-label { font-size: 0.75rem; color: #64748b; font-weight: 600; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.05em; }
.preview-values { margin: 0; font-family: monospace; display: flex; align-items: baseline; gap: 8px; }
.main-price { font-size: 1.25rem; font-weight: 700; color: #2563eb; }
.other-prices { font-size: 0.9rem; color: #94a3b8; }
</style>
