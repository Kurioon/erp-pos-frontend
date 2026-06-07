<template>
  <div class="admin-view">
    <header class="admin-header">
      <div class="header-title-row">
        <div>
          <h1>Співробітники</h1>
          <p class="subtitle">Управління доступом та ролями користувачів мережі</p>
        </div>
        <div class="header-actions">
          <BaseButton variant="primary" @click="isUserModalOpen = true">
            + Додати користувача
          </BaseButton>
        </div>
      </div>
    </header>

    <div class="users-table-container">
      <table class="users-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Ім'я</th>
            <th>Роль</th>
            <th>Статус</th>
            <th>Дата реєстрації</th>
            <th class="text-right">Дії</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoading">
            <td colspan="6" class="text-center py-4">
              <BaseLoader />
            </td>
          </tr>
          <tr v-else-if="users.length === 0">
            <td colspan="6" class="text-center py-4 text-muted">Немає користувачів</td>
          </tr>
          <tr v-for="user in users" :key="user.id" :class="{ 'user-inactive': !user.is_active }">
            <td class="font-medium">{{ user.email }}</td>
            <td>{{ user.name }}</td>
            <td>
              <BaseStatusBadge :status="user.role === 'admin' ? 'paid' : 'draft'">
                {{ user.role === 'admin' ? 'Адміністратор' : 'Продавець' }}
              </BaseStatusBadge>
            </td>
            <td>
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  :checked="user.is_active" 
                  @change="toggleUserStatus(user)"
                  :disabled="isUpdating === user.id"
                >
                <span class="slider round"></span>
              </label>
            </td>
            <td class="text-muted">{{ formatDate(user.date_joined) }}</td>
            <td class="actions-cell">
              <BaseSelect
                v-model="user.role"
                :options="roleOptions"
                @change="updateUserRole(user)"
                :disabled="isUpdating === user.id"
                class="role-select"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <UserFormModal 
      v-if="isUserModalOpen" 
      @close="isUserModalOpen = false" 
      @created="fetchUsers"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/axios'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseLoader from '@/components/ui/BaseLoader.vue'
import BaseStatusBadge from '@/components/ui/BaseStatusBadge.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import UserFormModal from '@/components/admin/UserFormModal.vue'

const users = ref([])
const isLoading = ref(false)
const isUpdating = ref(null)
const isUserModalOpen = ref(false)

const roleOptions = [
  { value: 'seller', label: 'Продавець' },
  { value: 'admin', label: 'Адміністратор' }
]

const fetchUsers = async () => {
  isLoading.value = true
  try {
    const res = await api.get('/users/')
    users.value = res.data.results ? res.data.results : res.data
  } catch (error) {
    console.error('Failed to fetch users:', error)
  } finally {
    isLoading.value = false
  }
}

const toggleUserStatus = async (user) => {
  const newStatus = !user.is_active
  isUpdating.value = user.id
  try {
    await api.patch(`/users/${user.id}/`, { is_active: newStatus })
    user.is_active = newStatus
  } catch (error) {
    console.error('Failed to toggle user status:', error)
    // Revert visually if failed
    user.is_active = !newStatus
  } finally {
    isUpdating.value = null
  }
}

const updateUserRole = async (user) => {
  isUpdating.value = user.id
  try {
    await api.patch(`/users/${user.id}/`, { role: user.role })
  } catch (error) {
    console.error('Failed to update user role:', error)
  } finally {
    isUpdating.value = null
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '—'
  const d = new Date(dateString)
  return d.toLocaleDateString('uk-UA')
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.admin-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.header-title-row h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px 0;
}

.subtitle {
  color: #64748b;
  margin: 0;
  font-size: 0.95rem;
}

.users-table-container {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: visible; /* Changed from hidden to prevent dropdown cutoff */
}

/* Ensure border radius is applied to the table header since container doesn't clip */
.users-table th:first-child {
  border-top-left-radius: 12px;
}
.users-table th:last-child {
  border-top-right-radius: 12px;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th,
.users-table td {
  padding: 16px 20px;
  text-align: left;
  border-bottom: 1px solid #f1f5f9;
}

.users-table th {
  background-color: #f8fafc;
  font-weight: 600;
  font-size: 0.85rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.users-table td {
  font-size: 0.95rem;
  color: #334155;
}

.users-table tbody tr:last-child td {
  border-bottom: none;
}

.user-inactive td {
  opacity: 0.6;
}

.font-medium {
  font-weight: 500;
}

.text-muted {
  color: #64748b;
}

.text-right {
  text-align: right;
}

.text-center {
  text-align: center;
}

.py-4 {
  padding-top: 2rem !important;
  padding-bottom: 2rem !important;
}

.actions-cell {
  display: flex;
  justify-content: flex-end;
}

.role-select {
  width: 140px;
}

/* Toggle Switch Styles */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e1;
  transition: .3s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .3s;
}

input:checked + .slider {
  background-color: #10b981;
}

input:focus + .slider {
  box-shadow: 0 0 1px #10b981;
}

input:checked + .slider:before {
  transform: translateX(20px);
}

.slider.round {
  border-radius: 24px;
}

.slider.round:before {
  border-radius: 50%;
}

input:disabled + .slider {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
