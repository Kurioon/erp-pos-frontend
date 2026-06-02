<script setup>
import { ref, onMounted, watch } from 'vue'
import { formatCurrency, formatDate } from '@/utils/formatters'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({
  product: { type: Object, default: null },
  movementHistory: { type: Array, required: true }
})

const emit = defineEmits(['close', 'save'])

const activePanelTab = ref('edit')
const localProduct = ref(null)

const syncLocalData = () => {
  if (props.product) {
    localProduct.value = { ...props.product }
  } else {
    localProduct.value = null
  }
}

onMounted(syncLocalData)
watch(() => props.product, syncLocalData, { deep: true })

const handleSave = () => {
  emit('save', localProduct.value)
}
</script>

<template>
  <div class="drawer-wrapper">
    <div class="panel-overlay" :class="{ 'is-open': props.product }" @click="emit('close')"></div>
    
    <aside class="side-panel" :class="{ 'is-open': props.product }">
      <template v-if="localProduct">
        <div class="panel-header">
          <div>
            <p class="panel-sku font-mono">{{ localProduct.id }}</p>
            <h2 class="panel-title">{{ localProduct.name }}</h2>
          </div>
          <button class="close-btn" @click="emit('close')">✕</button>
        </div>

        <div class="panel-tabs">
          <button class="tab-btn" :class="{ active: activePanelTab === 'edit' }" @click="activePanelTab = 'edit'">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
            Редагування
          </button>
          <button class="tab-btn" :class="{ active: activePanelTab === 'history' }" @click="activePanelTab = 'history'">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path></svg>
            Рух товару
          </button>
        </div>

        <div class="panel-content">
          <div v-if="activePanelTab === 'edit'" class="edit-tab">
            <div class="current-prices-card">
              <p class="section-label">ПОТОЧНІ ЦІНИ</p>
              <div class="prices-grid">
                <div>
                  <p class="price-label">Закуп.</p>
                  <p class="price-val">{{ formatCurrency(props.product.purchase_price, 'UAH') }}</p>
                </div>
                <div>
                  <p class="price-label">Опт.</p>
                  <p class="price-val">{{ formatCurrency(props.product.wholesale_price, 'UAH') }}</p>
                </div>
                <div>
                  <p class="price-label">Роздр.</p>
                  <p class="price-val">{{ formatCurrency(props.product.retail_price, 'UAH') }}</p>
                </div>
              </div>
            </div>

            <div class="edit-form">
              <p class="section-label">НОВІ ЦІНИ</p>
              <div class="form-group">
                <label>Закупівельна ціна (₴)</label>
                <input v-model.number="localProduct.purchase_price" type="number" />
              </div>
              <div class="form-group">
                <label>Оптова ціна (₴)</label>
                <input v-model.number="localProduct.wholesale_price" type="number" />
              </div>
              <div class="form-group">
                <label>Роздрібна ціна (₴)</label>
                <input v-model.number="localProduct.retail_price" type="number" />
              </div>
            </div>

            <div class="panel-actions">
              <BaseButton variant="primary" class="w-full" @click="handleSave">Зберегти ціни</BaseButton>
            </div>
          </div>

          <div v-else class="history-tab">
            <p class="section-label">ІСТОРІЯ РУХУ ТОВАРУ</p>
            <div class="history-list">
              <div v-for="record in props.movementHistory" :key="record.id" class="history-item">
                <div class="history-main">
                  <span class="history-type" :class="record.type === 'Надходження' ? 'type-in' : 'type-out'">
                    {{ record.type }}
                  </span>
                  <span class="history-qty" :class="record.qty > 0 ? 'text-green' : 'text-red'">
                    {{ record.qty > 0 ? '+' : '' }}{{ record.qty }} шт
                  </span>
                </div>
                <div class="history-meta">
                  <span class="text-muted">{{ formatDate(record.date) }}</span>
                  <span class="text-muted">•</span>
                  <span class="text-muted font-medium text-dark">{{ record.order }}</span>
                  <span class="history-balance">Залишок: {{ record.balance }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </aside>
  </div>
</template>

<style scoped>
.panel-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.3); backdrop-filter: blur(2px); z-index: 900; opacity: 0; visibility: hidden; transition: all 0.25s ease; }
.panel-overlay.is-open { opacity: 1; visibility: visible; }
.side-panel { position: fixed; top: 0; right: 0; width: 420px; height: 100vh; background: white; box-shadow: -10px 0 25px rgba(0,0,0,0.08); z-index: 1000; transform: translateX(100%); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; border-left: 1px solid #e2e8f0; }
.side-panel.is-open { transform: translateX(0); }
.panel-header { padding: 24px; display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #f1f5f9; }
.panel-sku { color: #64748b; font-size: 0.85rem; margin: 0 0 4px 0; }
.panel-title { margin: 0; font-size: 1.15rem; color: #0f172a; font-weight: 700; }
.close-btn { background: #f1f5f9; border: none; font-size: 0.85rem; color: #64748b; cursor: pointer; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.close-btn:hover { background: #e2e8f0; color: #0f172a; }
.panel-tabs { display: flex; border-bottom: 1px solid #e2e8f0; padding: 0 24px; background-color: #f8fafc; }
.tab-btn { flex: 1; padding: 14px 0; background: transparent; border: none; border-bottom: 2px solid transparent; font-size: 0.9rem; font-weight: 600; color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; }
.tab-btn.active { color: #2563eb; border-bottom-color: #2563eb; }
.panel-content { padding: 24px; flex: 1; overflow-y: auto; }
.section-label { font-size: 0.75rem; font-weight: 700; color: #94a3b8; letter-spacing: 0.05em; margin-bottom: 14px; }
.current-prices-card { background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 24px; border: 1px solid #e2e8f0; }
.prices-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.price-label { font-size: 0.8rem; color: #64748b; margin: 0 0 4px 0; font-weight: 500; }
.price-val { font-size: 0.95rem; font-weight: 700; color: #1e293b; margin: 0; }
.edit-form { display: flex; flex-direction: column; gap: 16px; margin-bottom: 32px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 0.85rem; color: #475569; font-weight: 600; }
.form-group input { padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem; outline: none; transition: all 0.15s; }
.form-group input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08); }
.w-full { width: 100%; }
.history-list { display: flex; flex-direction: column; gap: 12px; }
.history-item { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; }
.history-main { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.history-type { font-size: 0.8rem; font-weight: 700; padding: 4px 8px; border-radius: 6px; }
.type-in { background: #dcfce7; color: #166534; }
.type-out { background: #fee2e2; color: #991b1b; }
.history-qty { font-size: 1.05rem; font-weight: 700; }
.text-green { color: #10b981; }
.text-red { color: #ef4444; }
.history-meta { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; }
.text-dark { color: #1e293b; }
.history-balance { margin-left: auto; font-weight: 600; color: #475569; }
.font-mono { font-family: monospace; }

@media (max-width: 768px) {
  .side-panel { width: 100%; }
}
</style>