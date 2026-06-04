<template>
  <div class="finance-view">
    <header class="page-header">
      <div class="header-info">
        <h1>Фінанси</h1>
        <p class="subtitle">Касова дисципліна та управління касами</p>
      </div>
    </header>

    <div class="tabs-navigation">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        class="tab-link" 
        :class="{ 'is-active': activeTabId === tab.id }"
        @click="activeTabId = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="tab-content-wrapper">
      <transition name="fade-slide" mode="out-in">
        <component :is="activeComponent" :key="activeTabId" />
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, shallowRef } from 'vue'


import TransactionJournal from '@/components/finance/TransactionJournal.vue'
import CashManagement from '@/components/finance/CashManagement.vue'

const tabs = [
  { id: 'journal', label: 'Журнал транзакцій', component: shallowRef(TransactionJournal) },
  { id: 'management', label: 'Керування касами', component: shallowRef(CashManagement) }
]

const activeTabId = ref('journal')


const activeComponent = computed(() => {
  const tab = tabs.find(t => t.id === activeTabId.value)
  return tab ? tab.component.value : tabs[0].component.value
})
</script>

<style scoped>
.finance-view {
  padding: 32px;
  background-color: #ffffff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.page-header {
  margin-bottom: 24px;
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

.tabs-navigation {
  display: flex;
  gap: 28px;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 28px;
}

.tab-link {
  background: transparent;
  border: none;
  padding: 0 0 12px 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  position: relative;
  transition: color 0.15s ease;
}

.tab-link:hover { color: #0f172a; }
.tab-link.is-active { color: #2563eb; }

.tab-link.is-active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #2563eb;
  border-radius: 2px;
}

.tab-content-wrapper {
  flex: 1;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(12px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}
</style>