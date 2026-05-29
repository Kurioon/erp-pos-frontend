import BaseStatusBadge from './BaseStatusBadge.vue'

export default {
  title: 'UI/BaseStatusBadge',
  component: BaseStatusBadge,
  tags: ['autodocs'],
}

export const Draft = {
  args: {
    text: 'Чернетка',
    type: 'default',
  },
}

export const InProgress = {
  args: {
    text: 'В роботі (Ремонт)',
    type: 'info',
  },
}

export const PartiallyPaid = {
  args: {
    text: 'Частково оплачено',
    type: 'warning',
  },
}

export const Completed = {
  args: {
    text: 'Завершено / Оплачено',
    type: 'success',
  },
}

export const CanceledOrInvalid = {
  args: {
    text: 'Помилка / Скасовано',
    type: 'danger',
  },
}
