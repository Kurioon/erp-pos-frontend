import BaseCheckbox from './BaseCheckbox.vue'

export default {
  title: 'UI/BaseCheckbox',
  component: BaseCheckbox,
  tags: ['autodocs'],
}

export const Default = {
  args: {
    label: 'Активний товар',
    modelValue: false,
  },
}

export const Checked = {
  args: {
    label: 'Списати зі складу (-1)',
    modelValue: true,
  },
}

export const Disabled = {
  args: {
    label: 'Недоступно для вибору',
    modelValue: false,
    disabled: true,
  },
}
