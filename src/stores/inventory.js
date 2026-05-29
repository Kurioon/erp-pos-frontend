import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useInventoryStore = defineStore('inventory', () => {
  // Мокові дані, що точно відповідають моделям Product та WarehouseStock
  const items = ref([
    {
      id: 1,
      sku: 'LAP-001',
      title: 'Ноутбук Lenovo ThinkPad T14',
      retail_price: 35000,
      quantity: 5,
      warehouse_name: 'Головний склад',
    },
    {
      id: 2,
      sku: 'PHN-002',
      title: 'Смартфон Apple iPhone 13 Pro',
      retail_price: 42000,
      quantity: 2,
      warehouse_name: 'Магазин Центр',
    },
    {
      id: 3,
      sku: 'ACC-003',
      title: 'Кабель Type-C to Type-C (1m)',
      retail_price: 350,
      quantity: 0, 
      warehouse_name: 'Головний склад',
    },
  ])

  const fetchInventory = async () => {
    // items.value = await api.get('/inventory')
    console.log('Fetching inventory...')
  }

  return {
    items,
    fetchInventory,
  }
})
