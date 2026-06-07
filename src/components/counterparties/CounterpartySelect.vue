<template>
  <div class="counterparty-select">
    <BaseSelect
      :label="label"
      :placeholder="placeholder"
      :modelValue="modelValue"
      :options="counterpartyOptions"
      :searchable="true"
      @update:modelValue="onUpdate"
      @search="onSearch"
    >
      <template #append>
        <button class="create-new-btn" @click.stop="openCreateModal">
          <span class="icon">+</span> Створити нового
        </button>
      </template>
    </BaseSelect>

    <CounterpartyFormModal
      :is-open="isFormOpen"
      @close="isFormOpen = false"
      @saved="handleSaved"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCounterpartiesStore } from '@/stores/counterparties'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import CounterpartyFormModal from '@/components/counterparties/CounterpartyFormModal.vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: 'Контрагент' },
  placeholder: { type: String, default: 'Оберіть контрагента...' },
  roleFilter: { type: String, default: '' } // 'buyer' or 'supplier'
})

const emit = defineEmits(['update:modelValue'])
const store = useCounterpartiesStore()
const isFormOpen = ref(false)

const loadData = (search = '') => {
  const filters = { search }
  if (props.roleFilter) {
    filters.role = props.roleFilter
  }
  store.fetchList(1, filters)
}

onMounted(() => {
  if (store.counterparties.length === 0) {
    loadData()
  }
})

const counterpartyOptions = computed(() => {
  let list = store.counterparties
  if (props.roleFilter) {
    list = list.filter(c => c.role === props.roleFilter || c.role === 'both')
  }
  return list.map(c => ({
    value: c.id,
    label: `${c.name} ${c.phone ? `(${c.phone})` : ''}`.trim()
  }))
})

const onUpdate = (val) => {
  emit('update:modelValue', val)
}

const onSearch = (query) => {
  loadData(query)
}

const openCreateModal = () => {
  isFormOpen.value = true
}

const handleSaved = async (createdObj) => {
  await loadData()
  if (createdObj && createdObj.id) {
    emit('update:modelValue', createdObj.id)
  } else if (store.counterparties.length > 0) {
    // Fallback if createdObj isn't available
    const newest = store.counterparties[0]
    emit('update:modelValue', newest.id)
  }
}
</script>

<style scoped>
.counterparty-select {
  position: relative;
}

.create-new-btn {
  width: 100%;
  padding: 10px 12px;
  background: #f8fafc;
  border: none;
  border-top: 1px solid #e2e8f0;
  text-align: left;
  font-size: 0.9rem;
  font-weight: 600;
  color: #3b82f6;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
}

.create-new-btn:hover {
  background: #eff6ff;
}

.icon {
  font-size: 1.1rem;
  line-height: 1;
}
</style>
