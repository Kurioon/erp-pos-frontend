export const TRANSACTION_TYPES = {
    SALE: 'продаж',
    RETURN: 'повернення',
    INCOME: 'прихід',
    EXPENSE: 'витрата'
  };
  
  export const TRANSACTION_TYPE_LABELS = {
    [TRANSACTION_TYPES.SALE]: 'Продаж',
    [TRANSACTION_TYPES.RETURN]: 'Повернення',
    [TRANSACTION_TYPES.INCOME]: 'Прихід',
    [TRANSACTION_TYPES.EXPENSE]: 'Витрата'
  };
  
  export const TRANSACTION_TYPE_CLASSES = {
    [TRANSACTION_TYPES.SALE]: 'type-sale',
    [TRANSACTION_TYPES.RETURN]: 'type-return',
    [TRANSACTION_TYPES.INCOME]: 'type-income',
    [TRANSACTION_TYPES.EXPENSE]: 'type-expense'
  };