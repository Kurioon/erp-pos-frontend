export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
  PREPAY: 'prepay',
  PAYMENT: 'payment',
  REFUND: 'refund',
  TRANSFER: 'transfer',
}

export const TRANSACTION_TYPE_LABELS = {
  [TRANSACTION_TYPES.INCOME]: 'Дохід',
  [TRANSACTION_TYPES.EXPENSE]: 'Витрата',
  [TRANSACTION_TYPES.PREPAY]: 'Часткова оплата',
  [TRANSACTION_TYPES.PAYMENT]: 'Повна оплата',
  [TRANSACTION_TYPES.REFUND]: 'Повернення',
  [TRANSACTION_TYPES.TRANSFER]: 'Переказ',
}

export const TRANSACTION_TYPE_CLASSES = {
  [TRANSACTION_TYPES.INCOME]: 'type-income',
  [TRANSACTION_TYPES.EXPENSE]: 'type-expense',
  [TRANSACTION_TYPES.PREPAY]: 'type-income',
  [TRANSACTION_TYPES.PAYMENT]: 'type-income', 
  [TRANSACTION_TYPES.REFUND]: 'type-expense',
  [TRANSACTION_TYPES.TRANSFER]: 'type-neutral',
}
