<script setup>
import { ref, computed } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'

// Мокові дані для таблиці
const products = ref([
  { id: 'APL-001', name: 'iPhone 15 Pro Max 256GB', category: 'Смартфони', purchase_price: 38000, wholesale_price: 42000, retail_price: 45990, stock: 12 },
  { id: 'SAM-002', name: 'Samsung Galaxy S24 Ultra', category: 'Смартфони', purchase_price: 32000, wholesale_price: 36000, retail_price: 39990, stock: 8 },
  { id: 'APL-003', name: 'MacBook Air M3 13" 256GB', category: 'Ноутбуки', purchase_price: 45000, wholesale_price: 50000, retail_price: 54990, stock: 3 },
  { id: 'APL-004', name: 'iPad Pro 12.9" M4 256GB', category: 'Планшети', purchase_price: 28000, wholesale_price: 32000, retail_price: 35990, stock: 6 },
  { id: 'SAM-005', name: 'Samsung 55" QLED 4K', category: 'Телевізори', purchase_price: 22000, wholesale_price: 26000, retail_price: 28990, stock: 4 },
  { id: 'ACC-006', name: 'AirPods Pro 2nd Gen', category: 'Навушники', purchase_price: 6000, wholesale_price: 7000, retail_price: 7990, stock: 2 },
  { id: 'APL-007', name: 'Apple Watch Ultra 2', category: 'Смарт-годинники', purchase_price: 18000, wholesale_price: 21000, retail_price: 23990, stock: 1 },
  { id: 'SAM-008', name: 'Samsung Galaxy Buds3 Pro', category: 'Навушники', purchase_price: 5500, wholesale_price: 6500, retail_price: 7490, stock: 0 }
])

// Мокові дані для історії руху (для обраного товару)
const movementHistory = ref([
  { id: 1, date: '2026-05-27', type: 'Продаж', qty: -1, order: 'ORD-0142', balance: 11 },
  { id: 2, date: '2026-05-25', type: 'Надходження', qty: 5, order: 'PO-0041', balance: 12 },
  { id: 3, date: '2026-05-23', type: 'Продаж', qty: -2, order: 'ORD-0138', balance: 7 },
  { id: 4, date: '2026-05-15', type: 'Надходження', qty: 10, order: 'PO-0039', balance: 9 }
])

const categories = ['Всі', 'Смартфони', 'Ноутбуки', 'Планшети', 'Телевізори', 'Навушники', 'Смарт-годинники', 'Аксесуари']
const selectedCategory = ref('Всі')
const searchQuery = ref('')

// Стан бокової панелі
const selectedProduct = ref(null)
const activePanelTab = ref('edit') // 'edit' або 'history'

// Фільтрація товарів
const filteredProducts = computed(() => {
  return products.value.filter(p => {
    const matchesCategory = selectedCategory.value === 'Всі' || p.category === selectedCategory.value
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          p.id.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesCategory && matchesSearch
  })
})

const getStockClass = (stock) => {
  if (stock > 5) return 'stock-high'
  if (stock > 0) return 'stock-low'
  return 'stock-empty'
}

const openPanel = (product) => {
  selectedProduct.value = { ...product }
  activePanelTab.value = 'edit'
}

const closePanel = () => {
  selectedProduct.value = null
}

const savePrices = () => {
  // Тут буде логіка збереження в стор/базу
  const index = products.value.findIndex(p => p.id === selectedProduct.value.id)
  if (index !== -1) {
    products.value[index] = { ...selectedProduct.value }
  }
  closePanel()
}
</script>

