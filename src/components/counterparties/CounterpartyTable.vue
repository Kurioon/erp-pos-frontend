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
            <button class="action-btn edit-btn" @click="emit('edit', item)" title="Редагувати">
              <span class="icon">✏️</span>
            </button>
            <button class="action-btn delete-btn" @click="emit('delete', item)" title="Видалити">
              <span class="icon">🗑️</span>
            </button>
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

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  margin-left: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: #e2e8f0;
}

.delete-btn:hover {
  background: #fee2e2;
}

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
