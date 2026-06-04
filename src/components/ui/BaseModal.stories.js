import BaseModal from './BaseModal.vue'
import BaseButton from './BaseButton.vue'

export default {
  title: 'UI/BaseModal',
  component: BaseModal,
  tags: ['autodocs'],
}

export const Default = {
  render: (args) => ({
    components: { BaseModal, BaseButton }, 
    setup() {
      return { args }
    },
    template: `
      <BaseModal v-bind="args">
        <p>Введіть дані для створення закупівлі або внесення передоплати.</p>
        
        <template #footer>
          <BaseButton>Скасувати</BaseButton>
          <BaseButton>Підтвердити</BaseButton>
        </template>
      </BaseModal>
    `,
  }),
  args: {
    isOpen: true,
    title: 'Оформлення передоплати',
  },
}
