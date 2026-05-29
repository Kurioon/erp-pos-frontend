import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useRepairsStore = defineStore('repairs', () => {
  // Мокові дані, що точно відповідають моделі ServiceJob
  const jobs = ref([
    {
      id: 101,
      customer_name: 'Іван Петренко',
      customer_phone: '+380501234567',
      device_name: 'iPhone 11',
      description: 'Заміна акумулятора. Клієнт просив оригінал.',
      status: 'прийнято',
      storage_cell: 'R1',
      created_at: '2026-05-28T10:00:00Z',
    },
    {
      id: 102,
      customer_name: 'Марія Коваль',
      customer_phone: '+380679876543',
      device_name: 'MacBook Air M1',
      description: 'Чистка від пилу та заміна термопасти.',
      status: 'відремонтовано',
      storage_cell: 'S5',
      created_at: '2026-05-27T14:30:00Z',
    },
    {
      id: 103,
      customer_name: 'ТОВ "Альфа"',
      customer_phone: '+380441112233',
      device_name: 'Кавомашина Philips',
      description: 'Не гріє воду, видає помилку E05.',
      status: 'очікує компонентів',
      storage_cell: 'T2',
      created_at: '2026-05-29T09:15:00Z',
    },
  ])

  const jobsByStatus = computed(() => {
    return {
      прийнято: jobs.value.filter((job) => job.status === 'прийнято'),
      'очікує компонентів': jobs.value.filter((job) => job.status === 'очікує компонентів'),
      відремонтовано: jobs.value.filter((job) => job.status === 'відремонтовано'),
      видано: jobs.value.filter((job) => job.status === 'видано'),
    }
  })

  return {
    jobs,
    jobsByStatus,
  }
})