<template>
  <div class="warehouses-view">
    <header class="warehouse-header">
      <h1>Склади — Номенклатура</h1>
    </header>
    <div class="filters-section">
      <div class="search-box">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input v-model="searchQuery" type="text" placeholder="Пошук..." />
      </div>
      
      <div class="categories-scroll">
        <button 
          v-for="cat in categories" 
          :key="cat"
          class="category-pill"
          :class="{ active: selectedCategory === cat }"
          @click="selectedCategory = cat"
        >
          {{ cat }}
        </button>
      </div>
    </div>

    <div class="table-container">
      <table class="inventory-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>НАЗВА</th>
            <th>КАТЕГОРІЯ</th>
            <th>ЗАКУП. ЦІНА</th>
            <th>ОПТ. ЦІНА</th>
            <th>РОЗДР. ЦІНА</th>
            <th>ЗАЛИШОК</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in filteredProducts" :key="product.id" @click="openPanel(product)" class="clickable-row">
            <td class="text-muted text-sm">{{ product.id }}</td>
            <td class="font-medium">{{ product.name }}</td>
            <td><span class="category-badge">{{ product.category }}</span></td>
            <td class="font-medium">{{ product.purchase_price.toLocaleString('uk-UA') }} ₴</td>
            <td class="font-medium">{{ product.wholesale_price.toLocaleString('uk-UA') }} ₴</td>
            <td class="font-medium">{{ product.retail_price.toLocaleString('uk-UA') }} ₴</td>
            <td>
              <span class="stock-badge" :class="getStockClass(product.stock)">
                {{ product.stock }} шт
              </span>
            </td>
            <td class="text-right text-muted">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="panel-overlay" :class="{ 'is-open': selectedProduct }" @click.self="closePanel">
      <aside class="side-panel" :class="{ 'is-open': selectedProduct }">
        <template v-if="selectedProduct">
          <div class="panel-header">
            <div>
              <p class="panel-sku">{{ selectedProduct.id }}</p>
              <h2 class="panel-title">{{ selectedProduct.name }}</h2>
            </div>
            <button class="close-btn" @click="closePanel">✕</button>
          </div>

          <div class="panel-tabs">
            <button 
              class="tab-btn" 
              :class="{ active: activePanelTab === 'edit' }"
              @click="activePanelTab = 'edit'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
              Редагування
            </button>
            <button 
              class="tab-btn" 
              :class="{ active: activePanelTab === 'history' }"
              @click="activePanelTab = 'history'"
            >
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
                    <p class="price-val">{{ selectedProduct.purchase_price.toLocaleString('uk-UA') }} ₴</p>
                  </div>
                  <div>
                    <p class="price-label">Опт.</p>
                    <p class="price-val">{{ selectedProduct.wholesale_price.toLocaleString('uk-UA') }} ₴</p>
                  </div>
                  <div>
                    <p class="price-label">Роздр.</p>
                    <p class="price-val">{{ selectedProduct.retail_price.toLocaleString('uk-UA') }} ₴</p>
                  </div>
                </div>
              </div>

              <div class="edit-form">
                <p class="section-label">НОВІ ЦІНИ</p>
                <div class="form-group">
                  <label>Закупівельна ціна (₴)</label>
                  <input v-model="selectedProduct.purchase_price" type="number" />
                </div>
                <div class="form-group">
                  <label>Оптова ціна (₴)</label>
                  <input v-model="selectedProduct.wholesale_price" type="number" />
                </div>
                <div class="form-group">
                  <label>Роздрібна ціна (₴)</label>
                  <input v-model="selectedProduct.retail_price" type="number" />
                </div>
              </div>

              <div class="panel-actions">
                <BaseButton @click="savePrices" class="w-full">Зберегти ціни</BaseButton>
              </div>
            </div>

            <div v-else class="history-tab">
              <p class="section-label">ІСТОРІЯ РУХУ</p>
              <div class="history-list">
                <div v-for="record in movementHistory" :key="record.id" class="history-item">
                  <div class="history-main">
                    <span 
                      class="history-type" 
                      :class="record.type === 'Надходження' ? 'type-in' : 'type-out'"
                    >
                      {{ record.type }}
                    </span>
                    <span class="history-qty" :class="record.qty > 0 ? 'text-green' : 'text-red'">
                      {{ record.qty > 0 ? '+' : '' }}{{ record.qty }} шт
                    </span>
                  </div>
                  <div class="history-meta">
                    <span class="text-muted">{{ record.date }}</span>
                    <span class="text-muted">•</span>
                    <span class="text-muted">{{ record.order }}</span>
                    <span class="history-balance">Залишок: {{ record.balance }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.warehouses-view {
  padding: 32px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8fafc;
  position: relative;
}


.header {
  margin-bottom: 24px;
}

.store-selector {
  display: inline-flex;
  align-items: center;
  background: white;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  margin-bottom: 12px;
}

.status-dot {
  width: 8px;
  height: 8px;
  background-color: #10b981;
  border-radius: 50%;
  margin-right: 8px;
}

.store-selector select {
  border: none;
  font-size: 0.9rem;
  font-weight: 500;
  color: #1e293b;
  outline: none;
  background: transparent;
}

.header-titles h1 {
  font-size: 1.5rem;
  color: #0f172a;
  margin: 0;
}



.warehouse-header {
  margin-bottom: 24px;
}
.warehouse-header h1 {
  font-size: 1.6rem;
  color: #0f172a;
  margin: 0;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.store-selector select {
  border: none;
  font-size: 0.95rem;
  font-weight: 500;
  color: #1e293b;
  outline: none;
  background: transparent;
  cursor: pointer;
}

.header-title-row h1 {
  font-size: 1.6rem;
  color: #0f172a;
  margin: 0;
  font-weight: 700;
  letter-spacing: -0.02em;
}

/* Filters */
.filters-section {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: center;
}

.search-box {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 8px 12px;
  min-width: 200px;
}

.search-box svg {
  color: #94a3b8;
  margin-right: 8px;
}

.search-box input {
  border: none;
  outline: none;
  font-size: 0.95rem;
  width: 100%;
}

.categories-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px; 
}

.categories-scroll::-webkit-scrollbar {
  display: none;
}

.category-pill {
  padding: 8px 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.category-pill.active {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

/* Table */
.table-container {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow-x: auto;
  flex: 1;
}

.inventory-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.inventory-table th {
  text-align: left;
  padding: 16px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
  letter-spacing: 0.05em;
}

.inventory-table td {
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
  color: #1e293b;
  font-size: 0.95rem;
  vertical-align: middle;
}

.clickable-row {
  cursor: pointer;
  transition: background-color 0.2s;
}

.clickable-row:hover {
  background-color: #f8fafc;
}

.category-badge {
  background: #f1f5f9;
  color: #475569;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
}

.stock-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  display: inline-block;
}

.stock-high { background: #dcfce7; color: #166534; }
.stock-low { background: #fef3c7; color: #b45309; }
.stock-empty { background: #fee2e2; color: #991b1b; }

.font-medium { font-weight: 500; }
.text-muted { color: #94a3b8; }
.text-sm { font-size: 0.85rem; }
.text-right { text-align: right; }


.panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.4);
  z-index: 900;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.panel-overlay.is-open {
  opacity: 1;
  visibility: visible;
}

.side-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 420px;
  height: 100vh;
  background: white;
  box-shadow: -10px 0 25px rgba(0,0,0,0.1);
  z-index: 1000;
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

.side-panel.is-open {
  transform: translateX(0);
}

.panel-header {
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #f1f5f9;
}

.panel-sku {
  color: #64748b;
  font-size: 0.85rem;
  margin: 0 0 4px 0;
}

.panel-title {
  margin: 0;
  font-size: 1.2rem;
  color: #0f172a;
}

.panel-tabs {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 24px;
}

.tab-btn {
  flex: 1;
  padding: 16px 0;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 0.95rem;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.tab-btn.active {
  color: #2563eb;
  border-bottom-color: #2563eb;
}

.panel-content {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
}

.section-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
}


.current-prices-card {
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.prices-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.price-label {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0 0 4px 0;
}

.price-val {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.9rem;
  color: #334155;
  font-weight: 500;
}

.form-group input {
  padding: 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
}

.form-group input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.w-full { width: 100%; }
.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 14px 16px;
}

.history-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.history-type {
  font-size: 0.85rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
}

.type-in { background: #dcfce7; color: #166534; }
.type-out { background: #fee2e2; color: #991b1b; }

.history-qty {
  font-size: 1.1rem;
  font-weight: 700;
}

.text-green { color: #10b981; }
.text-red { color: #ef4444; }

.history-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
}

.history-balance {
  margin-left: auto;
  font-weight: 500;
  color: #334155;
}

@media (max-width: 1024px) {
  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 768px) {
  .warehouses-view {
    padding: 16px;
  }
  
  .side-panel {
    width: 100%; 
  }

  .prices-grid {
    grid-template-columns: 1fr;
  }
}
</style>