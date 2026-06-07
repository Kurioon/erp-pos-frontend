<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Контрагенти</h1>
        <p class="page-subtitle">Управління покупцями та постачальниками</p>
      </div>
      <BaseButton @click="openCreateModal" class="add-btn">
        + Додати
      </BaseButton>
    </div>

    <div class="controls-bar">
      <FilterBar
        searchPlaceholder="Пошук (ім'я, телефон)..."
        :filters="filterConfig"
        :modelValue="filters.search"
        @update:search="onSearch"
        @update:filter="onFilter"
        class="filter-bar"
      />
    </div>

    <CounterpartyTable
      :counterparties="store.counterparties"
      :isLoading="store.isLoading"
      @row-click="handleRowClick"
      @edit="openEditModal"
      @delete="confirmDelete"
    />

    <div class="pagination-controls" v-if="store.pagination.next || store.pagination.previous">
      <BaseButton variant="secondary" @click="changePage(currentPage - 1)" :disabled="!store.pagination.previous">
        Попередня
      </BaseButton>
      <span class="page-info">Сторінка {{ currentPage }}</span>
      <BaseButton variant="secondary" @click="changePage(currentPage + 1)" :disabled="!store.pagination.next">
        Наступна
      </BaseButton>
    </div>

    <CounterpartyFormModal
      :is-open="isFormOpen"
      :counterparty="selectedForEdit"
      @close="closeFormModal"
      @saved="handleSaved"
    />

    <ConfirmModal
      :is-open="isConfirmOpen"
      :title="`Видалити контрагента ${selectedForDelete?.name}?`"
      message="Ця дія незворотна. Чи дійсно ви хочете продовжити?"
      confirmText="Видалити"
      confirmColor="danger"
      @confirm="handleDelete"
      @cancel="closeConfirmModal"
    />

    <CounterpartyDrawer
      :is-open="isDrawerOpen"
      :counterparty="selectedForDrawer"
      @close="isDrawerOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCounterpartiesStore } from '@/stores/counterparties'
import BaseButton from '@/components/ui/BaseButton.vue'
import FilterBar from '@/components/ui/FilterBar.vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'
import CounterpartyTable from '@/components/counterparties/CounterpartyTable.vue'
import CounterpartyFormModal from '@/components/counterparties/CounterpartyFormModal.vue'
import CounterpartyDrawer from '@/components/counterparties/CounterpartyDrawer.vue'

const store = useCounterpartiesStore()

const filters = ref({
  search: '',
  role: ''
})
const currentPage = ref(1)

const filterConfig = computed(() => [
  {
    key: 'role',
    label: 'Всі ролі',
    options: [
      { value: '', label: 'Всі ролі' },
      { value: 'buyer', label: 'Покупці' },
      { value: 'supplier', label: 'Постачальники' },
      { value: 'both', label: 'Обидва' }
    ]
  }
])

const isFormOpen = ref(false)
const selectedForEdit = ref(null)

const isConfirmOpen = ref(false)
const selectedForDelete = ref(null)

const isDrawerOpen = ref(false)
const selectedForDrawer = ref(null)

const loadData = () => {
  store.fetchList(currentPage.value, filters.value)
}

onMounted(() => {
  loadData()
})

const onSearch = (query) => {
  filters.value.search = query
  currentPage.value = 1
  loadData()
}

const onFilter = ({ key, value }) => {
  filters.value[key] = value
  currentPage.value = 1
  loadData()
}

const changePage = (page) => {
  currentPage.value = page
  loadData()
}

const openCreateModal = () => {
  selectedForEdit.value = null
  isFormOpen.value = true
}

const openEditModal = (item) => {
  selectedForEdit.value = item
  isFormOpen.value = true
}

const closeFormModal = () => {
  isFormOpen.value = false
  selectedForEdit.value = null
}

const handleSaved = () => {
  loadData()
}

const confirmDelete = (item) => {
  selectedForDelete.value = item
  isConfirmOpen.value = true
}

const closeConfirmModal = () => {
  isConfirmOpen.value = false
  selectedForDelete.value = null
}

const handleDelete = async () => {
  if (selectedForDelete.value) {
    await store.remove(selectedForDelete.value.id)
    closeConfirmModal()
    if (store.counterparties.length === 0 && currentPage.value > 1) {
      currentPage.value--
    }
    loadData()
  }
}

const handleRowClick = (item) => {
  selectedForDrawer.value = item
  isDrawerOpen.value = true
}
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px 0;
}

.page-subtitle {
  color: #64748b;
  margin: 0;
  font-size: 0.95rem;
}

.controls-bar {
  display: flex;
  gap: 16px;
  background: white;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.filter-bar {
  flex-grow: 1;
  margin-bottom: 0 !important;
}

.add-btn {
  padding: 8px 16px;
}
</style>
