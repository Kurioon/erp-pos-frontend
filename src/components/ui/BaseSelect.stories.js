import BaseSelect from './BaseSelect.vue'

const mockOptions = [
  { value: 'UAH', label: 'Гривня (UAH)' },
  { value: 'USD', label: 'Долар (USD)' },
  { value: 'EUR', label: 'Євро (EUR)' }
]

export default {
  title: 'UI/BaseSelect',
  component: BaseSelect,
  tags: ['autodocs'],
}

export const Default = {
  args: {
    label: 'Валюта каси',
    placeholder: 'Оберіть валюту',
    options: mockOptions,
    modelValue: '',
  },
}

export const Selected = {
  args: {
    label: 'Основний склад',
    options: [
      { value: 'wh-1', label: 'Головний склад (Київ)' },
      { value: 'wh-2', label: 'Точка видачі (Ужгород)' }
    ],
    modelValue: 'wh-1',
  },
}

export const Invalid = {
  args: {
    label: 'Касовий апарат',
    options: [{ value: '1', label: 'Каса #1 (Термінал)' }],
    modelValue: '',
    error: 'Необхідно обрати активну касу для проведення транзакції',
  },
}

export const Disabled = {
  args: {
    label: 'Обмежений склад',
    options: mockOptions,
    modelValue: 'UAH',
    disabled: true,
  },
}