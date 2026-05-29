import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useProcurementStore = defineStore('procurement', () => {
  // Мокові дані 
  const orders = ref([
    {
      id: 201,
      supplier: 'ТОВ ТехноОпт',
      total_amount: 150000,
      status: 'Чернетка', 
      comment_ttn: '',
      created_at: '2026-05-29',
    },
    {
      id: 202,
      supplier: 'Global Parts',
      total_amount: 45000,
      status: 'Затверджено',
      comment_ttn: 'ТТН: 59000123456',
      created_at: '2026-05-28',
    },
  ])

  const draftOrders = computed(() => {
    return orders.value.filter((order) => order.status === 'Чернетка')
  })

  return {
    orders,
    draftOrders,
  }
})
