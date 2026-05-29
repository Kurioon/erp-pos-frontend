import BaseLoader from './BaseLoader.vue'

export default {
  title: 'UI/BaseLoader',
  component: BaseLoader,
  tags: ['autodocs'],
}

export const Default = {
  args: {},
}

export const WithText = {
  args: {
    text: 'Завантаження товарів...',
    size: 32,
  },
}

export const CustomColor = {
  args: {
    text: 'Збереження транзакції...',
    color: '#10b981', 
    size: 40,
  },
}
