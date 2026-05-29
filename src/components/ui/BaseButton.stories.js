import BaseButton from './BaseButton.vue'

export default {
  title: 'UI/BaseButton',
  component: BaseButton,
  tags: ['autodocs'],
  argTypes: {
    onClick: { action: 'clicked' },
  },
}

export const Default = {
  render: (args) => ({
    components: { BaseButton },
    setup() {
      return { args }
    },
    template: '<BaseButton v-bind="args">Оплатити замовлення</BaseButton>',
  }),
  args: {},
}

export const Disabled = {
  ...Default,
  args: {
    disabled: true,
  },
}

export const Loading = {
  ...Default,
  args: {
    loading: true,
  },
}
