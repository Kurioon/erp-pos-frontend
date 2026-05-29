import BaseInput from './BaseInput.vue'

export default {
  title: 'UI/BaseInput',
  component: BaseInput,
  tags: ['autodocs'],
}

export const Empty = {
  args: {
    label: 'Електронна пошта',
    modelValue: '',
    placeholder: 'example@domain.com',
  },
}

export const Filled = {
  args: {
    label: 'Електронна пошта',
    modelValue: 'kasiar@store.ua',
  },
}

export const Invalid = {
  args: {
    label: 'Пароль',
    type: 'password',
    modelValue: '123',
    error: 'Пароль надто короткий (мінімум 6 символів)',
  },
}

export const Disabled = {
  args: {
    label: 'Особиста каса (ID)',
    modelValue: 'CASH-001',
    disabled: true,
  },
}
