<template>
  <div class="table-container">
    <table class="inventory-table">
      <thead>
        <tr>
          <th>КОД / SKU</th>
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
        <tr
          v-for="product in props.products"
          :key="product.id"
          @click="emit('select-product', product)"
          class="clickable-row"
        >
          <td class="text-muted text-sm font-mono">{{ product.code || product.id }}</td>
          <td class="font-medium text-dark">{{ product.name }}</td>
          <td><span class="category-badge">{{ product.category }}</span></td>
          <td class="font-medium">{{ formatCurrency(product.purchase_price, 'UAH') }}</td>
          <td class="font-medium">{{ formatCurrency(product.wholesale_price, 'UAH') }}</td>
          <td class="font-medium">{{ formatCurrency(product.retail_price, 'UAH') }}</td>
          <td>
            <span class="stock-badge" :class="getStockClass(product.stock)">
              {{ product.stock }}
            </span>
          </td>
          <td class="text-right text-muted">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { formatCurrency } from '@/utils/formatters'

const props = defineProps({
  products: { type: Array, required: true }
})

const emit = defineEmits(['select-product'])

const getStockClass = (stock) => {
  if (stock > 5) return 'stock-high'
  if (stock > 0) return 'stock-low'
  return 'stock-empty'
}
</script>

<style scoped>
.table-container { background: white; border-radius: 12px; border: 1px solid #e2e8f0; overflow-x: auto; }
.inventory-table { width: 100%; border-collapse: collapse; min-width: 800px; }
.inventory-table th { text-align: left; padding: 16px; font-size: 0.75rem; font-weight: 600; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; background: #f8fafc; letter-spacing: 0.05em; }
.inventory-table td { padding: 16px; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-size: 0.95rem; vertical-align: middle; }
.text-dark { color: #0f172a; }
.category-badge { background: #f1f5f9; color: #475569; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 500; }
.stock-badge { padding: 4px 10px; border-radius: 6px; font-size: 0.85rem; font-weight: 600; display: inline-block; }
.stock-high { background: #dcfce7; color: #166534; }
.stock-low { background: #fef3c7; color: #b45309; }
.stock-empty { background: #fee2e2; color: #991b1b; }
.font-medium { font-weight: 500; }
.text-muted { color: #94a3b8; }
.text-sm { font-size: 0.85rem; }
.text-right { text-align: right; }
.font-mono { font-family: monospace; }
.clickable-row {
  cursor: pointer;
  transition: all 0.2s ease;
}
.clickable-row:hover {
  background-color: #f8fafc;
}
.clickable-row:hover td,
.clickable-row:active td {
  color: #2563eb !important;
}
.clickable-row:hover td .text-muted,
.clickable-row:hover td .text-dark,
.clickable-row:active td .text-muted,
.clickable-row:active td .text-dark {
  color: #2563eb !important;
}
</style>
