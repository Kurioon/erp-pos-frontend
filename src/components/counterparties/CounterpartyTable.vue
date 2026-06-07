<template>
  <div class="table-container">
    <table class="data-table">
      <thead>
        <tr>
          <th>Ім'я / Компанія</th>
          <th>Роль</th>
          <th>Телефон</th>
          <th>Email</th>
          <th class="actions-col">Дії</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="isLoading">
          <td colspan="5" class="text-center py-4 text-gray-500">Завантаження...</td>
        </tr>
        <tr v-else-if="counterparties.length === 0">
          <td colspan="5" class="text-center py-4 text-gray-500">Контрагентів не знайдено</td>
        </tr>
        <tr
          v-else
          v-for="item in counterparties"
          :key="item.id"
          @click="emit('row-click', item)"
          class="clickable-row"
        >
          <td class="font-medium">{{ item.name }}</td>
          <td>
            <BaseStatusBadge :status="getRoleStatus(item.role)" :text="getRoleLabel(item.role)" />
          </td>
          <td>{{ item.phone || '—' }}</td>
          <td>{{ item.email || '—' }}</td>
          <td class="actions-col" @click.stop>
            <div class="actions-wrapper">
              <button class="action-btn edit-btn" @click="emit('edit', item)">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                Редаг.
              </button>
              <button class="action-btn delete-btn" @click="emit('delete', item)">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                Видалити
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import BaseStatusBadge from '@/components/ui/BaseStatusBadge.vue'

const props = defineProps({
  counterparties: {
    type: Array,
    default: () => []
  },
  isLoading: Boolean
})

const emit = defineEmits(['row-click', 'edit', 'delete'])

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
.table-container {
  overflow-x: auto;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table th,
.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
}

.data-table th {
  background: #f8fafc;
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.clickable-row {
  cursor: pointer;
  transition: background-color 0.2s;
}

.clickable-row:hover {
  background-color: #f1f5f9;
}

.font-medium {
  font-weight: 500;
  color: #0f172a;
}

.actions-col {
  width: 100px;
  text-align: right;
  white-space: nowrap;
}

.actions-wrapper { display: flex; justify-content: flex-end; align-items: center; gap: 8px; flex-wrap: nowrap; }

.action-btn { flex-shrink: 0; display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
.edit-btn { background: transparent; border: 1px solid #cbd5e1; color: #475569; }
.edit-btn:hover { background-color: #f1f5f9; color: #0f172a; }
.delete-btn { background: transparent; border: 1px solid #fca5a5; color: #ef4444; }
.delete-btn:hover { background-color: #fef2f2; color: #b91c1c; }

.text-center {
  text-align: center;
}

.py-4 {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.text-gray-500 {
  color: #64748b;
}
</style>
