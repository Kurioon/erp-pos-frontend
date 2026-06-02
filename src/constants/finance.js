export const TRANSACTION_TYPES = {
  SALE: 'sale',
  PAYMENT: 'payment',
  PREPAY: 'prepay',
  REFUND: 'refund',
  RETURN: 'return',
  INCOME: 'income',
  EXPENSE: 'expense',
}

export const TRANSACTION_TYPE_LABELS = {
  [TRANSACTION_TYPES.SALE]: 'Продаж',
  [TRANSACTION_TYPES.PAYMENT]: 'Оплата',
  [TRANSACTION_TYPES.PREPAY]: 'Передоплата',
  [TRANSACTION_TYPES.REFUND]: 'Повернення',
  [TRANSACTION_TYPES.RETURN]: 'Повернення',
  [TRANSACTION_TYPES.INCOME]: 'Внесення',
  [TRANSACTION_TYPES.EXPENSE]: 'Видача',
}

export const TRANSACTION_TYPE_CLASSES = {
  [TRANSACTION_TYPES.SALE]: 'type-income',
  [TRANSACTION_TYPES.PAYMENT]: 'type-income',
  [TRANSACTION_TYPES.PREPAY]: 'type-income',
  [TRANSACTION_TYPES.INCOME]: 'type-income',
  [TRANSACTION_TYPES.REFUND]: 'type-expense',
  [TRANSACTION_TYPES.RETURN]: 'type-expense',
  [TRANSACTION_TYPES.EXPENSE]: 'type-expense',
}
